import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  function href(p: number) {
    const params = new URLSearchParams(
      Object.entries(searchParams).filter(
        ([, v]) => v !== undefined,
      ) as [string, string][],
    );
    if (p === 1) params.delete("page");
    else params.set("page", String(p));
    const q = params.toString();
    return `/tasks${q ? `?${q}` : ""}`;
  }

  return (
    <nav className="flex items-center justify-center gap-1.5 pt-1">
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          "flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-border bg-sidebar text-muted-foreground transition-colors hover:bg-primary/15 hover:text-foreground",
          page === 1 && "pointer-events-none opacity-50",
        )}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          className={cn(
            "flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border text-[12.5px] font-medium transition-colors",
            p === page
              ? "border-primary bg-primary text-white"
              : "border-border bg-sidebar text-muted-foreground hover:bg-primary/15 hover:text-foreground",
          )}
        >
          {p}
        </Link>
      ))}
      <Link
        href={href(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={cn(
          "flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-border bg-sidebar text-muted-foreground transition-colors hover:bg-primary/15 hover:text-foreground",
          page === totalPages && "pointer-events-none opacity-50",
        )}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </nav>
  );
}
