import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getHabitTrackerSummary } from "@/features/dashboard/server/queries";
import { HABIT_COLOR_HEX, type HabitColor } from "@/features/habits/schema";

export async function HabitTrackerCard() {
  const h = await getHabitTrackerSummary();
  return (
    <div className="flex h-full flex-col gap-3 rounded-[14px] border border-border bg-card p-4">
      <h3 className="text-[13px] font-bold">Habit Tracker</h3>

      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-[28px] font-extrabold leading-none text-kpi-green">
            {h.percent}%
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground-strong">
            today
          </div>
        </div>
        <div className="text-right">
          <div className="text-[18px] font-extrabold leading-none">
            {h.completedToday}
            <span className="text-muted-foreground-strong">
              /{h.requiredToday}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-muted-foreground-strong">
            habits today
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {h.topHabits.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-[11px] text-muted-foreground-strong">
            No habits yet
          </div>
        ) : (
          h.topHabits.map((habit) => {
            const color =
              HABIT_COLOR_HEX[habit.color as HabitColor] ??
              HABIT_COLOR_HEX.purple;
            return (
              <div key={habit.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold">
                    <span aria-hidden>{habit.icon}</span>
                    <span className="truncate">{habit.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground-strong">
                    {habit.weeklyPercent}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${habit.weeklyPercent}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <Link
        href="/habits"
        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-border bg-surface-2 px-3 py-1.5 text-[11.5px] font-semibold text-foreground transition-colors hover:bg-primary/15"
      >
        View All Habits
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
