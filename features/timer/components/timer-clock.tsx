"use client";

import { Minus, Pause, Play, Plus, RotateCcw, SkipForward } from "lucide-react";
import { useTimerStore } from "@/features/timer/store";
import { cn } from "@/lib/utils";
import { useTaskPicker } from "@/features/timer/components/task-picker-context";

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const MODE_BADGE: Record<
  "POMODORO" | "SHORT" | "LONG" | "CUSTOM",
  { label: string; subtitle: string; subTone: string }
> = {
  POMODORO: { label: "Focus Time", subtitle: "🌿 Time to focus!", subTone: "text-kpi-green" },
  SHORT: { label: "Short Break", subtitle: "☕ Catch your breath", subTone: "text-kpi-blue" },
  LONG: { label: "Long Break", subtitle: "🫗 Recharge well", subTone: "text-kpi-blue" },
  CUSTOM: { label: "Custom", subtitle: "⚙ Your session", subTone: "text-primary-soft" },
};

export function TimerClock() {
  const mode = useTimerStore((s) => s.mode);
  const status = useTimerStore((s) => s.status);
  const remaining = useTimerStore((s) => s.remainingSec);
  const duration = useTimerStore((s) => s.durationSec);
  const cycleIndex = useTimerStore((s) => s.cycleIndex);
  const taskId = useTimerStore((s) => s.taskId);
  const customDurationMin = useTimerStore((s) => s.customDurationMin);
  const setCustomDuration = useTimerStore((s) => s.setCustomDuration);
  const start = useTimerStore((s) => s.start);
  const pause = useTimerStore((s) => s.pause);
  const reset = useTimerStore((s) => s.reset);
  const skip = useTimerStore((s) => s.skip);
  const picker = useTaskPicker();

  const radius = 105;
  const circ = 2 * Math.PI * radius;
  const pct = duration > 0 ? remaining / duration : 0;
  const dash = pct * circ;

  const badge = MODE_BADGE[mode];
  const isRunning = status === "RUNNING";

  function onPlayPause() {
    if (isRunning) {
      pause();
      return;
    }
    // If user is starting POMODORO/CUSTOM with no task selected, prompt them.
    if (
      (mode === "POMODORO" || mode === "CUSTOM") &&
      status === "IDLE" &&
      !taskId
    ) {
      picker.open({ onSkip: () => start() });
      return;
    }
    start();
  }

  return (
    <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card p-6">
      <div className="relative flex h-[230px] w-[230px] items-center justify-center">
        <svg viewBox="0 0 230 230" className="absolute inset-0 -rotate-90">
          <circle
            cx="115"
            cy="115"
            r={radius}
            fill="none"
            stroke="hsl(var(--surface-2))"
            strokeWidth="9"
          />
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary-soft))" />
            </linearGradient>
          </defs>
          <circle
            cx="115"
            cy="115"
            r={radius}
            fill="none"
            stroke="url(#timerGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
          />
        </svg>
        <div className="z-10 flex flex-col items-center gap-1.5">
          <div className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-[12px] font-bold text-primary-soft">
            {badge.label}
          </div>
          <div className="font-mono text-[58px] font-extrabold leading-none tracking-[-2px] text-foreground">
            {fmt(remaining)}
          </div>
          <div
            className={cn(
              "rounded-full border px-3 py-1 text-[11px] font-bold",
              mode === "POMODORO"
                ? "border-kpi-green/30 bg-kpi-green/10 text-kpi-green"
                : "border-primary/30 bg-primary/10 text-primary-soft",
            )}
          >
            {badge.subtitle}
          </div>
        </div>
      </div>

      {mode === "POMODORO" && (
        <div className="text-[12px] font-semibold text-muted-foreground">
          {cycleIndex} of 4 cycles
        </div>
      )}

      {mode === "CUSTOM" && status === "IDLE" && (
        <div className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-1.5 py-1">
          <button
            type="button"
            onClick={() => setCustomDuration(customDurationMin - 5)}
            disabled={customDurationMin <= 5}
            aria-label="Decrease duration"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/15 hover:text-foreground disabled:opacity-40"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="number"
            min={1}
            max={180}
            value={customDurationMin}
            onChange={(e) =>
              setCustomDuration(Number(e.target.value) || 1)
            }
            className="w-12 bg-transparent text-center text-[13px] font-bold tabular-nums text-foreground focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <span className="pr-1 text-[11px] font-semibold text-muted-foreground-strong">
            min
          </span>
          <button
            type="button"
            onClick={() => setCustomDuration(customDurationMin + 5)}
            disabled={customDurationMin >= 180}
            aria-label="Increase duration"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/15 hover:text-foreground disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-6">
        <CtrlButton
          label="Reset"
          onClick={reset}
          icon={<RotateCcw className="h-[18px] w-[18px]" />}
        />
        <button
          type="button"
          onClick={onPlayPause}
          aria-label={isRunning ? "Pause" : "Start"}
          className={cn(
            "flex h-[60px] w-[60px] items-center justify-center rounded-full bg-primary text-white transition-all hover:bg-primary-soft active:scale-95",
          )}
        >
          {isRunning ? (
            <Pause className="h-6 w-6 fill-white" />
          ) : (
            <Play className="ml-0.5 h-6 w-6 fill-white" />
          )}
        </button>
        <CtrlButton
          label="Skip"
          onClick={skip}
          icon={<SkipForward className="h-[18px] w-[18px]" />}
        />
      </div>
    </div>
  );
}

function CtrlButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1.5"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-2 text-foreground transition-colors hover:bg-primary/15">
        {icon}
      </span>
      <span className="text-[10px] font-semibold text-muted-foreground-strong">
        {label}
      </span>
    </button>
  );
}
