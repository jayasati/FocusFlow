import "server-only";
import { cache } from "react";
import {
  addDays,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { db } from "@/lib/db";
import { requireDbUserId } from "@/features/tasks/server/queries";

export type SessionRow = {
  id: string;
  type: "FOCUS" | "SHORT_BREAK" | "LONG_BREAK" | "CUSTOM";
  startedAt: Date;
  endedAt: Date | null;
  durationSec: number;
  taskTitle: string | null;
  habitName: string | null;
  habitIcon: string | null;
  completed: boolean;
};

export type FocusStats = {
  bars: { label: string; key: string; minutes: number; highlight: boolean }[];
  totalMinutes: number;
  sessionsCount: number;
  avgMinutes: number;
};

export type TodaysFocus = {
  sessionsToday: number;
  totalSecToday: number;
  goalMinutes: number;
  goalPct: number;
};

export const TIMER_DAILY_GOAL_MIN_DEFAULT = 4 * 60; // 4h fallback

export const getDailyGoalMinutes = cache(async (): Promise<number> => {
  const userId = await requireDbUserId();
  const u = await db.user.findUnique({
    where: { id: userId },
    select: { dailyFocusGoalMin: true },
  });
  return u?.dailyFocusGoalMin ?? TIMER_DAILY_GOAL_MIN_DEFAULT;
});

export const SESSIONS_PAGE_SIZE = 10;

export const getSessions = cache(
  async (
    opts: { page?: number } = {},
  ): Promise<{
    rows: SessionRow[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const userId = await requireDbUserId();
    const page = Math.max(1, opts.page ?? 1);
    const [rows, total] = await Promise.all([
      db.pomodoroSession.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        skip: (page - 1) * SESSIONS_PAGE_SIZE,
        take: SESSIONS_PAGE_SIZE,
        include: {
          task: { select: { title: true } },
          habit: { select: { name: true, icon: true } },
        },
      }),
      db.pomodoroSession.count({ where: { userId } }),
    ]);
    const mapped: SessionRow[] = rows.map((r) => {
      const dur =
        r.endedAt && r.startedAt
          ? Math.max(
              0,
              Math.round((r.endedAt.getTime() - r.startedAt.getTime()) / 1000),
            )
          : 0;
      return {
        id: r.id,
        type: r.type,
        startedAt: r.startedAt,
        endedAt: r.endedAt,
        durationSec: dur,
        taskTitle: r.task?.title ?? null,
        habitName: r.habit?.name ?? null,
        habitIcon: r.habit?.icon ?? null,
        completed: r.completed,
      };
    });
    return {
      rows: mapped,
      total,
      page,
      totalPages: Math.max(1, Math.ceil(total / SESSIONS_PAGE_SIZE)),
    };
  },
);

export const getRecentSessions = cache(
  async (opts: { limit?: number } = {}): Promise<SessionRow[]> => {
    const userId = await requireDbUserId();
    const limit = opts.limit ?? 6;
    const rows = await db.pomodoroSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: limit,
      include: {
        task: { select: { title: true } },
        habit: { select: { name: true, icon: true } },
      },
    });
    return rows.map((r) => {
      const dur =
        r.endedAt && r.startedAt
          ? Math.max(
              0,
              Math.round((r.endedAt.getTime() - r.startedAt.getTime()) / 1000),
            )
          : 0;
      return {
        id: r.id,
        type: r.type,
        startedAt: r.startedAt,
        endedAt: r.endedAt,
        durationSec: dur,
        taskTitle: r.task?.title ?? null,
        habitName: r.habit?.name ?? null,
        habitIcon: r.habit?.icon ?? null,
        completed: r.completed,
      };
    });
  },
);

export const getTodaysFocus = cache(async (): Promise<TodaysFocus> => {
  const userId = await requireDbUserId();
  const start = startOfDay(new Date());
  const end = endOfDay(new Date());
  const [rows, goalMinutes] = await Promise.all([
    db.pomodoroSession.findMany({
      where: {
        userId,
        type: { in: ["FOCUS", "CUSTOM"] },
        completed: true,
        startedAt: { gte: start, lte: end },
      },
      select: { startedAt: true, endedAt: true },
    }),
    getDailyGoalMinutes(),
  ]);
  let sec = 0;
  for (const r of rows) {
    if (r.endedAt)
      sec += Math.max(0, (r.endedAt.getTime() - r.startedAt.getTime()) / 1000);
  }
  const safeGoal = goalMinutes > 0 ? goalMinutes : TIMER_DAILY_GOAL_MIN_DEFAULT;
  const goalPct = Math.min(
    100,
    Math.round((sec / 60 / safeGoal) * 100),
  );
  return {
    sessionsToday: rows.length,
    totalSecToday: Math.round(sec),
    goalMinutes: safeGoal,
    goalPct,
  };
});

