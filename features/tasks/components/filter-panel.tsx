"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ANY = "__any__";

export function FilterPanel({
  initial,
  tags,
}: {
  initial: { priority?: string; status?: string; tag?: string };
  tags: string[];
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, start] = useTransition();
  const [priority, setPriority] = useState(initial.priority ?? ANY);
  const [status, setStatus] = useState(initial.status ?? ANY);
  const [tag, setTag] = useState(initial.tag ?? ANY);

  function apply() {
    const params = new URLSearchParams(sp);
    if (priority === ANY) params.delete("priority");
    else params.set("priority", priority);
    if (status === ANY) params.delete("status");
    else params.set("status", status);
    if (tag === ANY) params.delete("tag");
    else params.set("tag", tag);
    params.delete("page");
    start(() => router.push(`/tasks?${params.toString()}`));
  }

  function clearAll() {
    setPriority(ANY);
    setStatus(ANY);
    setTag(ANY);
    const params = new URLSearchParams(sp);
    params.delete("priority");
    params.delete("status");
    params.delete("tag");
    params.delete("page");
    start(() => router.push(`/tasks?${params.toString()}`));
  }

  return (
    <div className="rounded-[14px] border border-border bg-card p-[14px]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[13.5px] font-bold">Filters</div>
        <button
          type="button"
          onClick={clearAll}
          className="text-[11.5px] text-primary-soft hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-2.5">
        <FilterRow label="Priority">
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="bg-surface-2 text-[12px]">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All Priorities</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </FilterRow>
        <FilterRow label="Status">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="bg-surface-2 text-[12px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="OVERDUE">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </FilterRow>
        <FilterRow label="Tags">
          <Select value={tag} onValueChange={setTag}>
            <SelectTrigger className="bg-surface-2 text-[12px]">
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY}>All Tags</SelectItem>
              {tags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterRow>
      </div>

      <button
        type="button"
        onClick={apply}
        disabled={pending}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-[8px] bg-primary px-3 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-soft disabled:opacity-60"
      >
        <Send className="h-3.5 w-3.5" />
        Apply Filters
      </button>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 text-[11px] text-muted-foreground">{label}</div>
      {children}
    </div>
  );
}
