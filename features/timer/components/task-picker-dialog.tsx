"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Minus, Search, Timer, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTaskPicker } from "@/features/timer/components/task-picker-context";
import { useTimerStore } from "@/features/timer/store";
import { cn } from "@/lib/utils";

type Task = { id: string; title: string; priority: string };
type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: "DAILY" | "WEEKLY" | "CUSTOM";
  targetMinutes: number;
};

export function TaskPickerDialog() {
  const picker = useTaskPicker();
  const setTask = useTimerStore((s) => s.setTask);
  const setHabit = useTimerStore((s) => s.setHabit);
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [, startFetch] = useTransition();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!picker.isOpen) return;
    setLoading(true);
    startFetch(async () => {
      try {
        const [taskRes, habitRes] = await Promise.all([
          fetch(`/api/timer/tasks?q=${encodeURIComponent(search)}`, {
            cache: "no-store",
          }),
          fetch(`/api/timer/habits?q=${encodeURIComponent(search)}`, {
            cache: "no-store",
          }),
        ]);
        if (taskRes.ok) setTasks((await taskRes.json()) as Task[]);
        if (habitRes.ok) setHabits((await habitRes.json()) as Habit[]);
      } finally {
        setLoading(false);
      }
    });
  }, [picker.isOpen, search]);

  function pickTask(t: Task) {
    setTask(t.id, t.title);
    picker.close();
    picker.onSkip?.();
  }

  function pickHabit(h: Habit) {
    setHabit(h.id, h.name, h.icon);
    picker.close();
    picker.onSkip?.();
  }

  function clearSelection() {
    setTask(null, null);
    setHabit(null, null, null);
    picker.close();
  }

  function startWithoutTask() {
    picker.close();
    picker.onSkip?.();
  }

  const nothing = !loading && habits.length === 0 && tasks.length === 0;

  return (
    <Dialog open={picker.isOpen} onOpenChange={(v) => !v && picker.close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pick a focus</DialogTitle>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-strong" />
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search habits or open tasks…"
            className="pl-9"
          />
        </div>

        <div className="mt-3 max-h-[360px] space-y-3 overflow-y-auto pr-1">
          {loading && nothing ? (
            <Empty label="Loading…" />
          ) : nothing ? (
            <Empty
              label={
                search
                  ? "Nothing matches your search."
                  : "No time habits or open tasks yet."
              }
            />
          ) : (
            <>
              {habits.length > 0 && (
                <Section label="Time-based habits">
                  {habits.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => pickHabit(h)}
                      className="flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
                    >
                      <span className="text-[18px]">{h.icon}</span>
                      <span className="flex-1 truncate text-[13px] font-medium">
                        {h.name}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground-strong">
                        <Timer className="h-3 w-3" />
                        {h.targetMinutes}
                        {h.frequency === "WEEKLY" ? " min/wk" : " min/day"}
                      </span>
                    </button>
                  ))}
                </Section>
              )}
              {tasks.length > 0 && (
                <Section label="Open tasks">
                  {tasks.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => pickTask(t)}
                      className="flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
                    >
                      <PriorityIcon p={t.priority} />
                      <span className="flex-1 truncate text-[13px] font-medium">
                        {t.title}
                      </span>
                    </button>
                  ))}
                </Section>
              )}
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={clearSelection}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
            Clear selection
          </button>
          {picker.onSkip ? (
            <button
              type="button"
              onClick={startWithoutTask}
              className="rounded-md bg-primary px-4 py-2 text-[12.5px] font-semibold text-white hover:bg-primary-soft"
            >
              Start without a focus
            </button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="px-1 pb-1 text-[10.5px] font-semibold uppercase tracking-wide text-muted-foreground-strong">
        {label}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="px-3 py-6 text-center text-[12px] text-muted-foreground">
      {label}
    </div>
  );
}

function PriorityIcon({ p }: { p: string }) {
  const cn_ = "h-3.5 w-3.5";
  if (p === "HIGH" || p === "URGENT")
    return <ArrowUp className={cn(cn_, "text-kpi-red")} />;
  if (p === "LOW") return <ArrowDown className={cn(cn_, "text-kpi-green")} />;
  return <Minus className={cn(cn_, "text-kpi-orange")} />;
}
