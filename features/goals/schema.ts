import { z } from "zod";

export const CATEGORIES = [
  "HEALTH",
  "LEARNING",
  "CAREER",
  "FINANCE",
  "PERSONAL",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_META: Record<
  Category,
  { label: string; badge: string }
> = {
  HEALTH: {
    label: "Health",
    badge: "bg-primary/15 text-primary-soft",
  },
  LEARNING: {
    label: "Learning",
    badge: "bg-yellow-500/15 text-yellow-400",
  },
  CAREER: {
    label: "Career",
    badge: "bg-kpi-orange/15 text-kpi-orange",
  },
  FINANCE: {
    label: "Finance",
    badge: "bg-kpi-blue/15 text-kpi-blue",
  },
  PERSONAL: {
    label: "Personal",
    badge: "bg-kpi-green/15 text-kpi-green",
  },
};

export const GOAL_COLORS = [
  "purple",
  "green",
  "orange",
  "blue",
  "yellow",
  "teal",
  "pink",
  "red",
] as const;
export type GoalColor = (typeof GOAL_COLORS)[number];

export const GOAL_COLOR_GRADIENT: Record<GoalColor, string> = {
  purple: "linear-gradient(135deg, #7c3aed, #a855f7)",
  green: "linear-gradient(135deg, #16a34a, #22c55e)",
  orange: "linear-gradient(135deg, #ea580c, #f97316)",
  blue: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
  yellow: "linear-gradient(135deg, #ca8a04, #eab308)",
  teal: "linear-gradient(135deg, #0f766e, #14b8a6)",
  pink: "linear-gradient(135deg, #be185d, #ec4899)",
  red: "linear-gradient(135deg, #b91c1c, #ef4444)",
};

// Status derived from milestone completion (no separate column).
export const STATES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"] as const;
export type State = (typeof STATES)[number];

export const FILTERS = [
  "ALL",
  "IN_PROGRESS",
  "COMPLETED",
  "NOT_STARTED",
] as const;
export type Filter = (typeof FILTERS)[number];

export const SORTS = ["PRIORITY", "TARGET_DATE", "CREATED"] as const;
export type Sort = (typeof SORTS)[number];

export const GOAL_ICONS = [
  "🎯",
  "💪",
  "📚",
  "💼",
  "💰",
  "🌱",
  "🏃",
  "🎨",
  "✨",
  "🧠",
  "💡",
  "🌍",
] as const;

const milestoneInput = z.object({
  title: z.string().min(1).max(120),
});

export const createGoalSchema = z.object({
  title: z.string().min(1, "Required").max(120),
  description: z.string().max(500).optional().nullable(),
  category: z.enum(CATEGORIES).default("PERSONAL"),
  icon: z.string().max(8).default("🎯"),
  color: z.enum(GOAL_COLORS).default("purple"),
  targetDate: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
  milestones: z.array(milestoneInput).default([]),
});
export type CreateGoalInput = z.input<typeof createGoalSchema>;

export const updateGoalSchema = createGoalSchema.extend({
  id: z.string().min(1),
});
export type UpdateGoalInput = z.input<typeof updateGoalSchema>;

// Goal state is a derived signal:
//   • COMPLETED  — every milestone is done (only meaningful if total > 0)
//   • IN_PROGRESS — user has explicitly started the goal OR ticked any milestone
//   • NOT_STARTED — neither
// Means a brand-new goal with planned milestones won't read as "in progress"
// until the user actually begins (or auto-starts via the first milestone tick).
export function deriveState(args: {
  total: number;
  completed: number;
  startedAt: Date | null;
}): State {
  const { total, completed, startedAt } = args;
  if (total > 0 && completed >= total) return "COMPLETED";
  if (startedAt || completed > 0) return "IN_PROGRESS";
  return "NOT_STARTED";
}
