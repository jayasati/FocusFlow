import { Moon, Sun } from "lucide-react";

export function ThemeCard() {
  return (
    <div className="space-y-4 rounded-[14px] border border-border bg-card p-5">
      <h3 className="text-[14px] font-bold">Theme</h3>
      <p className="text-[12px] text-muted-foreground-strong">
        Pick how FocusFlow looks on this device.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          aria-pressed
          className="flex items-start gap-3 rounded-[12px] border-2 border-primary bg-primary/10 p-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-primary/20 text-primary-soft">
            <Moon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold">Dark</div>
            <div className="text-[11px] text-muted-foreground">
              Easier on the eyes during long focus sessions.
            </div>
          </div>
        </button>

        <button
          type="button"
          disabled
          className="flex items-start gap-3 rounded-[12px] border border-border bg-surface-2 p-3 text-left opacity-60"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-foreground/10 text-foreground">
            <Sun className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold">Light</span>
              <span className="rounded-full border border-border bg-card px-1.5 py-0.5 text-[9px] font-semibold text-muted-foreground-strong">
                Coming soon
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Light theme coming soon.
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
