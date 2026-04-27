"use client";

import { CheckCircle2, Pencil } from "lucide-react";
import { useTimerStore } from "@/features/timer/store";
import { useTaskPicker } from "@/features/timer/components/task-picker-context";

export function CurrentTaskCard() {
  const taskTitle = useTimerStore((s) => s.taskTitle);
  const habitName = useTimerStore((s) => s.habitName);
  const habitIcon = useTimerStore((s) => s.habitIcon);
  const picker = useTaskPicker();

  const hasFocus = Boolean(taskTitle ?? habitName);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-[18px]">
      <div className="flex items-center gap-2 text-[13px] font-bold">
        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
        Current Focus
      </div>
      <div className="flex items-center gap-2 text-[17px] font-extrabold leading-tight text-foreground">
        {habitName ? (
          <>
            {habitIcon ? <span className="text-[20px]">{habitIcon}</span> : null}
            <span>{habitName}</span>
            <span className="ml-1 rounded-full bg-primary/15 px-2 py-[1px] text-[10.5px] font-semibold uppercase tracking-wide text-primary-soft">
              Habit
            </span>
          </>
        ) : taskTitle ? (
          <span>{taskTitle}</span>
        ) : (
          <span className="text-muted-foreground">No focus selected</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => picker.open()}
        className="inline-flex items-center gap-1.5 self-start rounded-lg bg-primary px-3 py-2 text-[12px] font-bold text-white hover:bg-primary-soft"
      >
        <Pencil className="h-3 w-3" />
        {hasFocus ? "Change focus" : "Pick a focus"}
      </button>
    </div>
  );
}
