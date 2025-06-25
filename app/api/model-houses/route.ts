import { type NextRequest, NextResponse } from "next/server"
import { getModelHousesData, saveModelHousesData, resetModelHousesData } from "@/lib/storage/kv-storage"

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
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error || "Failed to reset data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error resetting model houses data:", error)
    return NextResponse.json({ error: "Failed to reset model houses data" }, { status: 500 })
  }
}
