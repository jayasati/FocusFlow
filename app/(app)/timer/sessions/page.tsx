import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SESSIONS_PAGE_SIZE,
  getSessions,
} from "@/features/timer/server/queries";
import { SessionsList } from "@/features/timer/components/sessions-list";

type SP = Record<string, string | string[] | undefined>;

function pickStr(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(pickStr(sp.page)) || 1);

  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title="Sessions"
        subtitle="Your full focus history"
        actions={
          <Link
            href="/timer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-sidebar px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back to Timer
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto px-4 pb-6 pt-4 lg:px-5">
        <div className="mx-auto max-w-2xl space-y-4">
          <Suspense fallback={<ListSkeleton />}>
            <List page={page} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function List({ page }: { page: number }) {
  const { rows, totalPages, page: safePage } = await getSessions({ page });

  if (rows.length === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-border bg-card/40 px-6 py-16 text-center text-[12.5px] text-muted-foreground">
        No sessions yet — start a Pomodoro to log your first one.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-[14px] border border-border bg-card px-4 py-2">
        <SessionsList rows={rows} hideHeader />
      </div>
      <Pagination page={safePage} totalPages={totalPages} />
    </>
  );
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav className="flex items-center justify-center gap-1.5 pt-1">
      {pages.map((p) => {
        const href = p === 1 ? "/timer/sessions" : `/timer/sessions?page=${p}`;
        const active = p === page;
        return (
          <Link
            key={p}
            href={href}
            className={`flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border text-[12.5px] font-medium transition-colors ${
              active
                ? "border-primary bg-primary text-white"
                : "border-border bg-sidebar text-muted-foreground hover:bg-primary/15 hover:text-foreground"
            }`}
          >
            {p}
          </Link>
        );
      })}
    </nav>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2 rounded-[14px] border border-border bg-card p-4">
      {Array.from({ length: SESSIONS_PAGE_SIZE }).map((_, i) => (
        <Skeleton key={i} className="h-10 rounded-md" />
      ))}
    </div>
  );
}
