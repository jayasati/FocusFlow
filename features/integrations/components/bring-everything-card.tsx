import { Puzzle } from "lucide-react";

export function BringEverythingTogetherCard() {
  return (
    <div className="rounded-[14px] border border-border bg-keep-going p-[14px]">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary text-white">
          <Puzzle className="h-4 w-4" />
        </div>
        <div className="text-[13px] font-bold">Bring everything together</div>
      </div>
      <div className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Connect your tools to unlock the full picture of your productivity.
      </div>
    </div>
  );
}
