import { NextResponse } from "next/server";
import { getSettingsProfile } from "@/features/settings/server/queries";
import { DEFAULT_NOTIFICATION_PREFS } from "@/features/settings/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const profile = await getSettingsProfile();
    return NextResponse.json(profile.notifications);
  } catch {
    return NextResponse.json(DEFAULT_NOTIFICATION_PREFS, { status: 200 });
  }
}
