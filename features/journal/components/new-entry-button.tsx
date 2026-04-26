import Link from "next/link";
import { Plus } from "lucide-react";

export function NewEntryButton() {
  return (
    <Link
      href="/journal/new"
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-soft"
    >
      <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
      New Entry
    </Link>
  );
}
