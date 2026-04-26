"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import type { Filter } from "@/features/tasks/schema";

const TABS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "TODAY", label: "Today" },
  { key: "UPCOMING", label: "Upcoming" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "COMPLETED", label: "Completed" },
];

export function FilterChips({ active }: { active: Filter }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();

  function pick(key: Filter) {
    const params = new URLSearchParams(sp);
    if (key === "ALL") params.delete("filter");
    else params.set("filter", key);
    params.delete("page");
    startTransition(() => router.push(`/tasks?${params.toString()}`));
  }

  return (
    <div className="flex items-center gap-0">
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => pick(t.key)}
            disabled={pending && isActive}
            className={cn(
              "border-b-2 px-4 py-2 text-[13px] font-medium transition-colors",
              isActive
                ? "border-primary text-primary-soft"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
