import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-14 items-center justify-end gap-3 border-b border-border px-6">
          <UserButton />
        </header>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
