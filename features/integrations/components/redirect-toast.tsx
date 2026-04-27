"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const PROVIDER_LABEL: Record<string, string> = {
  github: "GitHub",
  leetcode: "LeetCode",
};

/**
 * Reads ?connected= or ?error= from the URL after an OAuth round-trip,
 * fires a toast, and strips the params so a refresh doesn't replay them.
 */
export function RedirectToast() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const connected = sp.get("connected");
    const error = sp.get("error");
    if (!connected && !error) return;
    if (connected) {
      const label = PROVIDER_LABEL[connected] ?? connected;
      toast.success(`${label} connected`);
    } else if (error) {
      toast.error(error);
    }
    // Clean up the URL.
    const next = new URLSearchParams(sp);
    next.delete("connected");
    next.delete("error");
    const qs = next.toString();
    router.replace(qs ? `/integrations?${qs}` : "/integrations");
  }, [sp, router]);

  return null;
}
