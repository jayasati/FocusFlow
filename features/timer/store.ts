"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Mode = "POMODORO" | "SHORT" | "LONG" | "CUSTOM";
export type Status = "IDLE" | "RUNNING" | "PAUSED" | "COMPLETED";

export const MODE_DURATION: Record<Mode, number> = {
  POMODORO: 25 * 60,
  SHORT: 5 * 60,
  LONG: 15 * 60,
  CUSTOM: 50 * 60,
};

export const MODE_LABEL: Record<Mode, string> = {
  POMODORO: "Pomodoro",
  SHORT: "Short Break",
  LONG: "Long Break",
  CUSTOM: "Custom",
};

export const MODE_EMOJI: Record<Mode, string> = {
  POMODORO: "🍅",
  SHORT: "☕",
  LONG: "🫗",
  CUSTOM: "⚙",
};

type TimerState = {
  mode: Mode;
  durationSec: number;
  remainingSec: number;
  /** Unix ms when the running timer should hit 0; null when idle/paused */
  endsAt: number | null;
  /** Wall-clock when the current session was first started */
  sessionStartedAt: string | null;
  status: Status;
  taskId: string | null;
  taskTitle: string | null;
  cycleIndex: number; // 1..4
  soundEnabled: boolean;
  customDurationMin: number;

  setMode: (m: Mode) => void;
  setCustomDuration: (min: number) => void;
  setTask: (id: string | null, title: string | null) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
  /** Called by TimerProvider every second while RUNNING. Returns true if completed. */
  tick: () => boolean;
  /** Mark current run as completed and advance to the next mode (idle) */
  complete: () => {
    completedMode: Mode;
    startedAt: string;
    endedAt: string;
    durationSec: number;
    taskId: string | null;
  } | null;
  toggleSound: () => void;
};

function durationFor(state: { mode: Mode; customDurationMin: number }): number {
  if (state.mode === "CUSTOM") return state.customDurationMin * 60;
  return MODE_DURATION[state.mode];
}

function nextMode(mode: Mode, cycleIndex: number): Mode {
  if (mode === "POMODORO") return cycleIndex >= 4 ? "LONG" : "SHORT";
  return "POMODORO";
}

function nextCycle(mode: Mode, cycleIndex: number): number {
  if (mode === "POMODORO") return cycleIndex; // bumped after the break
  if (mode === "SHORT") return Math.min(cycleIndex + 1, 4);
  if (mode === "LONG") return 1;
  return cycleIndex;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: "POMODORO",
      durationSec: MODE_DURATION.POMODORO,
      remainingSec: MODE_DURATION.POMODORO,
      endsAt: null,
      sessionStartedAt: null,
      status: "IDLE",
      taskId: null,
      taskTitle: null,
      cycleIndex: 1,
      soundEnabled: true,
      customDurationMin: 50,

      setMode: (m) => {
        const prev = get();
        if (prev.status === "RUNNING") return; // safety: don't switch mid-run
        const dur = durationFor({ ...prev, mode: m });
        set({
          mode: m,
          durationSec: dur,
          remainingSec: dur,
          endsAt: null,
          sessionStartedAt: null,
          status: "IDLE",
        });
      },

      setCustomDuration: (min) => {
        const clamped = Math.min(180, Math.max(1, Math.floor(min)));
        const prev = get();
        const isCustom = prev.mode === "CUSTOM";
        const dur = clamped * 60;
        set({
          customDurationMin: clamped,
          ...(isCustom
            ? {
                durationSec: dur,
                remainingSec: prev.status === "IDLE" ? dur : prev.remainingSec,
              }
            : {}),
        });
      },

      setTask: (id, title) => set({ taskId: id, taskTitle: title }),

      start: () => {
        const s = get();
        const now = Date.now();
        const remaining =
          s.status === "PAUSED" ? s.remainingSec : s.durationSec;
        set({
          status: "RUNNING",
          remainingSec: remaining,
          endsAt: now + remaining * 1000,
          sessionStartedAt:
            s.sessionStartedAt && s.status === "PAUSED"
              ? s.sessionStartedAt
              : new Date(now).toISOString(),
        });
      },

      pause: () => {
        const s = get();
        if (s.status !== "RUNNING" || !s.endsAt) return;
        const remaining = Math.max(
          0,
          Math.ceil((s.endsAt - Date.now()) / 1000),
        );
        set({ status: "PAUSED", remainingSec: remaining, endsAt: null });
      },

      resume: () => get().start(),

      reset: () =>
        set((s) => ({
          status: "IDLE",
          remainingSec: s.durationSec,
          endsAt: null,
          sessionStartedAt: null,
        })),

      skip: () => {
        const s = get();
        const next = nextMode(s.mode, s.cycleIndex);
        const cycle = nextCycle(s.mode, s.cycleIndex);
        const dur = durationFor({ ...s, mode: next });
        set({
          mode: next,
          cycleIndex: cycle,
          status: "IDLE",
          durationSec: dur,
          remainingSec: dur,
          endsAt: null,
          sessionStartedAt: null,
        });
      },

      tick: () => {
        const s = get();
        if (s.status !== "RUNNING" || !s.endsAt) return false;
        const remaining = Math.max(
          0,
          Math.ceil((s.endsAt - Date.now()) / 1000),
        );
        if (remaining === 0) {
          set({ remainingSec: 0, status: "COMPLETED" });
          return true;
        }
        if (remaining !== s.remainingSec) {
          set({ remainingSec: remaining });
        }
        return false;
      },

      complete: () => {
        const s = get();
        const startedAt =
          s.sessionStartedAt ?? new Date(Date.now() - s.durationSec * 1000).toISOString();
        const endedAt = new Date().toISOString();
        const completedMode = s.mode;
        const completedTaskId = s.taskId;
        const completedDuration = s.durationSec;

        const next = nextMode(s.mode, s.cycleIndex);
        const cycle = nextCycle(s.mode, s.cycleIndex);
        const dur = durationFor({ ...s, mode: next });
        set({
          mode: next,
          cycleIndex: cycle,
          status: "IDLE",
          durationSec: dur,
          remainingSec: dur,
          endsAt: null,
          sessionStartedAt: null,
        });

        return {
          completedMode,
          startedAt,
          endedAt,
          durationSec: completedDuration,
          taskId: completedTaskId,
        };
      },

      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
    }),
    {
      name: "focusflow-timer",
      storage: createJSONStorage(() => localStorage),
      // Only persist values; keep transient flags local.
      partialize: (s) => ({
        mode: s.mode,
        durationSec: s.durationSec,
        remainingSec: s.remainingSec,
        endsAt: s.endsAt,
        sessionStartedAt: s.sessionStartedAt,
        status: s.status,
        taskId: s.taskId,
        taskTitle: s.taskTitle,
        cycleIndex: s.cycleIndex,
        soundEnabled: s.soundEnabled,
        customDurationMin: s.customDurationMin,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // If the timer was RUNNING when persisted, recompute remainingSec from
        // endsAt. If endsAt is in the past, mark as COMPLETED so the provider
        // can flush a logSession on mount.
        if (state.status === "RUNNING" && state.endsAt) {
          const remaining = Math.max(
            0,
            Math.ceil((state.endsAt - Date.now()) / 1000),
          );
          if (remaining === 0) {
            state.status = "COMPLETED";
            state.remainingSec = 0;
          } else {
            state.remainingSec = remaining;
          }
        }
      },
      skipHydration: false,
    },
  ),
);
