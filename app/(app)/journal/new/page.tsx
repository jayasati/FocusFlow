import { PageHeader } from "@/components/page-header";
import { EntryEditor } from "@/features/journal/components/entry-editor";
import { getDistinctTags } from "@/features/journal/server/queries";

export default async function NewJournalPage() {
  const knownTags = await getDistinctTags();
  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title="New Entry"
        subtitle="Write freely. Reflect deeply. Grow daily."
      />
      <div className="flex-1 overflow-y-auto">
        <EntryEditor mode="create" knownTags={knownTags} />
      </div>
    </div>
  );
}
