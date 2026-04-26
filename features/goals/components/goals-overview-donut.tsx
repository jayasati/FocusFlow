"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { GoalStats } from "@/features/goals/server/queries";

export function GoalsOverviewDonut({ stats }: { stats: GoalStats }) {
  const slices = [
    {
      label: "Completed",
      value: stats.completed,
      color: "hsl(var(--kpi-green))",
    },
    {
      label: "In Progress",
      value: stats.inProgress,
      color: "hsl(var(--kpi-orange))",
    },
    {
      label: "Not Started",
      value: stats.notStarted,
      color: "hsl(var(--kpi-red))",
    },
  ];
  const total = stats.total;
  const data =
    total > 0
      ? slices
      : [{ label: "Empty", value: 1, color: "hsl(var(--surface-2))" }];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-[14px] font-bold">Goals Overview</h4>
      </div>
      <div className="flex items-center gap-3.5">
        <div className="relative h-[100px] w-[100px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={32}
                outerRadius={48}
                paddingAngle={1}
                stroke="none"
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[22px] font-bold">{total}</div>
            <div className="text-[10px] text-muted-foreground-strong">Goals</div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-[12px]">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              <span className="flex-1 text-muted-foreground">{s.label}</span>
              <span className="font-semibold">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
