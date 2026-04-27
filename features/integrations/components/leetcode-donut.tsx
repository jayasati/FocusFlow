"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { IntegrationOverview } from "@/features/integrations/server/queries";

export function LeetcodeProgress({
  data,
}: {
  data: IntegrationOverview["leetcode"];
}) {
  const slices = [
    { name: "Easy", value: data.easy, color: "hsl(var(--kpi-green))" },
    { name: "Medium", value: data.medium, color: "hsl(var(--kpi-orange))" },
    { name: "Hard", value: data.hard, color: "hsl(var(--kpi-red))" },
  ];
  const empty = data.total === 0;
  const chartData = empty
    ? [{ name: "—", value: 1, color: "hsl(var(--surface-2))" }]
    : slices.filter((s) => s.value > 0);

  const badge = !data.connected
    ? "Not connected"
    : empty
      ? "Awaiting sync"
      : "This Week";

  return (
    <div className="flex h-full flex-col gap-3 rounded-[14px] border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-bold">LeetCode Progress</h3>
        <span className="rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {badge}
        </span>
      </div>

      <div className="flex flex-1 items-center gap-4">
        <div className="relative h-[120px] w-[120px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={36}
                outerRadius={56}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[18px] font-extrabold leading-none">
              {data.total}
            </div>
            <div className="text-[9px] text-muted-foreground-strong">
              {empty ? (data.connected ? "—" : "—") : "solved"}
            </div>
          </div>
        </div>

        <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
          {slices.map((s) => (
            <li
              key={s.name}
              className="flex items-center justify-between gap-2 text-[11px]"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-muted-foreground">{s.name}</span>
              </span>
              <span className="font-semibold">{s.value}</span>
            </li>
          ))}
          <li className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-1.5 text-[11px]">
            <span className="text-muted-foreground">Current streak</span>
            <span className="font-bold text-primary-soft">
              {data.connected ? `${data.currentStreak} days` : "—"}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
