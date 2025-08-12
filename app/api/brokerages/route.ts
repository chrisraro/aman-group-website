import { type NextRequest, NextResponse } from "next/server"
import { getBrokeragesData, saveBrokeragesData, resetBrokeragesData } from "@/lib/storage/kv-storage"
import { after } from "next/server"
import { incrementModuleChange, recordAdminActivity, setCounts } from "@/lib/server/admin-activity"

export async function GET() {
  try {
    const data = await getBrokeragesData()
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error fetching brokerages data:", error)

    // Return fallback data instead of error
    const { accreditedBrokerages } = await import("@/lib/data/brokerages")
    const fallbackData = accreditedBrokerages.map((b) => ({
      ...b,
      contactEmail: `contact@${b.agency.toLowerCase().replace(/\s+/g, "")}.com`,
      contactPhone: "+63 912 345 6789",
      address: "Metro Manila, Philippines",
      status: "Active" as const,
    }))
    return NextResponse.json(fallbackData, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await saveBrokeragesData(data)

    if (result.success) {
      after(async () => {
        try {
          await recordAdminActivity({ module: "brokerages", action: "update" })
          if (Array.isArray(data)) {
            await setCounts({ brokerages: data.length })
          }
          await incrementModuleChange("brokerages", 1)
        } catch (e) {
          console.error("brokerages POST activity error:", e)
        }
      })
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error || "Failed to save data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error saving brokerages data:", error)
    return NextResponse.json({ error: "Failed to save brokerages data" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const result = await resetBrokeragesData()

    if (result.success) {
      after(async () => {
        try {
          await recordAdminActivity({ module: "brokerages", action: "reset" })
          await setCounts({ brokerages: 26 }) // Default count
          await incrementModuleChange("brokerages", 1)
        } catch (e) {
          console.error("brokerages PUT activity error:", e)
        }
      })
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error || "Failed to reset data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error resetting brokerages data:", error)
    return NextResponse.json({ error: "Failed to reset brokerages data" }, { status: 500 })
  }
}
