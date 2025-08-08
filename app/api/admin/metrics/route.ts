import { NextResponse } from "next/server"
import { getAdminStats, getRecentActivity } from "@/lib/server/admin-activity"

export async function GET() {
  try {
    const [stats, recent] = await Promise.all([getAdminStats().catch(() => ({})), getRecentActivity(10).catch(() => [])])
    return NextResponse.json({ success: true, stats, recent }, { headers: { "Cache-Control": "no-store" } })
  } catch (e) {
    console.error("Metrics GET error:", e)
    return NextResponse.json({ success: false, error: "Failed to load metrics" }, { status: 500 })
  }
}
