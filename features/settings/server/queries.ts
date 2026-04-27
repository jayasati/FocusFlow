import "server-only";
import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { requireDbUserId } from "@/features/tasks/server/queries";
import {
  DEFAULT_NOTIFICATION_PREFS,
  notificationPrefsSchema,
  type NotificationPrefs,
} from "@/features/settings/schema";

export type SettingsProfile = {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  imageUrl: string | null;
  notifications: NotificationPrefs;
};

export const getSettingsProfile = cache(
  async (): Promise<SettingsProfile> => {
    const cu = await currentUser();
    const userId = await requireDbUserId();
    const local = await db.user.findUnique({
      where: { id: userId },
      select: { bio: true, notificationPrefs: true },
    });
    const parsed = notificationPrefsSchema.safeParse(
      local?.notificationPrefs ?? {},
    );
    const notifications = parsed.success
      ? parsed.data
      : DEFAULT_NOTIFICATION_PREFS;
    return {
      firstName: cu?.firstName ?? "",
      lastName: cu?.lastName ?? "",
      email: cu?.primaryEmailAddress?.emailAddress ?? "",
      bio: local?.bio ?? "",
      imageUrl: cu?.imageUrl ?? null,
      notifications,
    };
  },
);
