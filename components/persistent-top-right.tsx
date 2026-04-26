"use client";

import { Bell } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

/**
 * Mounted ONCE in the (app) layout so Clerk's UserButton doesn't re-bootstrap
 * on every navigation. Positioned over the page-header row of every page.
 */
export function PersistentTopRight() {
  return (
    <div className="pointer-events-none absolute right-4 top-5 z-30 hidden items-center gap-3 sm:right-6 sm:top-6 md:right-8 md:top-7 md:flex">
      <div className="pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative h-9 w-9 rounded-full bg-sidebar hover:bg-primary/15"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </Button>
      </div>
      <div className="pointer-events-auto">
        <UserButton
          appearance={{ elements: { userButtonAvatarBox: "h-9 w-9" } }}
        />
      </div>
    </div>
  );
}
