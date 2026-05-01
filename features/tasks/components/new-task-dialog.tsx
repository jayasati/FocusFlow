"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PRIORITIES } from "@/features/tasks/schema";
import { createTask } from "@/features/tasks/server/actions";

// Form-only zod (tags as comma string, dueDate as datetime-local string)
const formSchema = z.object({
  title: z.string().min(1, "Required").max(160),
  description: z.string().max(2000).optional(),
  priority: z.enum(PRIORITIES),
  dueDate: z.string().optional(),
  tags: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

export function NewTaskDialog() {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
      tags: "",
    },
    resolver: zodResolver(formSchema),
  });

  const priority = watch("priority");

  function onSubmit(v: FormValues) {
    start(async () => {
      await createTask({
        title: v.title.trim(),
        description: v.description?.trim() || null,
        priority: v.priority,
        // datetime-local has no tz; resolve in the user's local tz here so the
        // server doesn't reinterpret the bare string as UTC.
        dueDate: v.dueDate ? new Date(v.dueDate).toISOString() : null,
        tags: (v.tags ?? "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        projectId: null,
      });
      reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-[8px] bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-soft"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          New Task
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <Field label="Title" error={errors.title?.message}>
            <Input
              autoFocus
              placeholder="What needs to get done?"
              {...register("title")}
            />
          </Field>

          <Field label="Description (optional)">
            <Textarea
              rows={3}
              placeholder="Add context, links, or sub-steps…"
              {...register("description")}
            />
          </Field>

          <Field label="Priority">
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValue("priority", p, { shouldDirty: true })}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-[12.5px] font-medium transition-colors",
                    priority === p
                      ? "border-primary bg-primary/15 text-primary-soft"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      p === "HIGH" && "bg-kpi-red",
                      p === "MEDIUM" && "bg-kpi-orange",
                      p === "LOW" && "bg-kpi-green",
                    )}
                  />
                  {p === "MEDIUM" ? "Medium" : p === "HIGH" ? "High" : "Low"}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Due date">
              <Input type="datetime-local" {...register("dueDate")} />
            </Field>
            <Field label="Tags (comma-separated)">
              <Input placeholder="design, work" {...register("tags")} />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-border px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-soft disabled:opacity-60"
            >
              {pending ? "Creating…" : "Create task"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] text-muted-foreground">{label}</Label>
      {children}
      {error ? <div className="text-[11px] text-kpi-red">{error}</div> : null}
    </div>
  );
}
