"use client";

import { Bell, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  searchPlaceholder?: string;
  className?: string;
};

export function TopBar({ searchPlaceholder, className }: Props) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {searchPlaceholder ? (
        <div className="relative w-72 max-w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            className="bg-card pl-9"
          />
        </div>
      ) : null}

      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        className="relative h-9 w-9 rounded-full bg-card hover:bg-secondary/60"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-kpi-red ring-2 ring-card" />
      </Button>

      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: "h-9 w-9",
          },
        }}
      />
    </div>
  );
}
