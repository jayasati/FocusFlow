"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { createEntry } from "@/features/journal/server/actions";

export function QuickJournalCard() {
  const [content, setContent] = useState("");
  const [pending, startTx] = useTransition();

  function onSave() {
    const trimmed = content.trim();
    if (!trimmed) {
      toast.error("Write something first");
      return;
    }
    startTx(async () => {
      try {
        await createEntry({ content: trimmed, mood: 3, tags: [] });
        setContent("");
        toast.success("Saved");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't save entry");
      }
    });
  }

  return (
    <div className="flex h-full flex-col gap-3 rounded-[14px] border border-border bg-card p-4">
      <h3 className="text-[13px] font-bold">Quick Journal</h3>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="How was your day?"
        className="flex-1 resize-none rounded-[10px] border-border bg-surface-2 text-[12.5px] placeholder:text-muted-foreground-strong"
        rows={4}
      />
      <button
        type="button"
        disabled={pending}
        onClick={onSave}
        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-primary px-3 py-2 text-[12.5px] font-semibold text-white transition-colors hover:bg-primary-soft disabled:opacity-60"
      >
        <Save className="h-3.5 w-3.5" />
        {pending ? "Saving…" : "Save Entry"}
      </button>
    </div>
  );
}
