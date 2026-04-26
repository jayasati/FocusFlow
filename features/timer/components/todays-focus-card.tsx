import { Target } from "lucide-react";
import { EditGoalDialog } from "@/features/timer/components/edit-goal-dialog";

function fmtHm(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function TodaysFocusCard({
  sessions,
  totalSec,
  goalPct,
  goalMinutes,
}: {
  sessions: number;
  totalSec: number;
  goalPct: number;
  goalMinutes: number;
}) {
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  const dash = (Math.min(100, goalPct) / 100) * circ;

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-[13px] font-bold">
        <Target className="h-3.5 w-3.5 text-primary" />
        Today&apos;s Focus
      </div>
      <div>
        <div className="text-[32px] font-extrabold leading-none">{sessions}</div>
        <div className="mt-1 text-[11px] text-muted-foreground-strong">
          Sessions
        </div>
      </div>
      <div>
        <div className="text-[18px] font-extrabold leading-none">
          {fmtHm(totalSec)}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground-strong">
          Total Focus Time
        </div>
      </div>

      <div className="flex justify-center">
        <div className="relative h-[90px] w-[90px]">
          <svg viewBox="0 0 90 90" className="absolute inset-0 -rotate-90">
            <circle
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke="hsl(var(--surface-2))"
              strokeWidth="9"
            />
            <defs>
              <linearGradient id="goalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--primary-soft))" />
              </linearGradient>
            </defs>
            <circle
              cx="45"
              cy="45"
              r={radius}
              fill="none"
              stroke="url(#goalGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circ - dash}`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[18px] font-extrabold">{goalPct}%</div>
            <div className="text-[9px] text-muted-foreground-strong">
              of daily goal
            </div>
          </div>
        </div>
      </div>

      <EditGoalDialog initialMinutes={goalMinutes} />
    </div>
  );
}
