import { PageHeader } from "@/components/page-header";

export default function HelpPage() {
  return (
    <div>
      <PageHeader
        title="Help & Support"
        subtitle="How can we help you today?"
        searchPlaceholder="Search help articles…"
      />
      <div className="px-8 pb-10" />
    </div>
  );
}
