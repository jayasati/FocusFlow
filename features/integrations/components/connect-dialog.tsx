"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
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
import { connectLeetcode } from "@/features/integrations/server/actions";
import {
  PROVIDER_META,
  type ProviderMeta,
} from "@/features/integrations/components/provider-meta";
import type { Provider } from "@/features/integrations/server/queries";

export function ConnectDialog({
  provider,
  open,
  onOpenChange,
}: {
  provider: Provider;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const meta: ProviderMeta = PROVIDER_META[provider];
  const [username, setUsername] = useState("");
  const [pending, startTx] = useTransition();

  const isGithub = provider === "GITHUB";
  const showUsername = provider === "LEETCODE";

  function onConfirm() {
    if (isGithub) {
      // Real OAuth flow — bounce the browser to the initiate route which
      // generates a state cookie and redirects to GitHub's authorize page.
      window.location.assign("/api/integrations/github/initiate");
      return;
    }
    // revalidatePath in the action streams the fresh tree back with the
    // response, so no router.refresh() is needed here.
    startTx(async () => {
      try {
        const trimmed = username.trim();
        if (!trimmed) {
          toast.error("Enter your LeetCode username");
          return;
        }
        await connectLeetcode({ username: trimmed });
        toast.success(`${meta.name} connected`);
        onOpenChange(false);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Couldn't connect right now",
        );
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>Connect {meta.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground-strong">
            {isGithub
              ? `You'll be redirected to GitHub to authorize FocusFlow. We request "read:user" and "repo" so we can show your real commit and PR activity.`
              : "Enter your public LeetCode username. We'll fetch solved-by-difficulty and recent submission stats from LeetCode's public profile."}
          </DialogDescription>
        </DialogHeader>

        {showUsername ? (
          <div className="space-y-1.5">
            <Label htmlFor="lc-username">Username</Label>
            <Input
              id="lc-username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. leetcoder42"
            />
          </div>
        ) : (
          <div className="rounded-[10px] border border-border bg-surface-2 p-3 text-[12px] text-muted-foreground-strong">
            Your access token is stored on FocusFlow servers and is only used
            to fetch your activity. You can disconnect at any time.
          </div>
        )}

        <DialogFooter>
          <button
            type="button"
            disabled={pending}
            onClick={() => onOpenChange(false)}
            className="rounded-[10px] border border-border bg-surface-2 px-3.5 py-1.5 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-primary/15 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] bg-primary px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-primary-soft disabled:opacity-60"
          >
            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {pending
              ? "Connecting…"
              : isGithub
                ? "Continue to GitHub"
                : "Confirm"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
