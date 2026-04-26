"use client";

import { useTransition } from "react";
import Link from "next/link";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteEntry } from "@/features/journal/server/actions";

export function EntryRowMenu({ id, title }: { id: string; title: string }) {
  const [, start] = useTransition();
  function onDelete() {
    if (!confirm(`Delete "${title}"? This can't be undone.`)) return;
    start(async () => {
      await deleteEntry(id);
    });
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md self-start text-muted-foreground-strong hover:bg-surface-2 hover:text-foreground"
        aria-label="Entry actions"
      >
        <MoreVertical className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link href={`/journal/${id}`}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onDelete}
          className="text-kpi-red focus:text-kpi-red"
        >
          <Trash2 className="mr-2 h-3.5 w-3.5" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
