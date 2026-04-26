"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Minus, Search, X } from "lucide-react";
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

export function TaskPickerDialog() {
  const picker = useTaskPicker();
  const setTask = useTimerStore((s) => s.setTask);
  const [search, setSearch] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [, startFetch] = useTransition();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!picker.isOpen) return;
    setLoading(true);
    startFetch(async () => {
      try {
        const res = await fetch(
          `/api/timer/tasks?q=${encodeURIComponent(search)}`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const data = (await res.json()) as Task[];
          setTasks(data);
        }
      } finally {
        setLoading(false);
      }
    });
  }, [picker.isOpen, search]);

  function pick(t: Task) {
    setTask(t.id, t.title);
    picker.close();
    picker.onSkip?.(); // if launched from "start without task" prompt, this proceeds with the start
  }

  function clearSelection() {
    setTask(null, null);
    picker.close();
  }

  function startWithoutTask() {
    picker.close();
    picker.onSkip?.();
  }

  return (
    <Dialog open={picker.isOpen} onOpenChange={(v) => !v && picker.close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pick a task to focus on</DialogTitle>
        </DialogHeader>

        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-strong" />
          <Input
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your open tasks…"
            className="pl-9"
          />
        </div>

        <div className="mt-3 max-h-[320px] space-y-1 overflow-y-auto pr-1">
          {loading && tasks.length === 0 ? (
            <Empty label="Loading…" />
          ) : tasks.length === 0 ? (
            <Empty
              label={
                search
                  ? "No matching open tasks."
                  : "No open tasks yet — add one in /tasks."
              }
            />
          ) : (
            tasks.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pick(t)}
                className="flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-2 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                <PriorityIcon p={t.priority} />
                <span className="flex-1 truncate text-[13px] font-medium">
                  {t.title}
                </span>
              </button>
            ))
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
              Start without a task
            </button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
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
