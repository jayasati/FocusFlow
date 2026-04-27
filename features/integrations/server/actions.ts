"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireDbUserId } from "@/features/tasks/server/queries";
import { syncLeetcode } from "@/lib/integrations/leetcode";
import { syncGithub } from "@/lib/integrations/github";

const ProviderEnum = z.enum(["GITHUB", "LEETCODE"]);

// GitHub uses real OAuth — the dialog redirects the browser to
// /api/integrations/github/initiate. We keep this server action only so the
// type imports stay stable; calling it does nothing useful.
export async function connectGitHub() {
  // No-op: real flow goes through /api/integrations/github/initiate.
  return;
}

const connectLeetcodeSchema = z.object({
  username: z.string().min(1).max(80),
});
export async function connectLeetcode(input: { username: string }) {
  const data = connectLeetcodeSchema.parse(input);
  const userId = await requireDbUserId();
  await db.integration.upsert({
    where: { userId_provider: { userId, provider: "LEETCODE" } },
    update: { metadata: { username: data.username } },
    create: {
      userId,
      provider: "LEETCODE",
      accessToken: data.username,
      metadata: { username: data.username },
    },
  });
  // Initial sync — fetches real stats from LeetCode's public GraphQL.
  // Errors land in metadata.syncError and are surfaced in the UI.
  try {
    await syncLeetcode(userId);
  } catch {
    /* syncLeetcode records its own error */
  }
  revalidatePath("/integrations");
}

export async function disconnect(provider: z.infer<typeof ProviderEnum>) {
  const p = ProviderEnum.parse(provider);
  const userId = await requireDbUserId();
  await db.integration.deleteMany({ where: { userId, provider: p } });
  revalidatePath("/integrations");
}

export async function refreshSync(provider: z.infer<typeof ProviderEnum>) {
  const p = ProviderEnum.parse(provider);
  const userId = await requireDbUserId();
  if (p === "GITHUB") {
    await syncGithub(userId);
  } else {
    await syncLeetcode(userId);
  }
  revalidatePath("/integrations");
}
