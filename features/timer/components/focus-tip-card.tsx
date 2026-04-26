export function FocusTipCard() {
  return (
    <div
      className="rounded-[14px] border border-primary/30 p-[14px] text-center"
      style={{
        backgroundImage: "linear-gradient(135deg, #1a1040, #120d38)",
      }}
    >
      <div className="flex items-center justify-center gap-1 text-[12px] font-bold text-amber-400">
        💡 Focus Tip
      </div>
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Break your work into focused intervals. You&apos;ll get more done!
      </p>
      <div className="mt-3 flex justify-center">
        <div
          className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-2xl"
          style={{
            background:
              "radial-gradient(circle, rgba(124,92,252,0.2), transparent 70%)",
          }}
        >
          🎯
        </div>
      </div>
    </div>
  );
}
