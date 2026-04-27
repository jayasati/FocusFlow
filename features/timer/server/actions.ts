"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireDbUserId } from "@/features/tasks/server/queries";
import { bumpTag } from "@/lib/cache-tags";
import { addHabitMinutes } from "@/features/habits/server/actions";

const TYPE_MAP: Record<
  "POMODORO" | "SHORT" | "LONG" | "CUSTOM",
  "FOCUS" | "SHORT_BREAK" | "LONG_BREAK" | "CUSTOM"
> = {
  POMODORO: "FOCUS",
  SHORT: "SHORT_BREAK",
  LONG: "LONG_BREAK",
  CUSTOM: "CUSTOM",
};

export async function logSession(input: {
  mode: "POMODORO" | "SHORT" | "LONG" | "CUSTOM";
  startedAt: string;
  endedAt: string;
  taskId?: string | null;
  habitId?: string | null;
}) {
  const userId = await requireDbUserId();
  const startedAt = new Date(input.startedAt);
  const endedAt = new Date(input.endedAt);
  await db.pomodoroSession.create({
    data: {
      userId,
      taskId: input.taskId ?? null,
      habitId: input.habitId ?? null,
      type: TYPE_MAP[input.mode],
      startedAt,
      endedAt,
      completed: true,
    },
  });

  // Attribute focus time to the habit's daily log so streaks/percent update.
  if (
    input.habitId &&
    (input.mode === "POMODORO" || input.mode === "CUSTOM")
  ) {
    const minutes = Math.max(
      0,
      Math.round((endedAt.getTime() - startedAt.getTime()) / 60_000),
    );
    if (minutes > 0) {
      await addHabitMinutes(input.habitId, startedAt, minutes);
    }
  }

  bumpTag("analytics");
  revalidatePath("/timer");
  revalidatePath("/dashboard");
}

export async function setDailyGoalMinutes(min: number) {
  const userId = await requireDbUserId();
  const clamped = Math.max(15, Math.min(720, Math.round(min))); // 15m..12h
  await db.user.update({
    where: { id: userId },
    data: { dailyFocusGoalMin: clamped },
  });
  revalidatePath("/timer");
  revalidatePath("/dashboard");
}
