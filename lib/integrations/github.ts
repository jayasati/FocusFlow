import "server-only";
import { startOfDay, subDays, format } from "date-fns";
import { db } from "@/lib/db";

// ─── Config ──────────────────────────────────────────────────────────────────
const AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const TOKEN_URL = "https://github.com/login/oauth/access_token";
const API_BASE = "https://api.github.com";

// `read:user` lets us identify the connected GitHub account.
// `repo` lets us read commit data including private repos. Switch to
// `public_repo` if you only want public-repo activity.
const SCOPES = ["read:user", "repo"];

export type GithubMetadata = {
  login: string;
  avatarUrl: string | null;
  name: string | null;
  commitsThisWeek: number;
  prsThisWeek: number;
  commitsByDay: Record<string, number>; // yyyy-MM-dd -> count
  syncedAt: string; // ISO timestamp
  syncError?: string;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing ${name} env var — set it in .env to enable GitHub OAuth`,
    );
  }
  return v;
}

function appUrl(): string {
  // NEXT_PUBLIC_APP_URL falls back to localhost in dev so the dev loop works
  // before the user explicitly sets it.
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function githubRedirectUri(): string {
  return `${appUrl()}/api/integrations/github/callback`;
}

export function buildAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv("GITHUB_CLIENT_ID"),
    redirect_uri: githubRedirectUri(),
    scope: SCOPES.join(" "),
    state,
    allow_signup: "false",
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

// ─── Token exchange ──────────────────────────────────────────────────────────
export async function exchangeCodeForToken(code: string): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: requireEnv("GITHUB_CLIENT_ID"),
      client_secret: requireEnv("GITHUB_CLIENT_SECRET"),
      code,
      redirect_uri: githubRedirectUri(),
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub token exchange failed: ${res.status}`);
  }
  const json = (await res.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };
  if (!json.access_token) {
    throw new Error(
      json.error_description ?? json.error ?? "GitHub returned no access_token",
    );
  }
  return json.access_token;
}

// ─── API calls ───────────────────────────────────────────────────────────────
type GithubProfile = {
  login: string;
  avatar_url: string | null;
  name: string | null;
};

export async function fetchGithubProfile(token: string): Promise<GithubProfile> {
  const res = await fetch(`${API_BASE}/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "FocusFlow",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub /user failed: ${res.status}`);
  }
  return (await res.json()) as GithubProfile;
}

// GraphQL v4 is the right tool for accurate contribution counts: it respects
// the token's scope (so commits in private repos show up when `repo` was
// granted) and returns a per-day calendar in a single round trip. The REST
// /users/:login/events feed is too lossy — it only mirrors a subset of public
// activity and lags behind real-time.
const GRAPHQL_QUERY = `query($from: DateTime!, $to: DateTime!) {
  viewer {
    login
    avatarUrl
    name
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      contributionCalendar {
        weeks {
          contributionDays { date contributionCount }
        }
      }
    }
  }
}`;

type GraphQLResponse = {
  data?: {
    viewer: {
      login: string;
      avatarUrl: string | null;
      name: string | null;
      contributionsCollection: {
        totalCommitContributions: number;
        totalPullRequestContributions: number;
        contributionCalendar: {
          weeks: {
            contributionDays: { date: string; contributionCount: number }[];
          }[];
        };
      };
    };
  };
  errors?: { message: string }[];
};

async function fetchGithubContributions(token: string): Promise<{
  login: string;
  avatarUrl: string | null;
  name: string | null;
  commitsThisWeek: number;
  prsThisWeek: number;
  commitsByDay: Record<string, number>;
}> {
  const now = new Date();
  const from = subDays(startOfDay(now), 6).toISOString();
  const to = now.toISOString();

  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "FocusFlow",
    },
    body: JSON.stringify({
      query: GRAPHQL_QUERY,
      variables: { from, to },
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`GitHub GraphQL failed: ${res.status}`);
  }
  const json = (await res.json()) as GraphQLResponse;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  const v = json.data?.viewer;
  if (!v) throw new Error("GitHub GraphQL returned no viewer");

  const commitsByDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    commitsByDay[format(subDays(startOfDay(now), i), "yyyy-MM-dd")] = 0;
  }
  for (const w of v.contributionsCollection.contributionCalendar.weeks) {
    for (const d of w.contributionDays) {
      if (commitsByDay[d.date] !== undefined) {
        commitsByDay[d.date] = d.contributionCount;
      }
    }
  }

  return {
    login: v.login,
    avatarUrl: v.avatarUrl,
    name: v.name,
    commitsThisWeek: v.contributionsCollection.totalCommitContributions,
    prsThisWeek: v.contributionsCollection.totalPullRequestContributions,
    commitsByDay,
  };
}

// ─── High-level sync ─────────────────────────────────────────────────────────
export async function syncGithub(userId: string): Promise<void> {
  const row = await db.integration.findUnique({
    where: { userId_provider: { userId, provider: "GITHUB" } },
  });
  if (!row) throw new Error("GitHub is not connected");

  const token = row.accessToken;
  let metadata: GithubMetadata;
  try {
    const data = await fetchGithubContributions(token);
    metadata = {
      login: data.login,
      avatarUrl: data.avatarUrl,
      name: data.name,
      commitsThisWeek: data.commitsThisWeek,
      prsThisWeek: data.prsThisWeek,
      commitsByDay: data.commitsByDay,
      syncedAt: new Date().toISOString(),
    };
  } catch (e) {
    metadata = {
      login: (row.metadata as { login?: string } | null)?.login ?? "",
      avatarUrl:
        (row.metadata as { avatarUrl?: string } | null)?.avatarUrl ?? null,
      name: (row.metadata as { name?: string } | null)?.name ?? null,
      commitsThisWeek: 0,
      prsThisWeek: 0,
      commitsByDay: {},
      syncedAt: new Date().toISOString(),
      syncError: e instanceof Error ? e.message : "Sync failed",
    };
  }

  await db.integration.update({
    where: { userId_provider: { userId, provider: "GITHUB" } },
    data: { metadata, lastSyncedAt: new Date() },
  });
}
