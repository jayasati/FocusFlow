import type { ReactNode } from "react";
import { TopBar } from "@/components/top-bar";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  searchPlaceholder,
  actions,
  className,
}: Props) {
  return (
    <header
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 px-8 py-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <TopBar searchPlaceholder={searchPlaceholder} />
      </div>
    </header>
  );
}
