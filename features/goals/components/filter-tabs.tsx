"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Filter } from "@/features/goals/schema";

const TABS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "COMPLETED", label: "Completed" },
  { key: "NOT_STARTED", label: "Not Started" },
];

export function FilterTabs({ active }: { active: Filter }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();

  function pick(k: Filter) {
    const params = new URLSearchParams(sp);
    if (k === "ALL") params.delete("filter");
    else params.set("filter", k);
    start(() => router.push(`/goals?${params.toString()}`));
  }

  return (
    <div className="flex items-center gap-0.5 rounded-[10px] border border-border bg-card p-1">
      {TABS.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => pick(t.key)}
            disabled={pending && isActive}
            className={cn(
              "rounded-[7px] px-3.5 py-1.5 text-[13px] font-medium transition-colors",
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
