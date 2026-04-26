import { cn } from "@/lib/utils";

export function DailyProgressCard({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const safe = total === 0 ? 1 : total;
  const pct = Math.round((completed / safe) * 100);
  const radius = 44;
  const circ = 2 * Math.PI * radius;
  const dash = (pct / 100) * circ;

  return (
    <div
      className={cn(
        "rounded-[14px] border border-border p-[14px]",
        "bg-daily-progress",
      )}
    >
      <div className="text-[13px] font-bold">Daily Progress</div>
      <div className="text-[10.5px] text-muted-foreground">Keep it up! 🔥</div>

      <div className="relative mx-auto mt-3 h-[110px] w-[110px]">
        <svg viewBox="0 0 110 110" className="absolute inset-0 -rotate-90">
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="hsl(var(--primary) / 0.15)"
            strokeWidth="9"
          />
          <defs>
            <linearGradient id="dpGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary-soft))" />
            </linearGradient>
          </defs>
          <circle
            cx="55"
            cy="55"
            r={radius}
            fill="none"
            stroke="url(#dpGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-[22px] font-bold leading-none">{pct}%</div>
          <div className="mt-1 text-[9.5px] text-muted-foreground">
            Tasks Completed
          </div>
        </div>
      </div>

      <div className="text-center text-[12px] text-muted-foreground">
        <strong className="text-foreground">{completed}</strong> / {total}
      </div>
    </div>
  );
}
