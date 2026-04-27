import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTimeTrackedSummary } from "@/features/dashboard/server/queries";
import { cn } from "@/lib/utils";

function fmtHm(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export async function TimeTrackedCard() {
  const t = await getTimeTrackedSummary();
  const max = Math.max(1, ...t.bars.map((b) => b.minutes));
  return (
    <div className="flex h-full flex-col gap-3 rounded-[14px] border border-border bg-card p-4">
      <h3 className="text-[13px] font-bold">Time Tracked</h3>
      <div>
        <div className="text-[28px] font-extrabold leading-none">
          {fmtHm(t.todaySec)}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground-strong">
          today
        </div>
      </div>

      <div className="flex flex-1 items-end gap-1.5">
        {t.bars.map((b) => {
          const pct = b.minutes > 0 ? Math.max(8, (b.minutes / max) * 100) : 4;
          return (
            <div
              key={b.key}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div className="flex h-[60px] w-full items-end">
                <div
                  className={cn(
                    "w-full rounded-t-sm",
                    b.isToday ? "bg-primary" : "bg-primary/35",
                  )}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-[9px] text-muted-foreground-strong">
                {b.label[0]}
              </span>
            </div>
          );
        })}
      </div>

      <Link
        href="/analytics"
        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-border bg-surface-2 px-3 py-1.5 text-[11.5px] font-semibold text-foreground transition-colors hover:bg-primary/15"
      >
        View Time Logs
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}
