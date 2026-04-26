import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="flex h-screen flex-col">
      {/* Mirror PageHeader layout so the chrome doesn't shift */}
      <header className="flex flex-wrap items-center justify-between gap-4 px-8 py-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40 rounded-md" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-[230px] rounded-md" />
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </header>

      {/* Soft purple sweep at the top of the content as a progress hint */}
      <div className="relative h-[2px] overflow-hidden bg-border">
        <div className="absolute inset-y-0 left-0 w-1/3 animate-[loadbar_1.1s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary to-transparent" />
      </div>

      <div className="flex-1 px-8 pt-5">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-[14px]" />
          ))}
        </div>
        <Skeleton className="mt-4 h-[420px] w-full rounded-[14px]" />
      </div>
    </div>
  );
}
