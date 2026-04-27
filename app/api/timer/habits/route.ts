import { NextResponse } from "next/server";
import { getTimeHabitsForPicker } from "@/features/timer/server/queries";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? undefined;
  try {
    const rows = await getTimeHabitsForPicker({ search: q || undefined });
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
