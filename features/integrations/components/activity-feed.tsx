import { AlertTriangle, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PROVIDER_META,
} from "@/features/integrations/components/provider-meta";
import type { ActivityItem } from "@/features/integrations/server/queries";

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-[14px] border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-bold">
          Recent Activity from Integrations
        </h3>
        <span className="text-[10.5px] text-muted-foreground-strong">
          {items.length === 0
            ? "Nothing yet"
            : `${items.length} ${items.length === 1 ? "event" : "events"}`}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 py-6 text-center">
          <span className="text-[12px] font-semibold text-muted-foreground">
            No activity yet
          </span>
          <span className="text-[11px] text-muted-foreground-strong">
            Connect an integration above to see events here.
          </span>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const meta = PROVIDER_META[item.provider];
            const Icon = meta.icon;
            const isError = item.tone === "error";
            const isWarning = item.tone === "warning";
            const external = item.href?.startsWith("http") ?? false;
            const Wrapper = item.href ? "a" : "div";
            const wrapperProps = item.href
              ? {
                  href: item.href,
                  target: external ? "_blank" : undefined,
                  rel: external ? "noopener noreferrer" : undefined,
                }
              : {};

            return (
              <li key={item.id}>
                <Wrapper
                  {...wrapperProps}
                  className={cn(
                    "flex items-center gap-3 py-2.5 first:pt-0 last:pb-0",
                    item.href &&
                      "-mx-2 cursor-pointer rounded-[8px] px-2 transition-colors hover:bg-primary/10",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      isError
                        ? "bg-kpi-red/15 text-kpi-red"
                        : meta.tileBg,
                    )}
                  >
                    {isError ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Icon className={cn("h-4 w-4", meta.tileFg)} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "truncate text-[12.5px] font-semibold",
                        isError && "text-kpi-red",
                        isWarning && "text-kpi-orange",
                      )}
                    >
                      {item.title}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground-strong">
                      {item.body}
                    </div>
                  </div>
                  <span className="hidden shrink-0 text-[10.5px] text-muted-foreground-strong sm:block">
                    {item.when}
                  </span>
                  {item.href ? (
                    external ? (
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground-strong" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground-strong" />
                    )
                  ) : null}
                </Wrapper>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
