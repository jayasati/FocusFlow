"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { setDailyGoalMinutes } from "@/features/timer/server/actions";

const PRESETS = [
  { label: "1h", min: 60 },
  { label: "2h", min: 120 },
  { label: "4h", min: 240 },
  { label: "6h", min: 360 },
  { label: "8h", min: 480 },
];

export function EditGoalDialog({
  initialMinutes,
  trigger,
}: {
  initialMinutes: number;
  trigger?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [minutes, setMinutes] = useState(initialMinutes);

  // Sync incoming prop when dialog opens (e.g. after revalidate)
  function onOpen(v: boolean) {
    setOpen(v);
    if (v) setMinutes(initialMinutes);
  }

  function save() {
    start(async () => {
      await setDailyGoalMinutes(minutes);
      setOpen(false);
    });
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const labelPretty =
    hours === 0 ? `${minutes}m` : mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;

  return (
    <Dialog open={open} onOpenChange={onOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            className="mt-auto flex items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-[11px] font-bold text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground"
          >
            <Pencil className="h-2.5 w-2.5" />
            Edit Goal
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Daily focus goal</DialogTitle>
        </DialogHeader>

        <div className="mt-1 text-[12px] text-muted-foreground">
          How much focused work do you want to log each day?
        </div>

        <div className="mt-4 text-center">
          <div className="text-[36px] font-extrabold leading-none">
            {labelPretty}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground-strong">
            {minutes} minutes
          </div>
        </div>

        <div className="mt-4">
          <input
            type="range"
            min={15}
            max={720}
            step={15}
            value={minutes}
            onChange={(e) => setMinutes(Number(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground-strong">
            <span>15m</span>
            <span>4h</span>
            <span>12h</span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.min}
              type="button"
              onClick={() => setMinutes(p.min)}
              className={cn(
                "flex-1 rounded-md border px-3 py-1.5 text-[12px] font-bold transition-colors",
                minutes === p.min
                  ? "border-primary bg-primary/15 text-primary-soft"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-border px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-soft disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save goal"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
