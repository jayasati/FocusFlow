"use client";

import { Bell, Palette, ShieldAlert, User } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ProfileForm } from "@/features/settings/components/profile-form";
import { ThemeCard } from "@/features/settings/components/theme-card";
import { NotificationsForm } from "@/features/settings/components/notifications-form";
import { DangerZone } from "@/features/settings/components/danger-zone";
import type { SettingsProfile } from "@/features/settings/server/queries";

export function SettingsTabs({ profile }: { profile: SettingsProfile }) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-4 inline-flex h-auto flex-wrap gap-1 rounded-[12px] border border-border bg-card p-1 text-muted-foreground">
        <TabsTrigger
          value="profile"
          className="gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <User className="h-3.5 w-3.5" />
          Profile
        </TabsTrigger>
        <TabsTrigger
          value="theme"
          className="gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <Palette className="h-3.5 w-3.5" />
          Theme
        </TabsTrigger>
        <TabsTrigger
          value="notifications"
          className="gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          <Bell className="h-3.5 w-3.5" />
          Notifications
        </TabsTrigger>
        <TabsTrigger
          value="danger"
          className="gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-semibold data-[state=active]:bg-kpi-red data-[state=active]:text-white"
        >
          <ShieldAlert className="h-3.5 w-3.5" />
          Danger Zone
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-0">
        <ProfileForm
          defaults={{
            firstName: profile.firstName,
            lastName: profile.lastName,
            bio: profile.bio,
          }}
          email={profile.email}
        />
      </TabsContent>

      <TabsContent value="theme" className="mt-0">
        <ThemeCard />
      </TabsContent>

      <TabsContent value="notifications" className="mt-0">
        <NotificationsForm defaults={profile.notifications} />
      </TabsContent>

      <TabsContent value="danger" className="mt-0">
        <DangerZone email={profile.email} />
      </TabsContent>
    </Tabs>
  );
}
