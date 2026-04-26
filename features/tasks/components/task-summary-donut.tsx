"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

type Slice = { label: string; value: number; pct: number; color: string };

export function TaskSummaryDonut({
  completed,
  pending,
  overdue,
  total,
}: {
  completed: number;
  pending: number;
  overdue: number;
  total: number;
}) {
  const safe = total === 0 ? 1 : total;
  const slices: Slice[] = [
    {
      label: "Completed",
      value: completed,
      pct: Math.round((completed / safe) * 100),
      color: "hsl(var(--kpi-green))",
    },
    {
      label: "Pending",
      value: pending,
      pct: Math.round((pending / safe) * 100),
      color: "hsl(var(--kpi-orange))",
    },
    {
      label: "Overdue",
      value: overdue,
      pct: Math.round((overdue / safe) * 100),
      color: "hsl(var(--kpi-red))",
    },
  ];

  const data = slices.length && total > 0 ? slices : [{ label: "Empty", value: 1, pct: 100, color: "hsl(var(--surface-2))" }];

  return (
    <div className="rounded-[14px] border border-border bg-card p-[14px]">
      <div className="mb-3 text-[13.5px] font-bold">Task Summary</div>
      <div className="flex items-center gap-3">
        <div className="h-[90px] w-[90px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={26}
                outerRadius={42}
                paddingAngle={1}
                stroke="none"
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 space-y-1.5">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-[11.5px]">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              <span className="flex-1 text-muted-foreground">{s.label}</span>
              <span className="font-medium">{s.value}</span>
              <span className="text-[10.5px] text-muted-foreground-strong">
                ({s.pct}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
