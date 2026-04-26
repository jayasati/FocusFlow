import { PageHeader } from "@/components/page-header";

export default function JournalPage() {
  return (
    <div>
      <PageHeader
        title="Journal"
        subtitle="Write freely. Reflect deeply. Grow daily."
        searchPlaceholder="Search journal entries…"
      />
      <div className="px-8 pb-10" />
    </div>
  );
}
