"use client";

import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  GraduationCap,
  MessageCircle,
  PlayCircle,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type CategoryKey = "all" | "getting-started" | "guides" | "faqs" | "videos";

const CATEGORIES: {
  key: Exclude<CategoryKey, "all">;
  label: string;
  blurb: string;
  count: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  {
    key: "getting-started",
    label: "Getting Started",
    blurb: "New to FocusFlow?",
    count: "8 articles",
    icon: Sparkles,
    tone: "from-primary/30 to-primary/10 text-primary-soft",
  },
  {
    key: "guides",
    label: "Guides & Tutorials",
    blurb: "Step-by-step walkthroughs",
    count: "12 articles",
    icon: GraduationCap,
    tone: "from-kpi-green/30 to-kpi-green/10 text-kpi-green",
  },
  {
    key: "faqs",
    label: "FAQs",
    blurb: "Frequently asked",
    count: "20 articles",
    icon: CircleHelp,
    tone: "from-kpi-orange/30 to-kpi-orange/10 text-kpi-orange",
  },
  {
    key: "videos",
    label: "Video Tutorials",
    blurb: "Watch and learn",
    count: "6 videos",
    icon: PlayCircle,
    tone: "from-kpi-blue/30 to-kpi-blue/10 text-kpi-blue",
  },
];

const ARTICLES: {
  title: string;
  blurb: string;
  category: Exclude<CategoryKey, "all">;
}[] = [
  {
    title: "Getting started with FocusFlow",
    blurb: "Learn the basics: dashboard, sidebar, and your first session.",
    category: "getting-started",
  },
  {
    title: "How to create and manage tasks",
    blurb: "Plan your day with priorities, due dates, and tags.",
    category: "guides",
  },
  {
    title: "Understanding habits and streaks",
    blurb: "Build long streaks with daily, weekly, and custom habits.",
    category: "guides",
  },
  {
    title: "Using the Pomodoro Timer",
    blurb: "Focus, break, repeat — and what each cycle is for.",
    category: "guides",
  },
  {
    title: "How analytics help you grow",
    blurb: "Read your weekly report and what each chart actually means.",
    category: "faqs",
  },
  {
    title: "Connecting integrations",
    blurb: "Link GitHub and LeetCode for richer stats.",
    category: "guides",
  },
];

export function HelpContent() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<CategoryKey>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARTICLES.filter((a) => {
      if (active !== "all" && a.category !== active) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.blurb.toLowerCase().includes(q)
      );
    });
  }, [query, active]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground-strong" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for help articles, guides, or tutorials…"
          className="h-11 rounded-[12px] border-border bg-card pl-9 text-[13px] placeholder:text-muted-foreground-strong"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setActive(isActive ? "all" : c.key)}
              className={cn(
                "group flex flex-col items-start gap-2 rounded-[14px] border bg-card p-4 text-left transition-colors",
                isActive
                  ? "border-primary"
                  : "border-border hover:border-primary/40",
              )}
            >
              <div
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-[12px] bg-gradient-to-br",
                  c.tone,
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-[13px] font-bold">{c.label}</div>
              <div className="text-[11px] text-muted-foreground-strong">
                {c.blurb}
              </div>
              <div className="mt-1 text-[10.5px] font-semibold text-primary-soft">
                {c.count}
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-[14px] border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-[13px] font-bold">
            {active === "all"
              ? "Popular Articles"
              : CATEGORIES.find((c) => c.key === active)?.label}
          </h3>
          <button
            type="button"
            onClick={() => setActive("all")}
            className="text-[11px] font-semibold text-primary-soft hover:text-primary"
          >
            View All Articles
          </button>
        </div>

        <ul className="divide-y divide-border">
          {filtered.length === 0 ? (
            <li className="px-4 py-8 text-center text-[12px] text-muted-foreground-strong">
              No articles match your search yet.
            </li>
          ) : (
            filtered.map((a) => (
              <li key={a.title}>
                <a
                  href="#"
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary/10"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-soft">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12.5px] font-semibold">
                      {a.title}
                    </div>
                    <div className="truncate text-[11px] text-muted-foreground-strong">
                      {a.blurb}
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground-strong" />
                </a>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <CalloutCard
          title="Didn't find what you were looking for?"
          blurb="Our support team is one click away."
          ctaLabel="Contact Support"
          icon={MessageCircle}
        />
        <CalloutCard
          title="Still need help?"
          blurb="Chat with our community forum and learn from other users."
          ctaLabel="Visit Community Forum"
          icon={CircleHelp}
        />
      </div>
    </div>
  );
}

function CalloutCard({
  title,
  blurb,
  ctaLabel,
  icon: Icon,
}: {
  title: string;
  blurb: string;
  ctaLabel: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-center gap-3 rounded-[14px] border border-border bg-card p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-primary/15 text-primary-soft">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[12.5px] font-bold">{title}</div>
        <div className="text-[11px] text-muted-foreground-strong">{blurb}</div>
      </div>
      <button
        type="button"
        className="rounded-[10px] bg-primary px-3 py-1.5 text-[11.5px] font-semibold text-white transition-colors hover:bg-primary-soft"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
