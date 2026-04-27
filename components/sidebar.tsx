"use client";

import { useEffect, useState } from "react";
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

type Pulse = {
  score: number;
  deltaPct: number | null;
  sparkline: number[];
};

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
  const [pulse, setPulse] = useState<Pulse | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sidebar/pulse", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Pulse | null) => {
        if (!cancelled && data) setPulse(data);
      })
      .catch(() => {
        /* swallow — card just shows the loading shell */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { headline, body, valueText, valueTone } = describePulse(pulse);

  return (
    <div className="bg-keep-going rounded-[14px] border border-border p-[14px]">
      <div className="text-[13px] font-bold text-foreground">
        {headline} <span className="ml-0.5">🚀</span>
      </div>
      <div className="mt-1 text-[11px] leading-snug text-muted-foreground">
        {body}
      </div>
      <div
        className={cn(
          "mt-2 text-[22px] font-bold leading-none",
          valueTone,
        )}
      >
        {valueText}
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground-strong">
        Productivity
      </div>
      <Sparkline points={pulse?.sparkline ?? null} />
    </div>
  );
}

function describePulse(pulse: Pulse | null): {
  headline: string;
  body: string;
  valueText: string;
  valueTone: string;
} {
  if (!pulse) {
    return {
      headline: "Keep going!",
      body: "Crunching your last 30 days…",
      valueText: "—",
      valueTone: "text-muted-foreground",
    };
  }
  const { score, deltaPct } = pulse;
  if (deltaPct === null) {
    // Brand-new account with no prior 30-day baseline — show the score itself.
    return {
      headline: score > 0 ? "Off to a strong start" : "Keep going!",
      body:
        score > 0
          ? "Building your first month of data."
          : "Log a task or focus session to start tracking.",
      valueText: `${score}`,
      valueTone: "text-primary-soft",
    };
  }
  if (deltaPct > 0) {
    return {
      headline: "Keep going!",
      body: "You're doing better than last month.",
      valueText: `+${deltaPct}%`,
      valueTone: "text-kpi-green",
    };
  }
  if (deltaPct < 0) {
    return {
      headline: "Steady wins it",
      body: "Slightly down from last month — small steps add up.",
      valueText: `${deltaPct}%`,
      valueTone: "text-kpi-orange",
    };
  }
  return {
    headline: "Holding the line",
    body: "Right on pace with last month.",
    valueText: "0%",
    valueTone: "text-muted-foreground",
  };
}

function Sparkline({ points }: { points: number[] | null }) {
  // Render a flat baseline while loading or when there's no signal at all so
  // the card height stays stable.
  const data = points && points.length >= 2 ? points : [0, 0, 0, 0, 0, 0, 0, 0];
  const W = 120;
  const H = 28;
  const PAD = 2;
  const max = Math.max(1, ...data); // avoid divide-by-zero for an all-zero sparkline
  const stepX = (W - PAD * 2) / (data.length - 1);

  const coords = data.map((v, i) => {
    const x = PAD + stepX * i;
    const y = H - PAD - (v / max) * (H - PAD * 2);
    return [x, y] as const;
  });

  const linePath = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const fillPath =
    `M ${coords[0][0].toFixed(1)} ${(H - PAD).toFixed(1)} ` +
    coords
      .map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`)
      .join(" ") +
    ` L ${coords[coords.length - 1][0].toFixed(1)} ${(H - PAD).toFixed(1)} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="mt-2 h-7 w-full"
    >
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fillPath} fill="url(#sparkFill)" />
      <path
        d={linePath}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
