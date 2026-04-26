"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function JournalCalendar({ entryDays = [] }: { entryDays?: number[] }) {
  const [cursor, setCursor] = useState(() => new Date());
  const today = new Date();

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
    const out: Date[] = [];
    for (let d = start; d <= end; d = new Date(d.getTime() + 86_400_000)) {
      out.push(new Date(d));
    }
    return out;
  }, [cursor]);

  const dotSet = new Set(entryDays);

  return (
    <div>
      <div className="mb-3 flex items-center gap-1.5 text-[14px] font-bold">
        <CalendarDays className="h-3.5 w-3.5" />
        Calendar
      </div>
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={() => setCursor((c) => addMonths(c, -1))}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-[13px] font-semibold">
          {format(cursor, "MMMM yyyy")}
        </span>
        <button
          onClick={() => setCursor((c) => addMonths(c, 1))}
          className="text-muted-foreground hover:text-foreground"
          aria-label="Next month"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div
            key={d}
            className="py-1 text-center text-[10px] font-semibold text-muted-foreground-strong"
          >
            {d}
          </div>
        ))}
        {days.map((d) => {
          const inMonth = isSameMonth(d, cursor);
          const isToday = isSameDay(d, today);
          const hasEntry = inMonth && dotSet.has(d.getDate());
          return (
            <div
              key={d.toISOString()}
              className="relative flex items-center justify-center"
            >
              <div
                className={cn(
                  "flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-[11px] transition-colors",
                  !inMonth && "text-muted-foreground-strong/40",
                  inMonth && !isToday && "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
                  isToday && "bg-primary font-bold text-white",
                )}
              >
                {d.getDate()}
              </div>
              {hasEntry && !isToday ? (
                <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary-soft" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
