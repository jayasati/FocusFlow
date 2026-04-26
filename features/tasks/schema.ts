import { z } from "zod";

// UI-facing enums (translate to Prisma enums in the server layer).
export const PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;
export type Priority = (typeof PRIORITIES)[number];

// COMPLETED is the only persisted UI status; PENDING/IN_PROGRESS/OVERDUE are
// derived from dueDate + completedAt at read time.
export const UI_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "OVERDUE",
] as const;
export type UiStatus = (typeof UI_STATUSES)[number];

export const FILTERS = [
  "ALL",
  "TODAY",
  "UPCOMING",
  "OVERDUE",
  "COMPLETED",
] as const;
export type Filter = (typeof FILTERS)[number];

export const SORTS = ["PRIORITY", "DUE_DATE", "CREATED"] as const;
export type Sort = (typeof SORTS)[number];

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  description: z.string().max(2000).optional().nullable(),
  priority: z.enum(PRIORITIES).default("MEDIUM"),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v ? new Date(v) : null)),
  tags: z.array(z.string().min(1).max(40)).default([]),
  projectId: z.string().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().min(1),
});

// Input = pre-transform shape (what callers pass in: dueDate as string).
// Output = post-transform shape (used internally in server actions).
export type CreateTaskInput = z.input<typeof createTaskSchema>;
export type UpdateTaskInput = z.input<typeof updateTaskSchema>;

// Map between UI priority and Prisma TaskPriority enum
export function toDbPriority(p: Priority): "HIGH" | "MED" | "LOW" {
  if (p === "MEDIUM") return "MED";
  return p;
}
export function toUiPriority(p: "LOW" | "MED" | "HIGH" | "URGENT"): Priority {
  if (p === "MED") return "MEDIUM";
  if (p === "URGENT") return "HIGH";
  return p;
}

// Derive the UI status from a stored task row.
export function deriveStatus(t: {
  status: "TODO" | "DOING" | "DONE";
  dueDate: Date | null;
  completedAt: Date | null;
}): UiStatus {
  if (t.status === "DONE" || t.completedAt) return "COMPLETED";
  if (t.dueDate && t.dueDate.getTime() < Date.now()) return "OVERDUE";
  if (t.status === "DOING") return "IN_PROGRESS";
  return "PENDING";
}
