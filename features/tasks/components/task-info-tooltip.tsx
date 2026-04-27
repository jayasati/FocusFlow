import type { ReactNode } from "react";
import { format, isToday } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { TaskRow } from "@/features/tasks/server/queries";

const STATUS_LABEL: Record<TaskRow["status"], string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  OVERDUE: "Overdue",
};

const PRIORITY_LABEL: Record<TaskRow["priority"], string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

function formatDue(d: Date | null): string {
  if (!d) return "—";
  return isToday(d)
    ? `Today, ${format(d, "h:mm a")}`
    : format(d, "MMM d, yyyy");
}

export function TaskInfoTooltip({
  task,
  children,
}: {
  task: TaskRow;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="top"
        align="start"
        className="max-w-[280px] rounded-[10px] border border-border bg-card px-3 py-2.5 text-foreground"
      >
        <div className="text-[13px] font-bold leading-snug">{task.title}</div>
        {task.description ? (
          <div className="mt-1 whitespace-pre-wrap text-[11.5px] text-muted-foreground">
            {task.description}
          </div>
        ) : null}
        <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground-strong">
          <div>
            <span className="font-semibold text-foreground/80">Priority:</span>{" "}
            {PRIORITY_LABEL[task.priority]}
          </div>
          <div>
            <span className="font-semibold text-foreground/80">Status:</span>{" "}
            {STATUS_LABEL[task.status]}
          </div>
          <div>
            <span className="font-semibold text-foreground/80">Due:</span>{" "}
            {formatDue(task.dueDate)}
          </div>
        </div>
        {task.tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {task.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-full bg-surface-2 px-2 py-[2px] text-[10.5px] font-medium text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}
