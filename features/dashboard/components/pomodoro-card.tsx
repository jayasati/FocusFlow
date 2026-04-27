"use client";

import { Pause, Play } from "lucide-react";
import { useTimerStore, MODE_LABEL } from "@/features/timer/store";
import { cn } from "@/lib/utils";

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PomodoroCard() {
  const mode = useTimerStore((s) => s.mode);
  const status = useTimerStore((s) => s.status);
  const remaining = useTimerStore((s) => s.remainingSec);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);

  const isRunning = status === "RUNNING";
  const isFocus = mode === "POMODORO" || mode === "CUSTOM";
  const label = isFocus ? "Focus Session" : MODE_LABEL[mode];

  return (
    <div className="flex h-full flex-col gap-3 rounded-[14px] border border-border bg-card p-4">
      <h3 className="text-[13px] font-bold">Pomodoro Timer</h3>
      <div className="flex flex-1 flex-col items-center justify-center gap-2.5">
        <div className="rounded-full border border-primary/40 bg-primary/15 px-2.5 py-0.5 text-[10.5px] font-bold text-primary-soft">
          {label}
        </div>
        <div className="font-mono text-[42px] font-extrabold leading-none tabular-nums tracking-[-1px]">
          {fmt(remaining)}
        </div>
        <div className="text-[10.5px] text-muted-foreground-strong">
          {isRunning
            ? "Stay focused"
            : status === "PAUSED"
              ? "Paused"
              : "Let's go!"}
        </div>
      </div>

      <button
        type="button"
        onClick={isRunning ? pause : start}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 rounded-[10px] px-3 py-2 text-[12.5px] font-semibold text-white transition-colors",
          isRunning
            ? "bg-orange-500 hover:bg-orange-500/90"
            : "bg-primary hover:bg-primary-soft",
        )}
      >
        {isRunning ? (
          <>
            <Pause className="h-3.5 w-3.5 fill-white" />
            Pause
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5 fill-white" />
            Start
          </>
        )}
      </button>
    </div>
  );
}
