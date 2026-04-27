"use client";

import { useState, useTransition } from "react";
import { Bell, Mail, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateNotificationPrefs } from "@/features/settings/server/actions";
import type { NotificationPrefs } from "@/features/settings/schema";

const ROWS = [
  {
    key: "desktop" as const,
    label: "Desktop notifications",
    blurb: "Get a system notification when a session ends.",
    icon: Bell,
  },
  {
    key: "email" as const,
    label: "Email digests",
    blurb: "Weekly recap and streak reminders by email.",
    icon: Mail,
  },
  {
    key: "sound" as const,
    label: "Sound on session end",
    blurb: "Play a soft ding when a Pomodoro completes.",
    icon: Volume2,
  },
];

export function NotificationsForm({ defaults }: { defaults: NotificationPrefs }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaults);
  const [pending, startTx] = useTransition();

  function toggle(key: keyof NotificationPrefs) {
    const next: NotificationPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    startTx(async () => {
      try {
        await updateNotificationPrefs(next);
      } catch (e) {
        // Roll back the optimistic toggle if the save failed.
        setPrefs(prefs);
        toast.error(
          e instanceof Error ? e.message : "Couldn't update notifications",
        );
      }
    });
  }

  return (
    <div className="space-y-4 rounded-[14px] border border-border bg-card p-5">
      <h3 className="text-[14px] font-bold">Notifications</h3>
      <ul className="space-y-2">
        {ROWS.map((row) => {
          const Icon = row.icon;
          const on = prefs[row.key];
          return (
            <li
              key={row.key}
              className="flex items-center gap-3 rounded-[10px] border border-border bg-surface-2 p-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary/15 text-primary-soft">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-semibold">{row.label}</div>
                <div className="text-[11px] text-muted-foreground-strong">
                  {row.blurb}
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                disabled={pending}
                onClick={() => toggle(row.key)}
                className={cn(
                  "relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-60",
                  on ? "bg-primary" : "border border-border bg-surface-2",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all",
                    on ? "left-[18px]" : "left-0.5",
                  )}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
