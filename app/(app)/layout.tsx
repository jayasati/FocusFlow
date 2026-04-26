import { Sidebar } from "@/components/sidebar";
import { PersistentTopRight } from "@/components/persistent-top-right";
import { SidebarSlotProvider } from "@/lib/sidebar-slot";

// Auth gating happens in proxy.ts (Clerk middleware). This layout intentionally
// does NOT call auth() so it can stay static across navigations and avoid a
// round-trip on every click.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarSlotProvider>
      <div className="grid min-h-screen grid-cols-1 bg-background md:grid-cols-[210px_minmax(0,1fr)]">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="relative min-w-0 overflow-x-hidden">
          <PersistentTopRight />
          {children}
        </main>
      </div>
    </SidebarSlotProvider>
  );
}
