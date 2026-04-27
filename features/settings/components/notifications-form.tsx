"use client";

import { useEffect, useState, useTransition } from "react";
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

type Permission = "default" | "granted" | "denied" | "unsupported";

function readPermission(): Permission {
  if (typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

export function NotificationsForm({ defaults }: { defaults: NotificationPrefs }) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(defaults);
  const [permission, setPermission] = useState<Permission>("default");
  const [pending, startTx] = useTransition();

  useEffect(() => {
    setPermission(readPermission());
  }, []);

  function toggle(key: keyof NotificationPrefs) {
    const next: NotificationPrefs = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    // Turning desktop ON while the browser hasn't been asked yet → request now.
    if (
      key === "desktop" &&
      next.desktop &&
      typeof Notification !== "undefined" &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission()
        .then((p) => setPermission(p))
        .catch(() => {});
    }
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

  function requestPermission() {
    if (typeof Notification === "undefined") return;
    Notification.requestPermission()
      .then((p) => setPermission(p))
      .catch(() => {});
  }

  return (
    <div className="space-y-4 rounded-[14px] border border-border bg-card p-5">
      <h3 className="text-[14px] font-bold">Notifications</h3>
      <ul className="space-y-2">
        {ROWS.map((row) => {
          const Icon = row.icon;
          const on = prefs[row.key];
          const showPermissionHint = row.key === "desktop";
          return (
            <li
              key={row.key}
              className="flex flex-col gap-2 rounded-[10px] border border-border bg-surface-2 p-3"
            >
              <div className="flex items-center gap-3">
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
              </div>
              {showPermissionHint && on ? (
                <PermissionHint
                  permission={permission}
                  onAllow={requestPermission}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PermissionHint({
  permission,
  onAllow,
}: {
  permission: Permission;
  onAllow: () => void;
}) {
  if (permission === "granted") {
    return (
      <div className="ml-12 inline-flex items-center gap-2 text-[11px] font-medium text-kpi-green">
        Browser permission granted
      </div>
    );
  }
  if (permission === "denied") {
    return (
      <div className="ml-12 text-[11px] text-kpi-red">
        Blocked in your browser. Open site settings (the lock icon in the
        address bar) and allow notifications, then reload.
      </div>
    );
  }
  if (permission === "unsupported") {
    return (
      <div className="ml-12 text-[11px] text-muted-foreground-strong">
        This browser doesn&apos;t support desktop notifications.
      </div>
    );
  }
  // "default" — never asked
  return (
    <div className="ml-12 flex items-center gap-2">
      <span className="text-[11px] text-muted-foreground-strong">
        Browser permission needed.
      </span>
      <button
        type="button"
        onClick={onAllow}
        className="rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-primary-soft"
      >
        Allow in browser
      </button>
    </div>
  );
}
