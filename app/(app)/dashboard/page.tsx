import { currentUser } from "@clerk/nextjs/server";
import { PageHeader } from "@/components/page-header";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await currentUser();
  const name = user?.firstName ?? "there";
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={`${greeting()}, ${name}`}
        searchPlaceholder="Search anything…"
      />
      <div className="px-8 pb-10" />
    </div>
  );
}
