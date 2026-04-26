"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Sort } from "@/features/tasks/schema";

const OPTS: { key: Sort; label: string }[] = [
  { key: "PRIORITY", label: "Priority" },
  { key: "DUE_DATE", label: "Due date" },
  { key: "CREATED", label: "Created" },
];

export function SortButton({ active }: { active: Sort }) {
  const router = useRouter();
  const sp = useSearchParams();
  const activeLabel = OPTS.find((o) => o.key === active)?.label ?? "Priority";

  function pick(key: Sort) {
    const params = new URLSearchParams(sp);
    if (key === "PRIORITY") params.delete("sort");
    else params.set("sort", key);
    router.push(`/tasks?${params.toString()}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-[8px] border border-border bg-sidebar px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground">
        Sort by: {activeLabel}
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTS.map((o) => (
          <DropdownMenuItem key={o.key} onSelect={() => pick(o.key)}>
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
