"use client";

import { useState, useTransition, type ReactNode } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteGoal } from "@/features/goals/server/actions";
import { GoalDialog } from "@/features/goals/components/goal-dialog";
import type { GoalRow } from "@/features/goals/server/queries";

export function GoalRowMenu({ goal }: { goal: GoalRow }) {
  const [editOpen, setEditOpen] = useState(false);
  const [, start] = useTransition();

  function onDelete() {
    if (!confirm(`Delete "${goal.title}"? This can't be undone.`)) return;
    start(async () => {
      await deleteGoal(goal.id);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground-strong transition-colors hover:bg-surface-2 hover:text-foreground"
          aria-label="Goal actions"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
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
      <GoalDialog
        mode="edit"
        initial={goal}
        open={editOpen}
        onOpenChange={setEditOpen}
        trigger={null as unknown as ReactNode}
      />
    </>
  );
}
