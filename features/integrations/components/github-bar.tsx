"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GithubMark } from "@/features/integrations/components/brand-icons";
import type { IntegrationOverview } from "@/features/integrations/server/queries";

export function GithubActivityBar({
  bars,
  total,
  connected,
}: {
  bars: IntegrationOverview["githubBars"];
  total: number;
  connected: boolean;
}) {
  const badge = !connected
    ? "Not connected"
    : total === 0
      ? "Awaiting sync"
      : `${total} commits`;
  return (
    <div className="flex h-full flex-col gap-2 rounded-[14px] border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-[13px] font-bold">Coding Activity (GitHub)</h3>
        <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          <GithubMark className="h-3 w-3" />
          {badge}
        </span>
      </div>

      <div className="relative h-[170px]">
        {!connected || total === 0 ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-[11px] font-semibold text-muted-foreground-strong">
              {connected
                ? "Awaiting first sync"
                : "Connect GitHub to see commits"}
            </span>
          </div>
        ) : null}
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={bars}
            margin={{ top: 6, right: 6, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              stroke="hsl(var(--border))"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 10,
                fill: "hsl(var(--muted-foreground-strong))",
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{
                fontSize: 10,
                fill: "hsl(var(--muted-foreground-strong))",
              }}
              width={24}
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--surface-2))" }}
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                fontSize: 11,
              }}
            />
            <Bar
              dataKey="commits"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
