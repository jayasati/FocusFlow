import { z } from "zod";

// 8 preset colors used across the avatar + dot fill + progress bar.
export const HABIT_COLORS = [
  "green",
  "blue",
  "purple",
  "orange",
  "red",
  "teal",
  "yellow",
  "pink",
] as const;
export type HabitColor = (typeof HABIT_COLORS)[number];

export const HABIT_COLOR_HEX: Record<HabitColor, string> = {
  green: "#22c55e",
  blue: "#3b82f6",
  purple: "#7c5cf6",
  orange: "#f59e0b",
  red: "#ef4444",
  teal: "#14b8a6",
  yellow: "#eab308",
  pink: "#ec4899",
};

// Common emoji set for the icon picker — keep it short.
export const HABIT_ICONS = [
  "🏃",
  "💧",
  "📖",
  "🧘",
  "🚫",
  "🌙",
  "✏️",
  "🌐",
  "💪",
  "🎯",
  "🍎",
  "💤",
  "🎵",
  "🧠",
  "📵",
  "🌱",
] as const;

export const FREQUENCIES = ["DAILY", "WEEKLY", "CUSTOM"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const KINDS = ["COUNT", "TIME"] as const;
export type Kind = (typeof KINDS)[number];

// Mon=0 ... Sun=6
export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export const createHabitSchema = z
  .object({
    name: z.string().min(1, "Required").max(80),
    description: z.string().max(200).optional().nullable(),
    icon: z.string().max(8).default("🌱"),
    color: z.enum(HABIT_COLORS).default("purple"),
    frequency: z.enum(FREQUENCIES).default("DAILY"),
    kind: z.enum(KINDS).default("COUNT"),
    /** TIME habits: minutes-per-day for DAILY/CUSTOM, minutes-per-week for WEEKLY. */
    targetMinutes: z.number().int().min(1).max(24 * 60).optional().nullable(),
    targetPerWeek: z.number().int().min(1).max(7).optional().nullable(),
    customDays: z.array(z.number().int().min(0).max(6)).default([]),
  })
  .superRefine((val, ctx) => {
    if (val.frequency === "WEEKLY" && (val.targetPerWeek ?? 0) < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["targetPerWeek"],
        message: "Pick a target",
      });
    }
    if (val.frequency === "CUSTOM" && val.customDays.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["customDays"],
        message: "Pick at least one day",
      });
    }
    if (val.kind === "TIME" && (val.targetMinutes ?? 0) < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["targetMinutes"],
        message: "Set a minutes target",
      });
    }
  });
export type CreateHabitInput = z.input<typeof createHabitSchema>;

/** Returns daily-minutes target for TIME habits — null for WEEKLY (target is per-week). */
export function dailyMinutesTarget(
  frequency: Frequency,
  targetMinutes: number | null,
): number | null {
  if (!targetMinutes) return null;
  if (frequency === "WEEKLY") return null;
  return targetMinutes;
}
