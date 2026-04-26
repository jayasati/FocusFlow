import { z } from "zod";

// Mood enum mapping (1..5) per Phase 6 spec.
export const MOODS = [
  {
    value: 1,
    key: "SAD",
    label: "Sad",
    emoji: "😢",
    color: "#3b82f6",
    badge: "bg-kpi-blue/15 text-kpi-blue border border-kpi-blue/30",
  },
  {
    value: 2,
    key: "CALM",
    label: "Calm",
    emoji: "🧘",
    color: "#14b8a6",
    badge: "bg-teal-500/15 text-teal-400 border border-teal-500/30",
  },
  {
    value: 3,
    key: "NEUTRAL",
    label: "Neutral",
    emoji: "😐",
    color: "#eab308",
    badge: "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
  },
  {
    value: 4,
    key: "HAPPY",
    label: "Happy",
    emoji: "😊",
    color: "#22c55e",
    badge: "bg-kpi-green/15 text-kpi-green border border-kpi-green/30",
  },
  {
    value: 5,
    key: "EXCITED",
    label: "Excited",
    emoji: "🤩",
    color: "#ec4899",
    badge: "bg-pink-500/15 text-pink-400 border border-pink-500/30",
  },
] as const;

export type MoodValue = 1 | 2 | 3 | 4 | 5;

export function moodMeta(value: number | null | undefined) {
  return MOODS.find((m) => m.value === value) ?? null;
}

// Accept absolute URLs (http(s)://...) OR same-origin paths starting with "/"
// (the dev /api/upload returns the latter as `/uploads/<id>.<ext>`).
const imageUrlField = z
  .string()
  .max(2048)
  .refine((s) => /^(https?:\/\/|\/)/.test(s), {
    message: "Must be an http(s) URL or a path starting with /",
  });

export const createEntrySchema = z.object({
  title: z.string().max(160).optional().nullable(),
  content: z.string().min(1, "Write something").max(20000),
  mood: z.number().int().min(1).max(5).optional().nullable(),
  imageUrl: imageUrlField.optional().nullable(),
  tags: z.array(z.string().min(1).max(40)).default([]),
});
export type CreateEntryInput = z.input<typeof createEntrySchema>;

export const updateEntrySchema = createEntrySchema.extend({
  id: z.string().min(1),
});
export type UpdateEntryInput = z.input<typeof updateEntrySchema>;

// Approx writing time = words / 200 wpm (rounded up to nearest minute).
export function wordsOf(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
export function timeWritingMin(s: string): number {
  return Math.max(0, Math.ceil(wordsOf(s) / 200));
}
