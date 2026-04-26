"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Repeat,
  BookOpen,
  Timer,
  Target,
  BarChart3,
  Plug,
  Settings,
  HelpCircle,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarBottomSlot } from "@/lib/sidebar-slot";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard };

// Layout from idea/focusflow-analytics.html: 5 top items, single "Productivity"
// section label, then 5 bottom items, then the Keep-going card pinned to the
// bottom of the rail.
const topItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/habits", label: "Habits", icon: Repeat },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/timer", label: "Timer", icon: Timer },
];

const bottomItems: NavItem[] = [
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help & Support", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const slot = useSidebarBottomSlot();
  const bottom = slot?.bottom ?? <KeepGoingCard />;

  return (
    <aside className="sticky top-0 flex h-screen w-[210px] flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2.5 px-[18px] pb-6 pt-5">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-primary">
          <Zap className="h-[18px] w-[18px] fill-white text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-[15px] font-bold text-foreground">FocusFlow</div>
          <div className="text-[10px] text-muted-foreground-strong">
            Focus. Track. Achieve.
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {topItems.map((item) => (
          <NavRow key={item.href} item={item} pathname={pathname} />
        ))}

        <div className="px-[18px] pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground-strong">
          Productivity
        </div>

        {bottomItems.map((item) => (
          <NavRow key={item.href} item={item} pathname={pathname} />
        ))}
      </nav>

      <div className="mt-auto px-[14px] pb-[14px] pt-2">{bottom}</div>
    </aside>
  );
}

function NavRow({ item, pathname }: { item: NavItem; pathname: string }) {
  const { href, label, icon: Icon } = item;
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      prefetch
      className={cn(
        "flex items-center gap-2.5 px-[18px] py-[9px] text-[13.5px] font-medium transition-colors",
        isActive
          ? "border-l-[3px] border-primary bg-primary/15 pl-[15px] text-primary-soft"
          : "border-l-[3px] border-transparent text-muted-foreground hover:bg-primary/15 hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
      <NavPending />
    </Link>
  );
}

function NavPending() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      aria-hidden
      className="ml-auto inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary-soft"
    />
  );
}

function KeepGoingCard() {
  return (
    <div className="bg-keep-going rounded-[14px] border border-border p-[14px]">
      <div className="text-[13px] font-bold text-foreground">
        Keep going! <span className="ml-0.5">🚀</span>
      </div>
      <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
        You&apos;re doing better than last month.
      </div>
      <div className="mt-2 text-[22px] font-bold leading-none text-kpi-green">
        +18%
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground-strong">
        Productivity
      </div>
      <svg
        viewBox="0 0 120 28"
        preserveAspectRatio="none"
        className="mt-2 h-7 w-full"
      >
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 22 L17 18 L34 20 L51 12 L68 14 L85 8 L102 6 L120 2 L120 28 L0 28 Z"
          fill="url(#sparkFill)"
        />
        <path
          d="M0 22 L17 18 L34 20 L51 12 L68 14 L85 8 L102 6 L120 2"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
