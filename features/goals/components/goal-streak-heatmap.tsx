import { format, startOfMonth, getDay } from "date-fns";
import type { GoalStreak } from "@/features/goals/server/queries";
import { cn } from "@/lib/utils";

const INTENSITY_BG: Record<0 | 1 | 2 | 3, string> = {
  0: "bg-white/[0.04]",
  1: "bg-primary/30",
  2: "bg-primary/60",
  3: "bg-primary",
};

export function GoalStreakHeatmap({ streak }: { streak: GoalStreak }) {
  const now = new Date();
  const monthLabel = format(now, "MMMM yyyy");
  // Pad leading cells so day 1 lands on its real weekday (Mon=0..Sun=6).
  const firstWeekday = (getDay(startOfMonth(now)) + 6) % 7;
  const padding = Array.from({ length: firstWeekday });

  return (
    <div>
      <div className="mb-1 flex items-center gap-2">
        <h4 className="text-[14px] font-bold">Goal Streak</h4>
        <span className="ml-auto text-[11px] text-muted-foreground-strong">
          {monthLabel}
        </span>
      </div>
      <p className="mb-3 text-[11.5px] text-muted-foreground">
        Days you completed at least one milestone.
      </p>

      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-2 border-primary/30 bg-primary/15">
          <div className="text-[20px] font-bold">{streak.current}</div>
          <div className="text-[9px] text-muted-foreground-strong">Days</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="grid grid-cols-7 gap-0.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div
                key={i}
                className="text-center text-[9px] font-semibold text-muted-foreground-strong"
              >
                {d}
              </div>
            ))}
            {padding.map((_, i) => (
              <span key={`pad-${i}`} />
            ))}
            {streak.days.map((d) => (
              <div
                key={d.day}
                title={`${d.day}: ${d.intensity === 0 ? "no activity" : d.intensity === 1 ? "1" : d.intensity === 2 ? "2-3" : "4+"} milestone${d.intensity === 1 ? "" : "s"}`}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-[3px] text-[8px]",
                  INTENSITY_BG[d.intensity],
                  d.intensity > 0 ? "text-white" : "text-muted-foreground-strong",
                )}
              >
                {d.day}
              </div>
            ))}
          </div>
          <div className="mt-2 text-[10.5px] text-muted-foreground-strong">
            Best run:{" "}
            <span className="font-semibold text-foreground">
              {streak.best} day{streak.best === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
