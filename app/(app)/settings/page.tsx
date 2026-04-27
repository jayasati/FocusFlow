import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { getSettingsProfile } from "@/features/settings/server/queries";
import { SettingsTabs } from "@/features/settings/components/settings-tabs";

export default function SettingsPage() {
  return (
    <div className="flex h-screen flex-col">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2 lg:px-5">
        <div className="mx-auto max-w-3xl">
          <Suspense fallback={<TabsSkeleton />}>
            <SettingsBody />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function SettingsBody() {
  const profile = await getSettingsProfile();
  return <SettingsTabs profile={profile} />;
}

function TabsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-72 rounded-[12px]" />
      <Skeleton className="h-[300px] rounded-[14px]" />
    </div>
  );
}
