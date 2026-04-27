"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useTimerStore, MODE_LABEL } from "@/features/timer/store";
import { logSession } from "@/features/timer/server/actions";

/**
 * Mounted ONCE in the (app) layout.
 * - Drives a single global tick interval while status === RUNNING.
 * - Flushes a logSession server call on COMPLETED (incl. on hard-refresh
 *   replay if the timer expired while the tab was closed).
 * - Plays a Web Audio ding and shows a toast.
 * - Requests Notification permission on first start.
 */
export function TimerProvider() {
  const status = useTimerStore((s) => s.status);
  const tick = useTimerStore((s) => s.tick);
  const complete = useTimerStore((s) => s.complete);
  const soundEnabled = useTimerStore((s) => s.soundEnabled);
  const reqNotifRef = useRef(false);

  // Ticking
  useEffect(() => {
    if (status !== "RUNNING") return;
    // Request notification permission on first run (best-effort).
    if (!reqNotifRef.current && typeof Notification !== "undefined") {
      reqNotifRef.current = true;
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
    const id = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(id);
  }, [status, tick]);

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

    if (soundEnabled) playDing();
    toast.success(`${MODE_LABEL[result.completedMode]} complete 🎉`);

    if (
      typeof Notification !== "undefined" &&
      Notification.permission === "granted" &&
      typeof document !== "undefined" &&
      document.hidden
    ) {
      try {
        new Notification("FocusFlow", {
          body: `${MODE_LABEL[result.completedMode]} complete!`,
          silent: !soundEnabled,
        });
      } catch {
        /* ignore */
      }
    }
  }, [status, complete, soundEnabled]);

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
