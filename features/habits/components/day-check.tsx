"use client";

import { useOptimistic, useTransition } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleHabitLog } from "@/features/habits/server/actions";
import { HABIT_COLOR_HEX, type HabitColor } from "@/features/habits/schema";

export function DayCheck({
  habitId,
  date,
  done,
  future,
  required = true,
  color,
  kind = "COUNT",
  progress,
}: {
  habitId: string;
  date: Date;
  done: boolean;
  future: boolean;
  /** false = this weekday is not part of the habit's schedule (CUSTOM mode) */
  required?: boolean;
  color: string;
  kind?: "COUNT" | "TIME";
  /** TIME-habit fractional progress 0..1 (partial fill ring). */
  progress?: number;
}) {
  const [, start] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(done);
  const hex = HABIT_COLOR_HEX[(color as HabitColor) ?? "purple"] ?? "#7c5cf6";

  // Non-required days render as a small dash and are not interactive.
  if (!required) {
    return (
      <span
        className="flex h-7 w-7 items-center justify-center text-[14px] text-muted-foreground-strong/50"
        aria-label="Not scheduled"
      >
        —
      </span>
    );
  }

  function onClick() {
    if (future) return;
    if (kind === "TIME") return; // TIME habits are filled by Pomodoro, not manual toggle
    const next = !optimistic;
    start(async () => {
      setOptimistic(next);
      await toggleHabitLog(habitId, date);
    });
  }

  // TIME habit: render a conic ring sized to `progress`, solid when complete.
  if (kind === "TIME") {
    const pct = Math.max(0, Math.min(1, progress ?? 0));
    const isFull = optimistic || pct >= 1;
    return (
      <span
        aria-label={
          isFull
            ? "Target met"
            : pct > 0
              ? `${Math.round(pct * 100)}% of target`
              : "Not logged"
        }
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full",
          future && "opacity-30",
        )}
        style={
          isFull
            ? { backgroundColor: hex, color: "#fff" }
            : pct > 0
              ? {
                  background: `conic-gradient(${hex} ${pct * 360}deg, transparent 0deg)`,
                  // Inner cutout to make it a ring
                  WebkitMask:
                    "radial-gradient(circle at center, transparent 7px, #000 8px)",
                  mask: "radial-gradient(circle at center, transparent 7px, #000 8px)",
                }
              : { border: "2px solid #5a607a" }
        }
      >
        {isFull ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={future}
      aria-label={done ? "Logged" : "Not logged"}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full transition-transform",
        !future && "hover:scale-110",
        future && "opacity-30",
      )}
      style={
        optimistic
          ? { backgroundColor: hex, color: "#fff" }
          : { border: "2px solid #5a607a" }
      }
    >
      {optimistic ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
    </button>
  );
}
