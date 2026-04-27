import {
  ChevronRight,
  Mail,
  MessageSquare,
  Send,
  type LucideIcon,
} from "lucide-react";

const CONTACTS: { icon: LucideIcon; tint: string; title: string; sub: string; cta: string }[] = [
  {
    icon: MessageSquare,
    tint: "bg-primary/15 text-primary-soft",
    title: "Live Chat",
    sub: "Online now",
    cta: "Chat",
  },
  {
    icon: Mail,
    tint: "bg-kpi-blue/15 text-kpi-blue",
    title: "Email Support",
    sub: "support@focusflow.app",
    cta: "Email",
  },
  {
    icon: Send,
    tint: "bg-kpi-orange/15 text-kpi-orange",
    title: "Send Feedback",
    sub: "Help us improve",
    cta: "Send",
  },
];

const STATUS: { label: string; tone: string }[] = [
  { label: "Web Application", tone: "Operational" },
  { label: "Mobile API", tone: "Operational" },
  { label: "Notifications", tone: "Operational" },
];

export function SupportRail() {
  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-border bg-card p-4">
        <h3 className="text-[13px] font-bold">Contact Support</h3>
        <ul className="mt-2 divide-y divide-border">
          {CONTACTS.map((c) => {
            const Icon = c.icon;
            return (
              <li
                key={c.title}
                className="flex items-center gap-3 py-2.5 first:pt-1 last:pb-0"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${c.tint}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-semibold">{c.title}</div>
                  <div className="text-[11px] text-muted-foreground-strong">
                    {c.sub}
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-border bg-surface-2 p-1 text-muted-foreground-strong transition-colors hover:bg-primary/15 hover:text-foreground"
                  aria-label={`${c.cta} ${c.title}`}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="rounded-[14px] border border-border bg-card p-4">
        <h3 className="text-[13px] font-bold">System Status</h3>
        <ul className="mt-2 space-y-2">
          {STATUS.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between text-[11.5px]"
            >
              <span className="text-muted-foreground">{s.label}</span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-kpi-green">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-kpi-green" />
                {s.tone}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-[10px] border border-border bg-surface-2 px-3 py-1.5 text-[11.5px] font-semibold text-foreground transition-colors hover:bg-primary/15"
        >
          View Status Page
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
