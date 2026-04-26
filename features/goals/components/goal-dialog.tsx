"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { Plus, X } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
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
import {
  CATEGORIES,
  CATEGORY_META,
  GOAL_COLORS,
  GOAL_COLOR_GRADIENT,
  GOAL_ICONS,
  type Category,
  type GoalColor,
} from "@/features/goals/schema";
import { createGoal, updateGoal } from "@/features/goals/server/actions";
import type { GoalRow } from "@/features/goals/server/queries";

const formSchema = z.object({
  title: z.string().min(1, "Required").max(120),
  description: z.string().max(500).optional(),
  category: z.enum(CATEGORIES),
  icon: z.string(),
  color: z.enum(GOAL_COLORS),
  targetDate: z.string().optional(),
  milestones: z.array(z.object({ title: z.string().min(1).max(120) })),
});
type FormValues = z.infer<typeof formSchema>;

export function GoalDialog({
  trigger,
  mode = "create",
  initial,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  trigger?: ReactNode;
  mode?: "create" | "edit";
  initial?: GoalRow;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
}) {
  const [uncontrolled, setUncontrolled] = useState(false);
  const open = controlledOpen ?? uncontrolled;
  const setOpen = setControlledOpen ?? setUncontrolled;

  const [pending, start] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      category: (initial?.category as Category) ?? "PERSONAL",
      icon: initial?.icon ?? "🎯",
      color: (initial?.color as GoalColor) ?? "purple",
      targetDate: initial?.targetDate
        ? new Date(initial.targetDate).toISOString().slice(0, 10)
        : "",
      milestones: initial?.milestones?.map((m) => ({ title: m.title })) ?? [],
    },
    resolver: zodResolver(formSchema),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "milestones",
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initial) {
      reset({
        title: initial.title,
        description: initial.description ?? "",
        category: (initial.category as Category) ?? "PERSONAL",
        icon: initial.icon,
        color: (initial.color as GoalColor) ?? "purple",
        targetDate: initial.targetDate
          ? new Date(initial.targetDate).toISOString().slice(0, 10)
          : "",
        milestones: initial.milestones.map((m) => ({ title: m.title })),
      });
    } else if (mode === "create") {
      reset({
        title: "",
        description: "",
        category: "PERSONAL",
        icon: "🎯",
        color: "purple",
        targetDate: "",
        milestones: [],
      });
    }
  }, [open, mode, initial, reset]);

  const icon = watch("icon");
  const color = watch("color");
  const category = watch("category");

  function onSubmit(v: FormValues) {
    start(async () => {
      const payload = {
        title: v.title.trim(),
        description: v.description?.trim() || null,
        category: v.category,
        icon: v.icon,
        color: v.color,
        targetDate: v.targetDate || null,
        milestones: v.milestones
          .filter((m) => m.title.trim().length > 0)
          .map((m) => ({ title: m.title.trim() })),
      };
      if (mode === "edit" && initial) {
        await updateGoal({ id: initial.id, ...payload });
      } else {
        await createGoal(payload);
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger !== undefined ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : controlledOpen === undefined ? (
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-soft"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            New Goal
          </button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit goal" : "New goal"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-2 space-y-4">
          <Field label="Title" error={errors.title?.message}>
            <Input
              autoFocus
              placeholder="Get in shape"
              {...register("title")}
            />
          </Field>

          <Field label="Description (optional)">
            <Textarea
              rows={2}
              placeholder="Work out 4 times a week and stay active."
              {...register("description")}
            />
          </Field>

          <Field label="Category">
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("category", c, { shouldDirty: true })}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-[11.5px] font-semibold transition-colors",
                    category === c
                      ? "border-primary bg-primary/15 text-primary-soft"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {CATEGORY_META[c].label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Icon">
            <div className="flex flex-wrap gap-1.5">
              {GOAL_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setValue("icon", i, { shouldDirty: true })}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-md border text-lg transition-colors",
                    icon === i
                      ? "border-primary bg-primary/15"
                      : "border-border hover:bg-primary/10",
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Color">
            <div className="flex flex-wrap gap-1.5">
              {GOAL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("color", c, { shouldDirty: true })}
                  aria-label={c}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-transform",
                    color === c
                      ? "scale-110 border-foreground"
                      : "border-transparent",
                  )}
                  style={{ backgroundImage: GOAL_COLOR_GRADIENT[c] }}
                />
              ))}
            </div>
          </Field>

          <Field label="Target date (optional)">
            <Input type="date" {...register("targetDate")} />
          </Field>

          <Field label="Milestones">
            <div className="space-y-1.5">
              {fields.map((f, i) => (
                <div key={f.id} className="flex items-center gap-1.5">
                  <Input
                    placeholder={`Milestone ${i + 1}`}
                    {...register(`milestones.${i}.title` as const)}
                  />
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label="Remove"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => append({ title: "" })}
                className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-3 w-3" />
                Add milestone
              </button>
            </div>
          </Field>

          <div className="flex justify-end gap-2 pt-1">
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
              {pending
                ? "Saving…"
                : mode === "edit"
                  ? "Save changes"
                  : "Create goal"}
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
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] text-muted-foreground">{label}</Label>
      {children}
      {error ? <div className="text-[11px] text-kpi-red">{error}</div> : null}
    </div>
  );
}
