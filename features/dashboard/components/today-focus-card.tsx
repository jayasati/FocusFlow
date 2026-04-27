import { CheckSquare, ListTodo } from "lucide-react";
import { getTodayFocusSummary } from "@/features/dashboard/server/queries";
import { CurrentSessionRow } from "@/features/dashboard/components/current-session-row";

export async function TodayFocusCard() {
  const f = await getTodayFocusSummary();
  return (
    <div className="flex h-full flex-col gap-3 rounded-[14px] border border-border bg-card p-4">
      <h3 className="text-[14px] font-bold">Today Focus</h3>

      <div className="space-y-3">
        <Row
          icon={
            <ListTodo className="h-4 w-4 text-primary-soft" />
          }
          tint="bg-primary/15"
          title="Tasks Pending"
          subtitle={
            f.tasksPending === 0
              ? "All clear today"
              : `${f.tasksPending} tasks pending — ${f.tasksPendingHigh} high priority`
          }
        />
        <Row
          icon={<CheckSquare className="h-4 w-4 text-kpi-green" />}
          tint="bg-kpi-green/15"
          title="Habits Remaining"
          subtitle={
            f.habitsRequiredToday === 0
              ? "No habits scheduled today"
              : `${f.habitsRemaining} of ${f.habitsRequiredToday} left`
          }
        />
        <CurrentSessionRow />
      </div>
    </div>
  );
}

function Row({
  icon,
  tint,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  tint: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tint}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[12.5px] font-semibold">{title}</div>
        <div className="text-[11px] text-muted-foreground-strong">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
