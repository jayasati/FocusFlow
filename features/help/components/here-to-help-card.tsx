import { Headphones } from "lucide-react";

export function HereToHelpCard() {
  return (
    <div className="rounded-[14px] border border-border bg-keep-going p-[14px]">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
          <Headphones className="h-4 w-4" />
        </div>
        <div className="text-[13px] font-bold">
          We&apos;re here to help
          <span className="ml-0.5">💜</span>
        </div>
      </div>
      <div className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Need quick answers? Try the search above or browse popular articles.
      </div>
    </div>
  );
}
