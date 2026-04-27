import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashRange } from "@/features/dashboard/server/queries";
import { GreetingSubtitle } from "@/features/dashboard/components/greeting-subtitle";
import { KpiRow } from "@/features/dashboard/components/kpi-row";
import { ProductivityCard } from "@/features/dashboard/components/productivity-card";
import { TodayFocusCard } from "@/features/dashboard/components/today-focus-card";
import { TimeTrackedCard } from "@/features/dashboard/components/time-tracked-card";
import { HabitTrackerCard } from "@/features/dashboard/components/habit-tracker-card";
import { PomodoroCard } from "@/features/dashboard/components/pomodoro-card";
import { QuickJournalCard } from "@/features/dashboard/components/quick-journal-card";

type SP = Record<string, string | string[] | undefined>;
const RANGES: DashRange[] = ["DAY", "WEEK", "MONTH", "YEAR"];

function pickStr(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const rawRange = pickStr(sp.prange);
  const range: DashRange = (RANGES as string[]).includes(rawRange ?? "")
    ? (rawRange as DashRange)
    : "WEEK";

  const user = await currentUser();
  const name = user?.firstName ?? "there";

  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title="Dashboard"
        subtitle={<GreetingSubtitle name={name} />}
        searchPlaceholder="Search anything…"
      />

      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4 lg:px-5">
        <div className="space-y-4">
          <Suspense fallback={<KpiSkeleton />}>
            <KpiRow />
          </Suspense>

          <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
            <Suspense
              fallback={<Skeleton className="h-[300px] rounded-[14px]" />}
            >
              <ProductivityCard range={range} />
            </Suspense>
            <Suspense
              fallback={<Skeleton className="h-[300px] rounded-[14px]" />}
            >
              <TodayFocusCard />
            </Suspense>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Suspense
              fallback={<Skeleton className="h-[230px] rounded-[14px]" />}
            >
              <TimeTrackedCard />
            </Suspense>
            <Suspense
              fallback={<Skeleton className="h-[230px] rounded-[14px]" />}
            >
              <HabitTrackerCard />
            </Suspense>
            <PomodoroCard />
            <QuickJournalCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[78px] rounded-[14px]" />
      ))}
    </div>
  );
}
