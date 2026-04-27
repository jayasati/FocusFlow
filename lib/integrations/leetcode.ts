import "server-only";
import { startOfDay, subDays } from "date-fns";
import { db } from "@/lib/db";

const ENDPOINT = "https://leetcode.com/graphql";

export type LeetcodeMetadata = {
  username: string;
  easy: number;
  medium: number;
  hard: number;
  total: number;
  weekSolved: number;
  currentStreak: number;
  ranking?: number | null;
  syncedAt: string;
  syncError?: string;
};

const STATS_QUERY = `
query userPublicProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile { ranking }
    submitStats {
      acSubmissionNum { difficulty count }
    }
  }
  recentAcSubmissionList(username: $username, limit: 50) {
    timestamp
  }
}`;

type GqlResponse = {
  data?: {
    matchedUser: {
      username: string;
      profile: { ranking: number | null } | null;
      submitStats: {
        acSubmissionNum: { difficulty: string; count: number }[];
      } | null;
    } | null;
    recentAcSubmissionList: { timestamp: string }[] | null;
  };
  errors?: { message: string }[];
};

export async function fetchLeetcodeStats(username: string): Promise<{
  easy: number;
  medium: number;
  hard: number;
  total: number;
  weekSolved: number;
  currentStreak: number;
  ranking: number | null;
}> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "FocusFlow",
      Referer: "https://leetcode.com/",
    },
    body: JSON.stringify({
      query: STATS_QUERY,
      variables: { username },
      operationName: "userPublicProfile",
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`LeetCode GraphQL failed: ${res.status}`);
  }
  const json = (await res.json()) as GqlResponse;
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join("; "));
  }
  const matched = json.data?.matchedUser;
  if (!matched) {
    throw new Error(`No LeetCode user found for "${username}"`);
  }

  const buckets = matched.submitStats?.acSubmissionNum ?? [];
  const grab = (k: string) =>
    buckets.find((b) => b.difficulty.toLowerCase() === k)?.count ?? 0;
  const easy = grab("easy");
  const medium = grab("medium");
  const hard = grab("hard");

  // weekSolved + currentStreak come from recentAcSubmissionList (timestamp is
  // a unix-seconds string).
  const subs = (json.data?.recentAcSubmissionList ?? []).map((s) =>
    Number(s.timestamp) * 1000,
  );
  const now = Date.now();
  const weekCutoff = subDays(startOfDay(new Date(now)), 6).getTime();
  const weekSolved = subs.filter((t) => t >= weekCutoff).length;

  // Streak = consecutive days ending today (or yesterday) with at least one
  // accepted submission.
  const daySet = new Set(
    subs.map((t) =>
      startOfDay(new Date(t)).getTime(),
    ),
  );
  const today = startOfDay(new Date(now)).getTime();
  const yest = startOfDay(subDays(new Date(now), 1)).getTime();
  let cursor = daySet.has(today) ? today : daySet.has(yest) ? yest : null;
  let currentStreak = 0;
  while (cursor !== null && daySet.has(cursor)) {
    currentStreak++;
    cursor = startOfDay(subDays(new Date(cursor), 1)).getTime();
  }

  return {
    easy,
    medium,
    hard,
    total: easy + medium + hard,
    weekSolved,
    currentStreak,
    ranking: matched.profile?.ranking ?? null,
  };
}

export async function syncLeetcode(userId: string): Promise<void> {
  const row = await db.integration.findUnique({
    where: { userId_provider: { userId, provider: "LEETCODE" } },
  });
  if (!row) throw new Error("LeetCode is not connected");

  const username =
    (row.metadata as { username?: string } | null)?.username ??
    row.accessToken;
  if (!username) throw new Error("LeetCode integration is missing a username");

  let metadata: LeetcodeMetadata;
  try {
    const stats = await fetchLeetcodeStats(username);
    metadata = {
      username,
      ...stats,
      syncedAt: new Date().toISOString(),
    };
  } catch (e) {
    metadata = {
      username,
      easy: 0,
      medium: 0,
      hard: 0,
      total: 0,
      weekSolved: 0,
      currentStreak: 0,
      ranking: null,
      syncedAt: new Date().toISOString(),
      syncError: e instanceof Error ? e.message : "Sync failed",
    };
  }

  await db.integration.update({
    where: { userId_provider: { userId, provider: "LEETCODE" } },
    data: { metadata, lastSyncedAt: new Date() },
  });
}
