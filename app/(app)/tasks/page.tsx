import { PageHeader } from "@/components/page-header";

export default function TasksPage() {
  return (
    <div>
      <PageHeader
        title="Tasks"
        subtitle="Stay organized, get big things done"
        searchPlaceholder="Search tasks…"
      />
      <div className="px-8 pb-10" />
    </div>
  );
}
