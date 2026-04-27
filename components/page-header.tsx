import type { ReactNode } from "react";
import { TopBar } from "@/components/top-bar";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: ReactNode;
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
        "flex flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6 md:px-8 md:py-6",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold tracking-tight text-foreground md:text-2xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {subtitle}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 md:gap-3 md:pr-[110px]">
        {/* md+ trailing pad reserves space for the persistent bell + UserButton */}
        {actions}
        <TopBar searchPlaceholder={searchPlaceholder} />
      </div>
    </header>
  );
}
