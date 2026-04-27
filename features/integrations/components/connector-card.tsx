"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  PROVIDER_META,
} from "@/features/integrations/components/provider-meta";
import { ConnectDialog } from "@/features/integrations/components/connect-dialog";
import {
  disconnect,
  refreshSync,
} from "@/features/integrations/server/actions";
import type {
  IntegrationRow,
  Provider,
} from "@/features/integrations/server/queries";

export function ConnectorCard({ row }: { row: IntegrationRow }) {
  const meta = PROVIDER_META[row.provider];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, startTx] = useTransition();
  const Icon = meta.icon;

  const stats = providerStats(row);
  const syncError =
    row.connected
      ? ((row.metadata as { syncError?: string } | null)?.syncError ?? null)
      : null;
  const lastSyncedLabel = formatLastSynced(row.lastSyncedAt);
  const zeroState = computeZeroState(row);

  function onPrimary() {
    if (!row.connected) {
      setDialogOpen(true);
      return;
    }
    // The server action calls revalidatePath("/integrations") which streams
    // the fresh tree back with the action response — no router.refresh()
    // needed (that was double-fetching and adding a full extra round-trip).
    startTx(async () => {
      try {
        await disconnect(row.provider);
        toast.success(`${meta.name} disconnected`);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Couldn't disconnect right now",
        );
      }
    });
  }

  function onRefresh() {
    if (!row.connected) return;
    startTx(async () => {
      try {
        await refreshSync(row.provider);
        toast.success(`${meta.name} synced`);
      } catch {
        toast.error("Sync failed");
      }
    });
  }

  return (
    <div className="flex h-full flex-col gap-3 rounded-[14px] border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-[10px]",
              meta.tileBg,
            )}
          >
            <Icon className={cn("h-5 w-5", meta.tileFg)} />
          </div>
          <div>
            <div className="text-[13.5px] font-bold">{meta.name}</div>
            <div className="text-[10.5px] text-muted-foreground-strong">
              {meta.blurb}
            </div>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            row.connected
              ? "border-kpi-green/30 bg-kpi-green/15 text-kpi-green"
              : "border-border bg-surface-2 text-muted-foreground",
          )}
        >
          {row.connected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={!row.connected || pending}
        className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-border bg-surface-2 px-3 py-1.5 text-[11.5px] font-semibold text-foreground transition-colors hover:bg-primary/15 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Settings2 className="h-3.5 w-3.5" />
        Configure
      </button>

      <div className="flex flex-1 flex-col gap-2 rounded-[10px] border border-border bg-surface-2 p-3">
        <div className="flex items-center justify-between gap-2 text-[11px] font-semibold text-muted-foreground-strong">
          <span>{stats.heading}</span>
          {syncError ? (
            <span
              title={syncError}
              className="inline-flex items-center gap-1 rounded-full border border-kpi-red/40 bg-kpi-red/10 px-1.5 py-0.5 text-[9.5px] font-semibold text-kpi-red"
            >
              <AlertTriangle className="h-3 w-3" />
              Sync error
            </span>
          ) : lastSyncedLabel ? (
            <span className="text-[9.5px] font-normal text-muted-foreground-strong">
              {lastSyncedLabel}
            </span>
          ) : null}
        </div>
        <ul className="space-y-1.5">
          {stats.items.map((s) => (
            <li
              key={s.label}
              className="flex items-center justify-between text-[11.5px]"
            >
              <span className="text-muted-foreground">{s.label}</span>
              <span
                className={cn(
                  "font-bold",
                  s.tone === "green"
                    ? "text-kpi-green"
                    : s.tone === "orange"
                      ? "text-kpi-orange"
                      : s.tone === "red"
                        ? "text-kpi-red"
                        : "text-foreground",
                )}
              >
                {s.value}
              </span>
            </li>
          ))}
        </ul>
        {zeroState ? (
          <p className="mt-1 text-[10px] leading-snug text-muted-foreground-strong">
            {zeroState}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrimary}
          disabled={pending}
          className={cn(
            "flex-1 rounded-[10px] px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-60",
            row.connected
              ? "border border-kpi-red/30 bg-kpi-red/15 text-kpi-red hover:bg-kpi-red/25"
              : "bg-primary text-white hover:bg-primary-soft",
          )}
        >
          {row.connected ? "Disconnect" : "Connect"}
        </button>
        {row.connected && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={pending}
            aria-label="Refresh sync"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface-2 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-foreground disabled:opacity-50"
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", pending && "animate-spin")}
            />
          </button>
        )}
      </div>

      <ConnectDialog
        provider={row.provider}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}

