"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Ctx = {
  bottom: ReactNode | null;
  setBottom: (node: ReactNode | null) => void;
};

const SidebarSlotContext = createContext<Ctx | null>(null);

export function SidebarSlotProvider({ children }: { children: ReactNode }) {
  const [bottom, setBottom] = useState<ReactNode | null>(null);
  return (
    <SidebarSlotContext.Provider value={{ bottom, setBottom }}>
      {children}
    </SidebarSlotContext.Provider>
  );
}

export function useSidebarBottomSlot() {
  return useContext(SidebarSlotContext);
}

/**
 * Render this anywhere in a page tree (it's a client component) and its
 * children will be teleported into the sidebar bottom slot for the lifetime of
 * the page. Removed automatically on unmount.
 */
export function SidebarBottomSlot({ children }: { children: ReactNode }) {
  const ctx = useContext(SidebarSlotContext);
  useEffect(() => {
    ctx?.setBottom(children);
    return () => ctx?.setBottom(null);
  }, [ctx, children]);
  return null;
}
