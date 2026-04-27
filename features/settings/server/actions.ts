"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { requireDbUserId } from "@/features/tasks/server/queries";
import {
  notificationPrefsSchema,
  profileSchema,
  type NotificationPrefs,
  type ProfileInput,
} from "@/features/settings/schema";

export async function updateProfile(input: ProfileInput) {
  const data = profileSchema.parse(input);
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const dbUserId = await requireDbUserId();

  const cc = await clerkClient();
  await cc.users.updateUser(clerkId, {
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
  });

  const fullName =
    [data.firstName, data.lastName].filter(Boolean).join(" ").trim() || null;

  await db.user.update({
    where: { id: dbUserId },
    data: {
      name: fullName,
      bio: data.bio || null,
    },
  });
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function updateNotificationPrefs(input: NotificationPrefs) {
  const data = notificationPrefsSchema.parse(input);
  const userId = await requireDbUserId();
  await db.user.update({
    where: { id: userId },
    data: { notificationPrefs: data },
  });
  revalidatePath("/settings");
}

export async function deleteAccount() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");
  const dbUserId = await requireDbUserId();
  // Cascade-delete all owned rows in our DB first (User.onDelete=Cascade on
  // every relation), then drop the Clerk identity.
  await db.user.delete({ where: { id: dbUserId } });
  const cc = await clerkClient();
  await cc.users.deleteUser(clerkId);
  redirect("/");
}