function providerStats(row: IntegrationRow): {
  heading: string;
  items: { label: string; value: string; tone?: "green" | "orange" | "red" }[];
} {
  // Connected rows pull real values from Integration.metadata when the
  // provider sync has populated them; before the first sync (or for providers
  // whose OAuth isn't wired up yet) we fall back to "Awaiting sync".
  const md = (row.metadata ?? {}) as Record<string, unknown>;
  const pending = row.connected ? "Awaiting sync" : "—";
  const num = (key: string): string => {
    const v = md[key];
    return typeof v === "number" ? String(v) : pending;
  };

  if (row.provider === "GITHUB") {
    const login = typeof md.login === "string" ? `@${md.login}` : pending;
    return {
      heading: "This week",
      items: [
        { label: "Account", value: login },
        { label: "Commits", value: num("commitsThisWeek") },
        { label: "PRs merged", value: num("prsThisWeek"), tone: "green" },
      ],
    };
  }
  // LEETCODE
  const username = typeof md.username === "string" ? `@${md.username}` : "—";
  return {
    heading: "This week",
    items: [
      { label: "Username", value: row.connected ? username : "—" },
      { label: "Solved this week", value: num("weekSolved") },
      { label: "Easy", value: num("easy"), tone: "green" },
      { label: "Medium", value: num("medium"), tone: "orange" },
      { label: "Hard", value: num("hard"), tone: "red" },
    ],
  };
}

function formatLastSynced(ts: Date | null): string | null {
  if (!ts) return null;
  const diffSec = Math.max(0, (Date.now() - ts.getTime()) / 1000);
  if (diffSec < 60) return "Synced just now";
  if (diffSec < 3600) return `Synced ${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86_400) return `Synced ${Math.floor(diffSec / 3600)}h ago`;
  return `Synced ${Math.floor(diffSec / 86_400)}d ago`;
}

// Some providers can legitimately return zero counts (no contributions in the
// last 7 days, or private contributions hidden in the user's profile
// settings). When that happens, surface a one-liner so the user knows what to
// check before assuming the integration is broken.
function computeZeroState(row: IntegrationRow): string | null {
  if (!row.connected) return null;
  const md = (row.metadata ?? {}) as Record<string, unknown>;
  if (md.syncError) return null; // error badge already covers this
  if (row.provider === "GITHUB") {
    const commits = typeof md.commitsThisWeek === "number" ? md.commitsThisWeek : null;
    const prs = typeof md.prsThisWeek === "number" ? md.prsThisWeek : null;
    if (commits === 0 && prs === 0) {
      return "No contributions in the last 7 days. If you have private commits, enable “Include private contributions on my profile” in your GitHub settings to make them count.";
    }
  }
  if (row.provider === "LEETCODE") {
    const week = typeof md.weekSolved === "number" ? md.weekSolved : null;
    const total = ["easy", "medium", "hard"].reduce(
      (a, k) => a + (typeof md[k] === "number" ? (md[k] as number) : 0),
      0,
    );
    if (week === 0 && total === 0) {
      return "No public submissions found. Make sure your LeetCode profile is public and the username is spelled correctly.";
    }
  }
  return null;
}

export type { Provider };
