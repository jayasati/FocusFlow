"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireDbUserId } from "@/features/tasks/server/queries";
import {
  createGoalSchema,
  updateGoalSchema,
  type CreateGoalInput,
  type UpdateGoalInput,
} from "@/features/goals/schema";

export async function createGoal(input: CreateGoalInput) {
  const userId = await requireDbUserId();
  const data = createGoalSchema.parse(input);
  await db.goal.create({
    data: {
      userId,
      title: data.title,
      description: data.description ?? null,
      category: data.category,
      icon: data.icon,
      color: data.color,
      timeframe: "MONTH", // legacy required field — we don't surface it
      endDate: data.targetDate ?? null,
      status: "ACTIVE",
      milestones: {
        create: data.milestones.map((m, i) => ({
          title: m.title.trim(),
          position: i,
        })),
      },
    },
  });
  revalidatePath("/goals");
}

export async function updateGoal(input: UpdateGoalInput) {
  const userId = await requireDbUserId();
  const data = updateGoalSchema.parse(input);

  await db.$transaction(async (tx) => {
    await tx.goal.update({
      where: { id: data.id, userId },
      data: {
        title: data.title,
        description: data.description ?? null,
        category: data.category,
        icon: data.icon,
        color: data.color,
        endDate: data.targetDate ?? null,
      },
    });
    // Replace milestones wholesale — simpler than diffing on edit.
    await tx.milestone.deleteMany({ where: { goalId: data.id } });
    if (data.milestones.length > 0) {
      await tx.milestone.createMany({
        data: data.milestones.map((m, i) => ({
          goalId: data.id,
          title: m.title.trim(),
          position: i,
        })),
      });
    }
  });
  revalidatePath("/goals");
}

export async function toggleMilestone(milestoneId: string) {
  const userId = await requireDbUserId();
  await db.$transaction(async (tx) => {
    const m = await tx.milestone.findFirst({
      where: { id: milestoneId, goal: { userId } },
      select: { id: true, completedAt: true, goalId: true },
    });
    if (!m) return;
    await tx.milestone.update({
      where: { id: m.id },
      data: { completedAt: m.completedAt ? null : new Date() },
    });

    const all = await tx.milestone.findMany({
      where: { goalId: m.goalId },
      select: { completedAt: true },
    });
    const total = all.length;
    const done = all.filter((x) => x.completedAt).length;
    const isComplete = total > 0 && done >= total;
    const goal = await tx.goal.findUnique({
      where: { id: m.goalId },
      select: { startedAt: true },
    });
    await tx.goal.update({
      where: { id: m.goalId, userId },
      data: {
        status: isComplete ? "COMPLETED" : "ACTIVE",
        progress: total > 0 ? Math.round((done / total) * 100) : 0,
        // Auto-start: ticking the first milestone marks the goal as started.
        // (Untoggling later doesn't un-start it — explicit unstartGoal does.)
        ...(done > 0 && !goal?.startedAt ? { startedAt: new Date() } : {}),
      },
    });
  });
  revalidatePath("/goals");
}

export async function startGoal(id: string) {
  const userId = await requireDbUserId();
  await db.goal.update({
    where: { id, userId },
    data: { startedAt: new Date() },
  });
  revalidatePath("/goals");
}

export async function unstartGoal(id: string) {
  const userId = await requireDbUserId();
  await db.goal.update({
    where: { id, userId },
    data: { startedAt: null },
  });
  revalidatePath("/goals");
}

export async function deleteGoal(id: string) {
  const userId = await requireDbUserId();
  await db.goal.delete({ where: { id, userId } });
  revalidatePath("/goals");
}
