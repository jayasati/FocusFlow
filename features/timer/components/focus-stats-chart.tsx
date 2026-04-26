"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FocusStats } from "@/features/timer/server/queries";

function fmtHm(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function FocusStatsChart({ stats }: { stats: FocusStats }) {
  const data = stats.bars.map((b) => ({
    label: b.label,
    minutes: b.minutes,
    highlight: b.highlight,
  }));
  const max = Math.max(60, ...data.map((d) => d.minutes));

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[14px] font-extrabold">Focus Statistics</h3>
        <div className="rounded-md border border-border bg-card px-2 py-1 text-[11px] font-bold">
          This Week
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-3.5">
        <div className="h-[110px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground-strong))" }}
              />
              <YAxis
                hide
                domain={[0, max]}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--primary) / 0.1)" }}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 8,
                  fontSize: 11,
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(v) => [fmtHm(Number(v) || 0), "Focus"]}
              />
              <Bar dataKey="minutes" radius={[4, 4, 0, 0]}>
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.highlight
                        ? "hsl(var(--primary))"
                        : "hsl(var(--primary) / 0.5)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 grid grid-cols-3 border-t border-border pt-2.5">
          <Stat label="Total Focus Time" value={fmtHm(stats.totalMinutes)} />
          <Stat label="Sessions" value={String(stats.sessionsCount)} center />
          <Stat
            label="Avg. Session"
            value={`${stats.avgMinutes}m`}
            right
          />
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  center,
  right,
}: {
  label: string;
  value: string;
  center?: boolean;
  right?: boolean;
}) {
  const align = center ? "text-center" : right ? "text-right" : "text-left";
  return (
    <div className={align}>
      <div className="text-[10.5px] font-semibold text-muted-foreground-strong">
        {label}
      </div>
      <div className="mt-0.5 text-[14px] font-extrabold">{value}</div>
    </div>
  );
}
