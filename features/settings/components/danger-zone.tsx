"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccount } from "@/features/settings/server/actions";

export function DangerZone({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [pending, startTx] = useTransition();

  function onConfirm() {
    if (confirmText !== "DELETE") {
      toast.error('Type "DELETE" to confirm');
      return;
    }
    startTx(async () => {
      try {
        await deleteAccount();
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Couldn't delete account",
        );
      }
    });
  }

  return (
    <div className="space-y-3 rounded-[14px] border border-kpi-red/40 bg-kpi-red/5 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-kpi-red/15 text-kpi-red">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[14px] font-bold text-kpi-red">Danger Zone</h3>
          <p className="text-[11.5px] text-muted-foreground-strong">
            Deleting your account removes all tasks, habits, journal entries,
            and integrations. This cannot be undone.
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-[10px] border border-kpi-red/40 bg-kpi-red/15 px-3.5 py-1.5 text-[12.5px] font-semibold text-kpi-red transition-colors hover:bg-kpi-red/25"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete account
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md border-border bg-card text-foreground">
          <DialogHeader>
            <DialogTitle className="text-kpi-red">
              Delete account permanently?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground-strong">
              This will sign out <span className="font-semibold">{email}</span>{" "}
              and erase every record we have for you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-delete">
              Type <span className="font-bold text-kpi-red">DELETE</span> to
              confirm
            </Label>
            <Input
              id="confirm-delete"
              autoFocus
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="rounded-[10px] border border-border bg-surface-2 px-3.5 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-primary/15 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={pending || confirmText !== "DELETE"}
              className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-kpi-red px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-kpi-red/90 disabled:opacity-50"
            >
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {pending ? "Deleting…" : "Delete forever"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
