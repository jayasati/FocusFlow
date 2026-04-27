"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { IntegrationOverview } from "@/features/integrations/server/queries";

export function TimeBreakdownDonut({
  rows,
  totalHours,
  totalMinutesRem,
}: {
  rows: IntegrationOverview["timeBreakdown"];
  totalHours: number;
  totalMinutesRem: number;
}) {
  const data =
    rows.every((r) => r.minutes === 0)
      ? [{ name: "No data", value: 1, color: "hsl(var(--surface-2))" }]
      : rows
          .filter((r) => r.minutes > 0)
          .map((r) => ({ name: r.label, value: r.minutes, color: r.color }));
  const empty = rows.every((r) => r.minutes === 0);

  return (
    <div className="flex h-full flex-col gap-3 rounded-[14px] border border-border bg-card p-4">
      <h3 className="text-[13px] font-bold">Time Breakdown</h3>
      <p className="-mt-1 text-[10.5px] text-muted-foreground-strong">
        From integrations
      </p>

      <div className="flex flex-1 items-center gap-4">
        <div className="relative h-[120px] w-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={36}
                outerRadius={56}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[16px] font-extrabold leading-none">
              {empty ? "0h" : `${totalHours}h`}
            </div>
            <div className="text-[9px] text-muted-foreground-strong">
              {empty ? "Total" : `${totalMinutesRem}m total`}
            </div>
          </div>
        </div>

        <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
          {rows.map((r) => (
            <li
              key={r.label}
              className="flex items-center justify-between gap-2 text-[11px]"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: r.color }}
                />
                <span className="truncate text-muted-foreground">
                  {r.label}
                </span>
              </span>
              <span className="font-semibold">
                {Math.floor(r.minutes / 60)}h {r.minutes % 60}m
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
