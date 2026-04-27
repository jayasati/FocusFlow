"use client";

import { useTransition } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/features/settings/server/actions";
import { profileSchema } from "@/features/settings/schema";

type FormValues = {
  firstName: string;
  lastName: string;
  bio: string;
};

type Props = {
  defaults: FormValues;
  email: string;
};

export function ProfileForm({ defaults, email }: Props) {
  const [pending, startTx] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(profileSchema) as unknown as Resolver<FormValues>,
    defaultValues: defaults,
  });

  function onSubmit(values: FormValues) {
    startTx(async () => {
      try {
        await updateProfile(values);
        toast.success("Profile updated");
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Couldn't save profile",
        );
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 rounded-[14px] border border-border bg-card p-5"
    >
      <h3 className="text-[14px] font-bold">Profile</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" error={errors.firstName?.message}>
          <Input
            placeholder="Jane"
            {...register("firstName")}
            className="bg-surface-2"
          />
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          <Input
            placeholder="Doe"
            {...register("lastName")}
            className="bg-surface-2"
          />
        </Field>
      </div>

      <Field label="Email">
        <Input
          value={email}
          readOnly
          className="cursor-not-allowed bg-surface-2 opacity-70"
        />
      </Field>

      <Field
        label="Bio"
        error={errors.bio?.message}
        hint="Up to 280 characters."
      >
        <Textarea
          rows={3}
          placeholder="Tell us about yourself…"
          {...register("bio")}
          className="bg-surface-2"
        />
      </Field>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending || !isDirty}
          className="inline-flex items-center gap-1.5 rounded-[10px] bg-primary px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-primary-soft disabled:opacity-50"
        >
          <Save className="h-3.5 w-3.5" />
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[12px] font-semibold">{label}</Label>
      {children}
      {error ? (
        <p className="text-[11px] text-kpi-red">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-muted-foreground-strong">{hint}</p>
      ) : null}
    </div>
  );
}
