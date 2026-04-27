import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().trim().max(80).optional().default(""),
  lastName: z.string().trim().max(80).optional().default(""),
  bio: z.string().trim().max(280).optional().default(""),
});
export type ProfileInput = z.input<typeof profileSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;

export const notificationPrefsSchema = z.object({
  desktop: z.boolean().default(true),
  email: z.boolean().default(false),
  sound: z.boolean().default(true),
});
export type NotificationPrefs = z.infer<typeof notificationPrefsSchema>;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  desktop: true,
  email: false,
  sound: true,
};
