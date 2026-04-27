import { NextResponse } from "next/server";
import { getProductivityPulse } from "@/features/dashboard/server/pulse";

// Sidebar's "Keep going!" card calls this on mount. Marked dynamic because
// the underlying query is per-user and depends on the Clerk session.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getProductivityPulse();
    return NextResponse.json(data, {
      // Browser-side cache for 1 minute so flipping between pages doesn't
      // hammer the DB on every sidebar mount.
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch {
    return NextResponse.json(
      { score: 0, deltaPct: null, sparkline: [] },
      { status: 200 },
    );
  }
}
