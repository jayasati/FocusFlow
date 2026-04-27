import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { requireDbUserId } from "@/features/tasks/server/queries";
import {
  exchangeCodeForToken,
  fetchGithubProfile,
  syncGithub,
} from "@/lib/integrations/github";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "gh_oauth_state";

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

function back(error?: string): NextResponse {
  const url = new URL("/integrations", appUrl());
  if (error) url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

export async function GET(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.redirect(new URL("/sign-in", appUrl()));

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const errorParam = req.nextUrl.searchParams.get("error");
  if (errorParam) return back(`GitHub: ${errorParam}`);
  if (!code || !state) return back("Missing code or state");

  const jar = await cookies();
  const stored = jar.get(STATE_COOKIE)?.value;
  jar.delete(STATE_COOKIE);
  if (!stored || stored !== state) return back("State mismatch");

  let token: string;
  try {
    token = await exchangeCodeForToken(code);
  } catch (e) {
    return back(e instanceof Error ? e.message : "Token exchange failed");
  }

  const dbUserId = await requireDbUserId();

  // Fetch profile so we can show login/avatar in the UI even before the first
  // events sync. If this fails we still save the token — sync will retry later.
  let profileMeta: { login: string; avatarUrl: string | null; name: string | null } | null = null;
  try {
    const profile = await fetchGithubProfile(token);
    profileMeta = {
      login: profile.login,
      avatarUrl: profile.avatar_url,
      name: profile.name,
    };
  } catch {
    /* ignore — sync will retry */
  }

  await db.integration.upsert({
    where: { userId_provider: { userId: dbUserId, provider: "GITHUB" } },
    update: {
      accessToken: token,
      metadata: profileMeta ?? {},
    },
    create: {
      userId: dbUserId,
      provider: "GITHUB",
      accessToken: token,
      metadata: profileMeta ?? {},
    },
  });

  // Initial events sync. Failures are swallowed and surfaced as syncError in
  // metadata so the UI can show "Couldn't sync, try again" without breaking
  // the connection.
  try {
    await syncGithub(dbUserId);
  } catch {
    /* syncGithub records its own error into metadata */
  }

  return NextResponse.redirect(new URL("/integrations?connected=github", appUrl()));
}
