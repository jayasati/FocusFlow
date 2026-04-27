import { addDays } from "date-fns";
import { Plus } from "lucide-react";
import { DayCheck } from "@/features/habits/components/day-check";
import { AddHabitDialog } from "@/features/habits/components/add-habit-dialog";
import { HabitRowMenu } from "@/features/habits/components/habit-row-menu";
import { HabitInfoTooltip } from "@/features/habits/components/habit-info-tooltip";
import {
  HABIT_COLOR_HEX,
  type HabitColor,
} from "@/features/habits/schema";
import type { HabitWeekRow } from "@/features/habits/server/queries";

export function HabitGrid({
  rows,
  weekStart,
}: {
  rows: HabitWeekRow[];
  weekStart: Date;
}) {
  return (
    <div className="overflow-x-auto rounded-[14px] border border-border bg-card">
      <div className="min-w-[820px] px-4 pb-0 pt-4">
        <div className="grid grid-cols-[minmax(260px,1.4fr)_repeat(7,52px)_minmax(140px,1fr)_28px] items-center gap-x-1 border-b border-border pb-3">
          <div className="text-[14px] font-bold">Habit Tracker</div>
          {DAY_LABELS.map((d) => (
            <div
              key={d}
              className="text-center text-[11.5px] font-semibold text-muted-foreground-strong"
            >
              {d}
            </div>
          ))}
          <div className="pl-2 text-left text-[11.5px] font-semibold text-muted-foreground-strong">
            Progress
          </div>
          <div />
        </div>

        {rows.length === 0 ? (
          <EmptyRow />
        ) : (
          rows.map((r) => (
            <Row key={r.id} row={r} weekStart={weekStart} />
          ))
        )}

        <AddHabitDialog
          trigger={
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 border-t border-border py-3.5 text-[13px] font-semibold text-primary-soft transition-colors hover:bg-primary/15"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              Add New Habit
            </button>
          }
        />
      </div>
    </div>
  );
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Row({ row, weekStart }: { row: HabitWeekRow; weekStart: Date }) {
  const hex = HABIT_COLOR_HEX[(row.color as HabitColor) ?? "purple"];
  const tint = `${hex}30`;

  return (
    <div className="grid grid-cols-[minmax(260px,1.4fr)_repeat(7,52px)_minmax(140px,1fr)_28px] items-center gap-x-1 border-b border-border py-3 last:border-b-0">
      <HabitInfoTooltip row={row}>
        <div className="flex cursor-help items-center gap-2.5 pr-2">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[18px]"
            style={{ background: tint }}
          >
            {row.icon}
          </div>
          <div className="min-w-0">
            <div className="line-clamp-2 break-words text-[13.5px] font-semibold leading-snug">
              {row.name}
            </div>
            {row.description ? (
              <div className="line-clamp-2 break-words text-[11px] text-muted-foreground-strong">
                {row.description}
              </div>
            ) : null}
          </div>
        </div>
      </HabitInfoTooltip>

      {row.days.map((done, i) => {
        const dailyTimeTarget =
          row.kind === "TIME" && row.frequency !== "WEEKLY"
            ? row.targetMinutes ?? 0
            : 0;
        const progress =
          row.kind === "TIME"
            ? row.frequency === "WEEKLY"
              ? row.minutesPerDay[i] > 0
                ? 1
                : 0
              : dailyTimeTarget > 0
                ? row.minutesPerDay[i] / dailyTimeTarget
                : 0
            : undefined;
        return (
          <div key={i} className="flex justify-center">
            <DayCheck
              habitId={row.id}
              date={addDays(weekStart, i)}
              done={done}
              future={row.future[i]}
              required={row.required[i]}
              color={row.color}
              kind={row.kind}
              progress={progress}
            />
          </div>
        );
      })}

      <div className="px-2">
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <span className="text-[12px] font-semibold" style={{ color: hex }}>
            {row.percent}%
          </span>
          <span className="text-[10px] text-muted-foreground-strong">
            {row.kind === "TIME"
              ? row.frequency === "WEEKLY"
                ? `${row.minutesThisWeek} / ${row.targetMinutes ?? 0} min wk`
                : row.frequency === "CUSTOM"
                  ? `${row.minutesThisWeek} min · ${row.targetMinutes ?? 0}/day`
                  : `${row.minutesThisWeek} min · ${row.targetMinutes ?? 0}/day`
              : row.frequency === "WEEKLY"
                ? `${row.doneThisWeek} / ${row.weeklyTarget} wk`
                : row.frequency === "CUSTOM"
                  ? `${row.doneThisWeek} / ${row.weeklyTarget} days`
                  : `${row.doneThisWeek} / 7`}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{ width: `${row.percent}%`, background: hex }}
          />
        </div>
      </div>

      <HabitRowMenu
        habit={{
          id: row.id,
          name: row.name,
          description: row.description,
          icon: row.icon,
          color: row.color,
          frequency: row.frequency,
          kind: row.kind,
          targetMinutes: row.targetMinutes,
          targetPerWeek: row.targetPerWeek,
          customDays: row.customDays,
        }}
      />
    </div>
  );
}

function EmptyRow() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <div className="text-2xl">🌱</div>
      <div className="text-[14px] font-semibold">No habits yet</div>
      <div className="text-[12px] text-muted-foreground">
        Add your first habit and start a streak.
      </div>
    </div>
  );
}
