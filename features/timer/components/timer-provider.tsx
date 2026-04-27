"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTimerStore, MODE_LABEL } from "@/features/timer/store";
import { logSession } from "@/features/timer/server/actions";
import {
  DEFAULT_NOTIFICATION_PREFS,
  type NotificationPrefs,
} from "@/features/settings/schema";

/**
 * Mounted ONCE in the (app) layout.
 * - Drives a single global tick interval while status === RUNNING.
 * - Flushes a logSession server call on COMPLETED (incl. on hard-refresh
 *   replay if the timer expired while the tab was closed).
 * - Plays a Web Audio ding and shows a toast.
 * - Requests Notification permission on first start (when desktop pref is on).
 * - Reads the user's saved NotificationPrefs (desktop / sound) on mount.
 */
export function TimerProvider() {
  const status = useTimerStore((s) => s.status);
  const tick = useTimerStore((s) => s.tick);
  const complete = useTimerStore((s) => s.complete);
  const soundEnabled = useTimerStore((s) => s.soundEnabled);
  const reqNotifRef = useRef(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(
    DEFAULT_NOTIFICATION_PREFS,
  );

  // Pull saved prefs on mount; refetch when the window regains focus so a
  // settings change in another tab is picked up without a reload.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/user/notification-prefs", {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as NotificationPrefs;
        if (!cancelled) setPrefs(data);
      } catch {
        /* ignore — defaults already in state */
      }
    }
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Ticking
  useEffect(() => {
    if (status !== "RUNNING") return;
    // Request notification permission on first run (best-effort) — only if the
    // user hasn't disabled desktop notifications in settings.
    if (
      !reqNotifRef.current &&
      prefs.desktop &&
      typeof Notification !== "undefined"
    ) {
      reqNotifRef.current = true;
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
    const id = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(id);
  }, [status, tick, prefs.desktop]);

  // Completion side effects (logSession + sound + toast + notification).
  useEffect(() => {
    if (status !== "COMPLETED") return;
    const result = complete();
    if (!result) return;

    // Fire-and-forget log; toast immediately for UX.
    void logSession({
      mode: result.completedMode,
      startedAt: result.startedAt,
      endedAt: result.endedAt,
      taskId: result.taskId,
      habitId: result.habitId,
    }).catch(() => {
      toast.error("Couldn't save session — check your connection");
    });

    // Sound: respect both the saved master pref AND the in-page mute toggle.
    const playSound = prefs.sound && soundEnabled;
    if (playSound) playDing();
    toast.success(`${MODE_LABEL[result.completedMode]} complete 🎉`);

    if (
      prefs.desktop &&
      typeof Notification !== "undefined" &&
      Notification.permission === "granted"
    ) {
      try {
        new Notification("FocusFlow", {
          body: `${MODE_LABEL[result.completedMode]} complete!`,
          silent: !playSound,
        });
      } catch {
        /* ignore */
      }
    }
  }, [status, complete, soundEnabled, prefs.desktop, prefs.sound]);

  return null;
}

// ── Web Audio ding ──────────────────────────────────────────────────────────
function playDing() {
  try {
    const Ctx =
      typeof window !== "undefined"
        ? (window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext)
        : null;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    osc.type = "sine";
    gain.gain.value = 0.18;
    osc.connect(gain).connect(ctx.destination);
    const start = ctx.currentTime;
    osc.start(start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
    osc.stop(start + 0.65);
  } catch {
    /* ignore */
  }
}