export const getFocusStats = cache(
  async (opts: { range?: "WEEK" | "MONTH" } = {}): Promise<FocusStats> => {
    const userId = await requireDbUserId();
    const range = opts.range ?? "WEEK";
    const now = new Date();
    const start =
      range === "WEEK"
        ? startOfWeek(now, { weekStartsOn: 1 })
        : startOfMonth(now);
    const end =
      range === "WEEK"
        ? endOfWeek(now, { weekStartsOn: 1 })
        : endOfMonth(now);

    const rows = await db.pomodoroSession.findMany({
      where: {
        userId,
        type: { in: ["FOCUS", "CUSTOM"] },
        completed: true,
        startedAt: { gte: start, lte: end },
      },
      select: { startedAt: true, endedAt: true },
    });

    const buckets = new Map<string, number>(); // key -> minutes
    if (range === "WEEK") {
      for (let i = 0; i < 7; i++) {
        const d = addDays(start, i);
        buckets.set(format(d, "yyyy-MM-dd"), 0);
      }
    } else {
      const days = Math.ceil(
        (end.getTime() - start.getTime()) / 86_400_000,
      );
      for (let i = 0; i < days; i++) {
        const d = addDays(start, i);
        buckets.set(format(d, "yyyy-MM-dd"), 0);
      }
    }

    let totalMin = 0;
    let count = 0;
    for (const r of rows) {
      if (!r.endedAt) continue;
      const min = (r.endedAt.getTime() - r.startedAt.getTime()) / 60_000;
      const key = format(startOfDay(r.startedAt), "yyyy-MM-dd");
      buckets.set(key, (buckets.get(key) ?? 0) + min);
      totalMin += min;
      count++;
    }

    const todayKey = format(startOfDay(now), "yyyy-MM-dd");
    const bars = [...buckets.entries()].map(([key, minutes]) => {
      const d = new Date(key);
      return {
        key,
        label: range === "WEEK" ? format(d, "EEE") : format(d, "d"),
        minutes: Math.round(minutes),
        highlight: key === todayKey,
      };
    });

    return {
      bars,
      totalMinutes: Math.round(totalMin),
      sessionsCount: count,
      avgMinutes: count > 0 ? Math.round(totalMin / count) : 0,
    };
  },
);

export const getOpenTasksForPicker = cache(
  async (
    opts: { search?: string; limit?: number } = {},
  ): Promise<{ id: string; title: string; priority: string }[]> => {
    const userId = await requireDbUserId();
    const limit = opts.limit ?? 50;
    const rows = await db.task.findMany({
      where: {
        userId,
        status: { not: "DONE" },
        ...(opts.search
          ? { title: { contains: opts.search, mode: "insensitive" as const } }
          : {}),
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      take: limit,
      select: { id: true, title: true, priority: true },
    });
    return rows;
  },
);

export type PickerHabit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: "DAILY" | "WEEKLY" | "CUSTOM";
  targetMinutes: number;
};

export const getTimeHabitsForPicker = cache(
  async (
    opts: { search?: string; limit?: number } = {},
  ): Promise<PickerHabit[]> => {
    const userId = await requireDbUserId();
    const limit = opts.limit ?? 50;
    const rows = await db.habit.findMany({
      where: {
        userId,
        archivedAt: null,
        kind: "TIME",
        ...(opts.search
          ? { name: { contains: opts.search, mode: "insensitive" as const } }
          : {}),
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        frequency: true,
        targetMinutes: true,
      },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      icon: r.icon ?? "🌱",
      color: r.color ?? "purple",
      frequency: r.frequency,
      targetMinutes: r.targetMinutes ?? 0,
    }));
  },
);

export type Achievements = {
  focusStreakDays: number;
  totalFocusHours: number;
  pomodoroDone: number;
};

export const getAchievements = cache(async (): Promise<Achievements> => {
  const userId = await requireDbUserId();
  // Single SQL aggregation instead of pulling every row into JS.
  const since = addDays(new Date(), -365);
  const [agg, recent] = await Promise.all([
    db.pomodoroSession.aggregate({
      where: {
        userId,
        completed: true,
        type: { in: ["FOCUS", "CUSTOM"] },
      },
      _count: { _all: true },
    }),
    // Only need recent rows to compute current streak — older days don't
    // affect a "consecutive days ending today" count once the streak breaks.
    db.pomodoroSession.findMany({
      where: {
        userId,
        completed: true,
        type: { in: ["FOCUS", "CUSTOM"] },
        startedAt: { gte: since },
      },
      select: { startedAt: true, endedAt: true },
      orderBy: { startedAt: "desc" },
    }),
  ]);

  let totalSec = 0;
  for (const r of recent) {
    if (r.endedAt)
      totalSec += (r.endedAt.getTime() - r.startedAt.getTime()) / 1000;
  }
  const totalFocusHours = Math.floor(totalSec / 3600);

  const dayKeys = new Set(
    recent.map((r) => format(startOfDay(r.startedAt), "yyyy-MM-dd")),
  );
  const today = startOfDay(new Date());
  const yesterday = startOfDay(addDays(today, -1));
  let cursor = dayKeys.has(format(today, "yyyy-MM-dd")) ? today : yesterday;
  let streak = 0;
  while (dayKeys.has(format(cursor, "yyyy-MM-dd"))) {
    streak++;
    cursor = addDays(cursor, -1);
  }

  return {
    focusStreakDays: streak,
    totalFocusHours,
    pomodoroDone: agg._count._all,
  };
});
