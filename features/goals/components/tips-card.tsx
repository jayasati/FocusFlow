const TIPS = [
  { emoji: "🪜", text: "Break big goals into small wins." },
  { emoji: "📅", text: "Track progress every week." },
  { emoji: "🎉", text: "Celebrate milestones — even tiny ones." },
  { emoji: "🔁", text: "Stay consistent over perfect." },
];

export function TipsCard() {
  return (
    <div>
      <h4 className="mb-3 text-[14px] font-bold">Tips for Success</h4>
      <div className="space-y-1.5">
        {TIPS.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 text-[12px] text-muted-foreground"
          >
            <span className="text-[15px] leading-none">{t.emoji}</span>
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
