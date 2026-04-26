import { format } from "date-fns";
import type { DeadlineRow } from "@/features/goals/server/queries";

export function UpcomingDeadlinesCard({ rows }: { rows: DeadlineRow[] }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-[14px] font-bold">Upcoming Deadlines</h4>
        <span className="text-[12px] text-primary-soft">View all</span>
      </div>
      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-3 py-4 text-center text-[12px] text-muted-foreground-strong">
          No upcoming deadlines.
        </div>
      ) : (
        <div className="space-y-0">
          {rows.map((r) => {
            const tone =
              r.daysAway <= 7
                ? "bg-kpi-red/15 text-kpi-red"
                : r.daysAway <= 30
                  ? "bg-kpi-orange/15 text-kpi-orange"
                  : "bg-kpi-green/15 text-kpi-green";
            return (
              <div
                key={r.id}
                className="flex items-center justify-between border-b border-border py-2.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <h5 className="truncate text-[13px] font-semibold">
                    {r.title}
                  </h5>
                  <p className="text-[11px] text-muted-foreground-strong">
                    {format(r.targetDate, "MMM d, yyyy")}
                  </p>
                </div>
                <span
                  className={`whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold ${tone}`}
                >
                  {r.daysAway}d
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
