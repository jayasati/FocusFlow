import { CheckCircle2, Clock, Flame, XCircle } from "lucide-react";
import { KpiCard } from "@/components/kpi-card";
import { getDashboardKpis } from "@/features/dashboard/server/queries";

export async function KpiRow() {
  const k = await getDashboardKpis();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Completed"
        value={k.completedToday}
        sub="tasks today"
        subTone="green"
        color="green"
        icon={<CheckCircle2 className="h-5 w-5" />}
      />
      <KpiCard
        label="Overdue"
        value={k.overdue}
        sub="needs attention"
        subTone="orange"
        color="orange"
        icon={<Clock className="h-5 w-5" />}
      />
      <KpiCard
        label="Missed"
        value={k.missedHabitsToday}
        sub="habits today"
        subTone="red"
        color="red"
        icon={<XCircle className="h-5 w-5" />}
      />
      <KpiCard
        label="Streak"
        value={`${k.bestStreakDays} days`}
        sub="keep it going"
        subTone="purple"
        color="purple"
        icon={<Flame className="h-5 w-5" />}
      />
    </div>
  );
}
