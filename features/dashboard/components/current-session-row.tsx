"use client";

import Link from "next/link";
import { Play, Timer } from "lucide-react";
import { useTimerStore } from "@/features/timer/store";

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function CurrentSessionRow() {
  const status = useTimerStore((s) => s.status);
  const remaining = useTimerStore((s) => s.remainingSec);
  const start = useTimerStore((s) => s.start);
  const isIdle = status === "IDLE" || status === "COMPLETED";

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-kpi-blue/15">
          <Timer className="h-4 w-4 text-kpi-blue" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[12.5px] font-semibold">Current Session</div>
            <div className="font-mono text-[14px] font-bold tabular-nums">
              {fmt(remaining)}
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground-strong">
            {status === "RUNNING"
              ? "Focus in progress"
              : status === "PAUSED"
                ? "Paused"
                : "Focus Time"}
          </div>
        </div>
      </div>

      {isIdle ? (
        <button
          type="button"
          onClick={start}
          className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-primary px-3 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-primary-soft"
        >
          <Play className="h-3.5 w-3.5 fill-white" />
          Start Focus Session
        </button>
      ) : (
        <Link
          href="/timer"
          className="flex w-full items-center justify-center gap-2 rounded-[10px] border border-primary/40 bg-primary/15 px-3 py-2 text-[12.5px] font-semibold text-primary-soft transition-colors hover:bg-primary/25"
        >
          Open Timer
        </Link>
      )}
    </div>
  );
}
