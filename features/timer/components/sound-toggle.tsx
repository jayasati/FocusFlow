"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useTimerStore } from "@/features/timer/store";
import { cn } from "@/lib/utils";

export function SoundToggle() {
  const enabled = useTimerStore((s) => s.soundEnabled);
  const toggle = useTimerStore((s) => s.toggleSound);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle sound"
      className={cn(
        "flex h-9 items-center gap-2 rounded-md border px-3 text-[12px] font-bold transition-colors",
        enabled
          ? "border-primary bg-primary text-white"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {enabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      Sound
    </button>
  );
}
