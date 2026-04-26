"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type OpenOpts = { onSkip?: () => void };

type Ctx = {
  isOpen: boolean;
  onSkip: (() => void) | null;
  open: (opts?: OpenOpts) => void;
  close: () => void;
};

const TaskPickerContext = createContext<Ctx | null>(null);

export function TaskPickerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [onSkip, setOnSkip] = useState<(() => void) | null>(null);
  const open = useCallback((opts?: OpenOpts) => {
    setOnSkip(() => opts?.onSkip ?? null);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  return (
    <TaskPickerContext.Provider value={{ isOpen, onSkip, open, close }}>
      {children}
    </TaskPickerContext.Provider>
  );
}

export function useTaskPicker() {
  const ctx = useContext(TaskPickerContext);
  if (!ctx) {
    return {
      isOpen: false,
      onSkip: null,
      open: () => {},
      close: () => {},
    };
  }
  return ctx;
}
