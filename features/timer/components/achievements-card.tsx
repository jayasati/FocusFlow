import type { Achievements } from "@/features/timer/server/queries";

const POMODORO_GOAL = 100;
const HOURS_GOAL = 50;

export function AchievementsCard({ a }: { a: Achievements }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-[14px] font-extrabold">Achievements</h3>
        <span className="text-[11px] font-bold text-primary-soft">View All</span>
      </div>

      <Row
        emoji="🔥"
        toneClass="bg-kpi-orange/15"
        name="Focus Streak"
        sub={`${a.focusStreakDays} ${a.focusStreakDays === 1 ? "day" : "days"} in a row`}
        right={
          <span className="flex items-center gap-1 text-[12px] font-extrabold text-kpi-orange">
            🔥 {a.focusStreakDays}
          </span>
        }
      />
      <Row
        emoji="🎯"
        toneClass="bg-primary/15"
        name="Total Focus Time"
        sub={`${HOURS_GOAL} hours`}
        right={
          <span className="rounded-md border border-primary/30 bg-primary/15 px-2 py-0.5 text-[12px] font-extrabold text-primary-soft">
            {a.totalFocusHours}h
          </span>
        }
      />
      <Row
        emoji="🏅"
        toneClass="bg-kpi-green/15"
        name="Pomodoro Master"
        sub={`Complete ${POMODORO_GOAL} sessions`}
        right={
          <span className="text-[12px] font-extrabold text-kpi-green">
            {a.pomodoroDone}/{POMODORO_GOAL}
          </span>
        }
      />
    </section>
  );
}

function Row({
  emoji,
  toneClass,
  name,
  sub,
  right,
}: {
  emoji: string;
  toneClass: string;
  name: string;
  sub: string;
  right: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border py-2 last:border-b-0">
      <div
        className={`flex h-[38px] w-[38px] items-center justify-center rounded-full text-lg ${toneClass}`}
      >
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[12px] font-bold">{name}</div>
        <div className="text-[10px] text-muted-foreground-strong">{sub}</div>
      </div>
      {right}
    </div>
  );
}
