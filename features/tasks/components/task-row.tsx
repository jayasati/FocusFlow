"use client";

import { useOptimistic, useState, useTransition } from "react";
import { format, isToday } from "date-fns";
import {
  ArrowDown,
  ArrowUp,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  ListTree,
  Minus,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  addSubtask,
  deleteTask,
  toggleTask,
} from "@/features/tasks/server/actions";
import type {
  SubtaskRow,
  TaskRow as TaskRowType,
} from "@/features/tasks/server/queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditTaskDialog } from "@/features/tasks/components/edit-task-dialog";
import { TaskInfoTooltip } from "@/features/tasks/components/task-info-tooltip";

const TAG_TONES: Record<string, string> = {
  design: "bg-primary/15 text-primary-soft",
  work: "bg-kpi-blue/15 text-kpi-blue",
  health: "bg-kpi-green/15 text-kpi-green",
  personal: "bg-kpi-orange/15 text-kpi-orange",
  content: "bg-kpi-red/15 text-kpi-red",
};

function tagTone(name: string) {
  return TAG_TONES[name.toLowerCase()] ?? "bg-surface-2 text-muted-foreground";
}

export function TaskTable({ rows }: { rows: TaskRowType[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-[14px] border border-dashed border-border bg-card/40 px-6 py-16 text-center">
        <div className="text-3xl">📋</div>
        <div className="text-[15px] font-semibold">No tasks here yet</div>
        <div className="max-w-xs text-[12.5px] text-muted-foreground">
          Adjust your filters or create a new task to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[14px] border border-border bg-card">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="border-b border-border">
            <th className="w-[40px] px-3 py-2.5"></th>
            <th className="px-3 py-2.5 text-[11.5px] font-semibold text-muted-foreground-strong">
              Task
            </th>
            <th className="w-[120px] px-3 py-2.5 text-[11.5px] font-semibold text-muted-foreground-strong">
              Priority
            </th>
            <th className="w-[170px] px-3 py-2.5 text-[11.5px] font-semibold text-muted-foreground-strong">
              Due Date
            </th>
            <th className="w-[120px] px-3 py-2.5 text-[11.5px] font-semibold text-muted-foreground-strong">
              Status
            </th>
            <th className="w-[40px] px-2 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <Row key={r.id} task={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Row({ task }: { task: TaskRowType }) {
  const [, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [optimisticDone, setOptimisticDone] = useOptimistic(
    task.status === "COMPLETED",
  );

  function onToggle() {
    const next = !optimisticDone;
    startTransition(async () => {
      setOptimisticDone(next);
      await toggleTask(task.id, next);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deleteTask(task.id);
    });
  }

  const status: TaskRowType["status"] = optimisticDone
    ? "COMPLETED"
    : task.status;
  const subtasks = task.subtasks;
  const doneCount = subtasks.filter((s) => s.completed).length;
  const hasSubtasks = subtasks.length > 0;

  return (
    <>
      <tr className="border-b border-border last:border-0 transition-colors hover:bg-white/[0.02]">
        <td className="px-3 py-3">
          <Checkbox checked={optimisticDone} onChange={onToggle} />
        </td>
        <td className="px-3 py-3">
          <div className="flex items-start gap-2">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? "Hide subtasks" : "Show subtasks"}
              className="mt-[2px] flex h-4 w-4 flex-shrink-0 items-center justify-center rounded text-muted-foreground-strong transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <TaskInfoTooltip task={task}>
                  <div
                    className={cn(
                      "cursor-help text-[13px] font-medium",
                      optimisticDone &&
                        "text-muted-foreground-strong line-through",
                    )}
                  >
                    {task.title}
                  </div>
                </TaskInfoTooltip>
                {hasSubtasks && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-1.5 py-[1px] text-[10.5px] font-medium text-muted-foreground">
                    <ListTree className="h-3 w-3" />
                    {doneCount}/{subtasks.length}
                  </span>
                )}
              </div>
              {task.tags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {task.tags.map((t) => (
                    <span
                      key={t}
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-[2px] text-[10.5px] font-medium",
                        tagTone(t),
                      )}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-3 py-3">
          <PriorityCell priority={task.priority} />
        </td>
        <td className="px-3 py-3">
          <DueCell date={task.dueDate} />
        </td>
        <td className="px-3 py-3">
          <StatusBadge status={status} />
        </td>
        <td className="px-2 py-3 text-right">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground-strong transition-colors hover:bg-surface-2 hover:text-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={onDelete}
                className="text-kpi-red focus:text-kpi-red"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <EditTaskDialog
            task={task}
            open={editOpen}
            onOpenChange={setEditOpen}
          />
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-border last:border-0 bg-white/[0.015]">
          <td colSpan={6} className="px-3 pb-3 pt-0">
            <SubtaskList parentId={task.id} subtasks={subtasks} />
          </td>
        </tr>
      )}
    </>
  );
}

function SubtaskList({
  parentId,
  subtasks,
}: {
  parentId: string;
  subtasks: SubtaskRow[];
}) {
  const [, startTransition] = useTransition();
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function onAdd(e: React.FormEvent) {
    e.preventDefault();
    const title = draft.trim();
    if (!title || submitting) return;
    setSubmitting(true);
    startTransition(async () => {
      try {
        await addSubtask({ parentId, title });
        setDraft("");
      } finally {
        setSubmitting(false);
      }
    });
  }

  return (
    <div className="ml-6 flex flex-col gap-1.5 border-l border-border/60 pl-4">
      {subtasks.length === 0 && (
        <div className="py-1 text-[11.5px] text-muted-foreground-strong">
          No subtasks yet — add one below.
        </div>
      )}
      {subtasks.map((s) => (
        <SubtaskItem key={s.id} subtask={s} />
      ))}
      <form onSubmit={onAdd} className="flex items-center gap-2 pt-1">
        <Plus className="h-3.5 w-3.5 text-muted-foreground-strong" />
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a subtask…"
          maxLength={160}
          className="flex-1 bg-transparent text-[12.5px] text-foreground placeholder:text-muted-foreground-strong focus:outline-none"
        />
        {draft.trim() && (
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-primary px-2.5 py-1 text-[11.5px] font-semibold text-white transition-colors hover:bg-primary-soft disabled:opacity-60"
          >
            Add
          </button>
        )}
      </form>
    </div>
  );
}

function SubtaskItem({ subtask }: { subtask: SubtaskRow }) {
  const [, startTransition] = useTransition();
  const [optimisticDone, setOptimisticDone] = useOptimistic(subtask.completed);

  function onToggle() {
    const next = !optimisticDone;
    startTransition(async () => {
      setOptimisticDone(next);
      await toggleTask(subtask.id, next);
    });
  }

  function onDelete() {
    startTransition(async () => {
      await deleteTask(subtask.id);
    });
  }

  return (
    <div className="group flex items-center gap-2 py-0.5">
      <Checkbox checked={optimisticDone} onChange={onToggle} />
      <div
        className={cn(
          "flex-1 text-[12.5px]",
          optimisticDone &&
            "text-muted-foreground-strong line-through",
        )}
      >
        {subtask.title}
      </div>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Delete subtask"
        className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground-strong opacity-0 transition-all hover:bg-surface-2 hover:text-kpi-red group-hover:opacity-100 focus:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "flex h-[18px] w-[18px] items-center justify-center rounded border-[1.5px] transition-colors",
        checked
          ? "border-primary bg-primary"
          : "border-muted-foreground-strong hover:border-primary",
      )}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="h-3 w-3 text-white">
          <path
            d="M2 6 L5 9 L10 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

function PriorityCell({ priority }: { priority: "HIGH" | "MEDIUM" | "LOW" }) {
  if (priority === "HIGH")
    return (
      <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-kpi-red">
        <ArrowUp className="h-3 w-3" />
        High
      </span>
    );
  if (priority === "LOW")
    return (
      <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-kpi-green">
        <ArrowDown className="h-3 w-3" />
        Low
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-kpi-orange">
      <Minus className="h-3 w-3" />
      Medium
    </span>
  );
}

function DueCell({ date }: { date: Date | null }) {
  if (!date)
    return <span className="text-[12px] text-muted-foreground-strong">—</span>;
  const label = isToday(date)
    ? `Today, ${format(date, "h:mm a")}`
    : format(date, "MMM d, yyyy");
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
      <CalendarIcon className="h-3 w-3 text-muted-foreground-strong" />
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: TaskRowType["status"] }) {
  const map: Record<TaskRowType["status"], string> = {
    PENDING: "bg-kpi-orange/15 text-kpi-orange",
    IN_PROGRESS: "bg-primary/15 text-primary-soft",
    COMPLETED: "bg-kpi-green/15 text-kpi-green",
    OVERDUE: "bg-kpi-red/15 text-kpi-red",
  };
  const label: Record<TaskRowType["status"], string> = {
    PENDING: "Pending",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
    OVERDUE: "Overdue",
  };
  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-[3px] text-[11.5px] font-semibold",
        map[status],
      )}
    >
      {label[status]}
    </span>
  );
}
