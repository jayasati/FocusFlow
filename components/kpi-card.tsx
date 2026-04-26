import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Color = "blue" | "green" | "orange" | "red" | "purple";

const tints: Record<Color, string> = {
  blue: "bg-kpi-blue/15 text-kpi-blue",
  green: "bg-kpi-green/15 text-kpi-green",
  orange: "bg-kpi-orange/15 text-kpi-orange",
  red: "bg-kpi-red/15 text-kpi-red",
  purple: "bg-kpi-purple/15 text-primary-soft",
};

const subTints: Record<Color, string> = {
  blue: "text-kpi-blue",
  green: "text-kpi-green",
  orange: "text-kpi-orange",
  red: "text-kpi-red",
  purple: "text-primary-soft",
};

export function KpiCard({
  label,
  value,
  sub,
  subTone = "muted",
  color,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  subTone?: Color | "muted";
  color: Color;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-border bg-card px-4 py-3.5">
      <div
        className={cn(
          "flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-full",
          tints[color],
        )}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="text-[26px] font-bold leading-none">{value}</div>
        {sub ? (
          <div
            className={cn(
              "mt-1 text-[11px]",
              subTone === "muted" ? "text-muted-foreground-strong" : subTints[subTone],
            )}
          >
            {sub}
          </div>
        ) : null}
      </div>
    </div>
  );
}
