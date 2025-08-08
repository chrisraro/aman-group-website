import { type NextRequest, NextResponse } from "next/server"
import { getModelHousesData, saveModelHousesData, resetModelHousesData } from "@/lib/storage/kv-storage"
import { after } from "next/server"
import { incrementModuleChange, recordAdminActivity, setCounts } from "@/lib/server/admin-activity"

export async function GET() {
  try {
    const data = await getModelHousesData()
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error fetching model houses data:", error)

    // Return fallback data instead of error
    const { modelHouseSeries } = await import("@/data/model-houses")
    return NextResponse.json(modelHouseSeries, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const result = await saveModelHousesData(data)

    if (result.success) {
      after(async () => {
        try {
          await recordAdminActivity({ module: "model-houses", action: "update" })
          // Optionally keep a series count snapshot to help dashboards
          const data = await (async () => {
            try {
              const d = await getModelHousesData()
              return d
            } catch { return null }
          })()
          if (data && Array.isArray(data)) {
            await setCounts({ "model-houses": data.length })
          }
          await incrementModuleChange("model-houses", 1)
        } catch (e) {
          console.error("model-houses POST activity error:", e)
        }
      })
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error || "Failed to save data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error saving model houses data:", error)
    return NextResponse.json({ error: "Failed to save model houses data" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const result = await resetModelHousesData()

    if (result.success) {
      after(async () => {
        try {
          await recordAdminActivity({ module: "model-houses", action: "reset" })
          await setCounts({ "model-houses": 0 })
          await incrementModuleChange("model-houses", 1)
        } catch (e) {
          console.error("model-houses PUT activity error:", e)
        }
      })
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error || "Failed to reset data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error resetting model houses data:", error)
    return NextResponse.json({ error: "Failed to reset model houses data" }, { status: 500 })
  }
}
