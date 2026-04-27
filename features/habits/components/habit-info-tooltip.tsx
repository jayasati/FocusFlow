import type { ReactNode } from "react";
import { Flame } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WEEKDAYS } from "@/features/habits/schema";
import type { HabitWeekRow } from "@/features/habits/server/queries";

function scheduleLine(row: HabitWeekRow): string {
  if (row.frequency === "DAILY") return "Every day";
  if (row.frequency === "WEEKLY") {
    const n = row.targetPerWeek ?? 0;
    return n > 0 ? `${n}× per week` : "Weekly";
  }
  if (row.customDays.length === 0) return "Custom";
  return row.customDays
    .slice()
    .sort((a, b) => a - b)
    .map((d) => WEEKDAYS[d])
    .join(", ");
}

function targetLine(row: HabitWeekRow): string | null {
  if (row.kind !== "TIME") return null;
  const tm = row.targetMinutes ?? 0;
  if (!tm) return null;
  if (row.frequency === "WEEKLY") return `${tm} min per week`;
  if (row.frequency === "CUSTOM") return `${tm} min per scheduled day`;
  return `${tm} min per day`;
}

export function HabitInfoTooltip({
  row,
  children,
}: {
  row: HabitWeekRow;
  children: ReactNode;
}) {
  const target = targetLine(row);
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        className="max-w-[280px] rounded-[10px] border border-border bg-card px-3 py-2.5 text-foreground"
      >
        <div className="flex items-center gap-2 text-[13px] font-bold">
          <span className="text-[16px]">{row.icon}</span>
          <span className="truncate">{row.name}</span>
        </div>
        {row.description ? (
          <div className="mt-1 whitespace-pre-wrap text-[11.5px] text-muted-foreground">
            {row.description}
          </div>
        ) : null}
        <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground-strong">
          <div>
            <span className="font-semibold text-foreground/80">Type:</span>{" "}
            {row.kind === "TIME" ? "Time-based" : "Frequency"}
          </div>
          <div>
            <span className="font-semibold text-foreground/80">Schedule:</span>{" "}
            {scheduleLine(row)}
          </div>
          {target ? (
            <div>
              <span className="font-semibold text-foreground/80">Target:</span>{" "}
              {target}
            </div>
          ) : null}
        </div>
        {row.currentStreak > 0 ? (
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-kpi-orange/15 px-2 py-[2px] text-[10.5px] font-semibold text-kpi-orange">
            <Flame className="h-3 w-3" />
            {row.currentStreak}-day streak
          </div>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}
