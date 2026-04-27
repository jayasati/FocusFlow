import Link from "next/link";
import { Check } from "lucide-react";
import { format } from "date-fns";
import type { SessionRow } from "@/features/timer/server/queries";

function fmtRange(start: Date, end: Date | null): string {
  const s = format(start, "h:mm a");
  const e = end ? format(end, "h:mm a") : "now";
  return `${s} – ${e}`;
}
function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const TYPE_LABEL: Record<SessionRow["type"], string> = {
  FOCUS: "Focus",
  SHORT_BREAK: "Short Break",
  LONG_BREAK: "Long Break",
  CUSTOM: "Custom",
};

export function SessionsList({
  rows,
  hideHeader = false,
}: {
  rows: SessionRow[];
  hideHeader?: boolean;
}) {
  return (
    <section>
      {hideHeader ? null : (
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-[14px] font-extrabold">Sessions</h3>
          <Link
            href="/timer/sessions"
            className="text-[11px] font-bold text-primary-soft hover:text-primary"
          >
            View All
          </Link>
        </div>
      )}
      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-6 text-center text-[12px] text-muted-foreground-strong">
          No sessions yet — start a Pomodoro to log your first one.
        </div>
      ) : (
        <div>
          {rows.map((r) => (
            <Row key={r.id} row={r} />
          ))}
        </div>
      )}
    </section>
  );
}

function Row({ row }: { row: SessionRow }) {
  const isBreak = row.type === "SHORT_BREAK" || row.type === "LONG_BREAK";
  const dotClass = isBreak ? "bg-kpi-green" : "bg-primary";

  const title =
    row.habitName ?? row.taskTitle ?? TYPE_LABEL[row.type];

  return (
    <div className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0">
      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dotClass}`} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 truncate text-[12px] font-bold">
          {row.habitName && row.habitIcon ? (
            <span className="text-[13px]">{row.habitIcon}</span>
          ) : null}
          <span className="truncate">{title}</span>
        </div>
        <div className="text-[10px] text-muted-foreground-strong">
          {fmtRange(row.startedAt, row.endedAt)}
        </div>
      </div>
      <div className="text-[12px] font-extrabold tabular-nums text-kpi-green">
        {fmtDuration(row.durationSec)}
      </div>
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-kpi-green">
        <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
      </span>
    </div>
  );
}
