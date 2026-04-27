import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { buildAuthorizeUrl } from "@/lib/integrations/github";

export const dynamic = "force-dynamic";

const STATE_COOKIE = "gh_oauth_state";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(
      new URL(
        "/sign-in",
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      ),
    );
  }

  const state = randomBytes(24).toString("hex");
  let url: string;
  try {
    url = buildAuthorizeUrl(state);
  } catch (e) {
    // Missing env (GITHUB_CLIENT_ID / SECRET) — show a friendly hint instead
    // of a 500 dump.
    const message =
      e instanceof Error
        ? e.message
        : "GitHub OAuth env vars are not configured";
    return NextResponse.redirect(
      new URL(
        `/integrations?error=${encodeURIComponent(message)}`,
        process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      ),
    );
  }

  const jar = await cookies();
  jar.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 min
  });
  return NextResponse.redirect(url);
}
