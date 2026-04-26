export function SmallStepsCard() {
  return (
    <div
      className="relative overflow-hidden rounded-[14px] border border-primary/30 p-4"
      style={{
        backgroundImage: "linear-gradient(135deg, #26185a, #160e38)",
      }}
    >
      <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-primary/25 blur-[18px]" />
      <div className="relative">
        <div className="text-[13px] font-bold leading-tight">
          Small steps
          <br />
          lead to big changes.
        </div>
        <div className="mt-3 flex justify-center text-[44px] leading-none">
          🎯
        </div>
      </div>
    </div>
  );
}
