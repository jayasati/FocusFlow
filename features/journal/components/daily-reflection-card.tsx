import Link from "next/link";

export function DailyReflectionCard() {
  return (
    <div
      className="relative overflow-hidden rounded-[14px] border border-primary/30 p-4"
      style={{
        backgroundImage: "linear-gradient(135deg, #2a1a5e, #1a1035)",
      }}
    >
      <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-primary/20 blur-[18px]" />
      <div className="relative">
        <div className="text-[28px]">📔</div>
        <div className="mt-2 text-[13px] font-bold">Daily Reflection</div>
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
          A few words can change your tomorrow.
        </p>
        <Link
          href="/journal/new"
          className="mt-3 flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-primary-soft"
        >
          Write New Entry
        </Link>
      </div>
    </div>
  );
}
