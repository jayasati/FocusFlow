import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <div className="grid min-h-screen grid-cols-[210px_1fr] bg-background">
      <Sidebar />
      <main className="min-w-0 overflow-x-hidden">{children}</main>
    </div>
  );
}
