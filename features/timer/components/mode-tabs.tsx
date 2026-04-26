"use client";

import { useTimerStore, MODE_EMOJI, type Mode } from "@/features/timer/store";
import { cn } from "@/lib/utils";

const TABS: { key: Mode; label: string }[] = [
  { key: "POMODORO", label: "Pomodoro" },
  { key: "SHORT", label: "Short Break" },
  { key: "LONG", label: "Long Break" },
  { key: "CUSTOM", label: "Custom" },
];

export function ModeTabs() {
  const mode = useTimerStore((s) => s.mode);
  const status = useTimerStore((s) => s.status);
  const setMode = useTimerStore((s) => s.setMode);
  const running = status === "RUNNING";

  return (
    <div className="flex gap-1 rounded-xl border border-border bg-card p-1.5">
      {TABS.map((t) => {
        const active = mode === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => setMode(t.key)}
            disabled={running}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-bold transition-colors",
              active
                ? "bg-primary text-white"
                : "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
              running && !active && "opacity-50 cursor-not-allowed",
            )}
          >
            <span>{MODE_EMOJI[t.key]}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
