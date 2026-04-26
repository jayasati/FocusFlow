"use client";

import { useOptimistic, useState, useTransition } from "react";
import { format } from "date-fns";
import { CalendarDays, Check, ChevronDown, Flag, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CATEGORY_META,
  GOAL_COLOR_GRADIENT,
  type Category,
  type GoalColor,
} from "@/features/goals/schema";
import {
  startGoal,
  toggleMilestone,
} from "@/features/goals/server/actions";
import { GoalRowMenu } from "@/features/goals/components/goal-row-menu";
import type { GoalRow } from "@/features/goals/server/queries";

const PROG_TEXT: Record<string, string> = {
  purple: "text-primary-soft",
  green: "text-kpi-green",
  orange: "text-kpi-orange",
  blue: "text-kpi-blue",
  yellow: "text-yellow-400",
  teal: "text-teal-400",
  pink: "text-pink-400",
  red: "text-kpi-red",
};

const STATE_BADGE: Record<
  GoalRow["state"],
  { label: string; tone: string }
> = {
  NOT_STARTED: {
    label: "Not started",
    tone: "bg-kpi-red/15 text-kpi-red",
  },
  IN_PROGRESS: {
    label: "In progress",
    tone: "bg-kpi-orange/15 text-kpi-orange",
  },
  COMPLETED: {
    label: "Completed",
    tone: "bg-kpi-green/15 text-kpi-green",
  },
};

export function GoalCard({ goal }: { goal: GoalRow }) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const cat = (goal.category as Category) ?? null;
  const catMeta = cat ? CATEGORY_META[cat] : null;
  const colorKey = (goal.color as GoalColor) ?? "purple";

  function onStart() {
    startTransition(async () => {
      await startGoal(goal.id);
    });
  }

  return (
    <div className="rounded-[14px] border border-border bg-card transition-colors hover:border-primary/30">
      <div className="flex items-center gap-4 p-4 sm:p-5">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] text-[22px]"
          style={{ backgroundImage: GOAL_COLOR_GRADIENT[colorKey] }}
        >
          {goal.icon}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h4 className="truncate text-[15px] font-bold">{goal.title}</h4>
            {catMeta ? (
              <span
                className={`rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${catMeta.badge}`}
              >
                {catMeta.label}
              </span>
            ) : null}
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${STATE_BADGE[goal.state].tone}`}
            >
              {STATE_BADGE[goal.state].label}
            </span>
          </div>
          {goal.description ? (
            <p className="truncate text-[13px] text-muted-foreground">
              {goal.description}
            </p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground-strong">
            {goal.targetDate ? (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Target: {format(goal.targetDate, "MMM d, yyyy")}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1">
              <Flag className="h-3 w-3" />
              {goal.completedMilestones} / {goal.totalMilestones} milestones
            </span>
          </div>
        </div>

        <div className="hidden w-[160px] shrink-0 sm:block">
          {goal.state === "NOT_STARTED" ? (
            <button
              type="button"
              onClick={onStart}
              className="ml-auto flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-[12px] font-semibold text-primary-soft transition-colors hover:bg-primary/25"
            >
              <Play className="h-3 w-3 fill-current" />
              Start goal
            </button>
          ) : (
            <div className="text-right">
              <div className={cn("text-[20px] font-bold", PROG_TEXT[colorKey])}>
                {goal.percent}%
              </div>
              <div className="text-[11px] text-muted-foreground">Progress</div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${goal.percent}%`,
                    backgroundImage: GOAL_COLOR_GRADIENT[colorKey],
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle milestones"
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground-strong transition-colors hover:bg-surface-2 hover:text-foreground",
            open && "bg-surface-2 text-foreground",
          )}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </button>

        <GoalRowMenu goal={goal} />
      </div>

      {/* Mobile-only progress bar / start button (under the row) */}
      <div className="-mt-2 px-4 pb-4 sm:hidden">
        {goal.state === "NOT_STARTED" ? (
          <button
            type="button"
            onClick={onStart}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-primary/40 bg-primary/15 px-3 py-2 text-[12.5px] font-semibold text-primary-soft transition-colors hover:bg-primary/25"
          >
            <Play className="h-3 w-3 fill-current" />
            Start goal
          </button>
        ) : (
          <>
            <div className="mb-1 flex items-baseline justify-between">
              <span className={cn("text-[14px] font-bold", PROG_TEXT[colorKey])}>
                {goal.percent}%
              </span>
              <span className="text-[11px] text-muted-foreground">Progress</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${goal.percent}%`,
                  backgroundImage: GOAL_COLOR_GRADIENT[colorKey],
                }}
              />
            </div>
          </>
        )}
      </div>

      {open && (
        <div className="border-t border-border px-4 py-3 sm:px-5">
          {goal.milestones.length === 0 ? (
            <div className="px-1 py-3 text-center text-[12.5px] text-muted-foreground">
              No milestones yet — add some by editing this goal.
            </div>
          ) : (
            <div className="space-y-1">
              {goal.milestones.map((m) => (
                <MilestoneRow
                  key={m.id}
                  id={m.id}
                  title={m.title}
                  done={!!m.completedAt}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MilestoneRow({
  id,
  title,
  done,
}: {
  id: string;
  title: string;
  done: boolean;
}) {
  const [, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(done);

  function onClick() {
    const next = !optimistic;
    start(async () => {
      setOptimistic(next);
      await toggleMilestone(id);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/[0.03]"
    >
      <span
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border-[1.5px] transition-colors",
          optimistic
            ? "border-primary bg-primary"
            : "border-muted-foreground-strong",
        )}
      >
        {optimistic ? (
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        ) : null}
      </span>
      <span
        className={cn(
          "flex-1 text-[13px]",
          optimistic && "text-muted-foreground-strong line-through",
        )}
      >
        {title}
      </span>
    </button>
  );
}
