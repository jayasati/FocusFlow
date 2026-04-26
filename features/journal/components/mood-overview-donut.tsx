"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { MOODS } from "@/features/journal/schema";

export function MoodOverviewDonut({
  moodCounts,
}: {
  moodCounts: Record<1 | 2 | 3 | 4 | 5, number>;
}) {
  const total =
    moodCounts[1] + moodCounts[2] + moodCounts[3] + moodCounts[4] + moodCounts[5];
  const safe = total === 0 ? 1 : total;

  const slices = MOODS.map((m) => ({
    label: m.label,
    color: m.color,
    value: moodCounts[m.value],
    pct: Math.round((moodCounts[m.value] / safe) * 100),
  }));

  const data =
    total > 0
      ? slices
      : [{ label: "Empty", value: 1, pct: 100, color: "hsl(var(--surface-2))" }];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[14px] font-bold">Mood Overview</span>
        <span className="rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
          This Month
        </span>
      </div>
      <div className="flex items-center gap-3.5">
        <div className="relative h-[90px] w-[90px] shrink-0">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={28}
                outerRadius={45}
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
            <div className="text-[20px] font-bold">{total}</div>
            <div className="text-[9px] text-muted-foreground-strong">Entries</div>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-1.5 text-[11px]">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: s.color }}
              />
              <span className="flex-1 text-muted-foreground">{s.label}</span>
              <span className="font-semibold">{s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
