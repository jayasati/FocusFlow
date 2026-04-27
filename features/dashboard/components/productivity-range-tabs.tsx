"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { DashRange } from "@/features/dashboard/server/queries";

const TABS: { key: DashRange; label: string }[] = [
  { key: "DAY", label: "Day" },
  { key: "WEEK", label: "Week" },
  { key: "MONTH", label: "Month" },
  { key: "YEAR", label: "Year" },
];

export function ProductivityRangeTabs({ active }: { active: DashRange }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

  function pick(key: DashRange) {
    const params = new URLSearchParams(sp);
    if (key === "WEEK") params.delete("prange");
    else params.set("prange", key);
    const qs = params.toString();
    start(() => router.push(qs ? `/dashboard?${qs}` : "/dashboard"));
  }

  return (
    <div className="flex gap-0.5 rounded-[10px] border border-border bg-card/60 p-0.5">
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => pick(t.key)}
            disabled={pending && isActive}
            className={cn(
              "rounded-[7px] px-2.5 py-1 text-[11px] font-semibold transition-colors",
              isActive
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
