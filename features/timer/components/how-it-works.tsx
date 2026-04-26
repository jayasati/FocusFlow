import { ArrowRight } from "lucide-react";

const STEPS = [
  { emoji: "🍅", title: "1. Focus", body: "Work for 25 mins with full focus." },
  { emoji: "☕", title: "2. Short Break", body: "Take a 5 min break to relax." },
  { emoji: "🔁", title: "3. Repeat", body: "Complete 4 cycles of focus." },
  { emoji: "🫗", title: "4. Long Break", body: "Take a 15–30 min break and recharge." },
];

export function HowItWorks() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="mb-3 text-[13px] font-bold">How it works?</h3>
      <div className="flex flex-wrap items-start gap-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex flex-1 min-w-[160px] items-center gap-2.5">
            <div className="flex flex-1 items-start gap-2.5">
              <div className="text-[22px] leading-none">{s.emoji}</div>
              <div>
                <div className="text-[11px] font-bold">{s.title}</div>
                <div className="mt-0.5 text-[10.5px] leading-snug text-muted-foreground-strong">
                  {s.body}
                </div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground-strong md:block" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-border pt-3 text-center text-[11px] text-muted-foreground">
        💡 Tip: Try to avoid distractions and stay in the zone!
      </div>
    </div>
  );
}
