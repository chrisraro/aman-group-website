import { NextResponse } from "next/server"
import { getLotOnlyData, saveLotOnlyData, resetLotOnlyData } from "@/lib/storage/kv-storage"

export async function GET(request: Request) {
  try {
    let properties

    try {
      properties = await getLotOnlyData()
    } catch (storageError) {
      console.warn("Storage error, using fallback data:", storageError)
      // Import and use initial data as fallback
      const { lotOnlyProperties } = await import("@/data/lot-only-properties")
      properties = lotOnlyProperties
    }

    // Set cache control headers to prevent caching
    const headers = new Headers()
    headers.set("Cache-Control", "no-store, max-age=0")
    headers.set("Pragma", "no-cache")

    return NextResponse.json(
      { properties: properties || [] },
      {
        headers,
        status: 200,
      },
    )
  } catch (error) {
    console.error("Error in lot-only API route:", error)

    // Return fallback data instead of error
    try {
      const { lotOnlyProperties } = await import("@/data/lot-only-properties")
      return NextResponse.json({ properties: lotOnlyProperties }, { status: 200 })
    } catch (fallbackError) {
      console.error("Even fallback failed:", fallbackError)
      return NextResponse.json({ properties: [] }, { status: 200 })
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { properties } = body

    if (!properties || !Array.isArray(properties)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    await saveLotOnlyData(properties)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving lot-only properties:", error)
    return NextResponse.json({ error: "Failed to save lot-only properties" }, { status: 500 })
  }
}

export async function PUT() {
  try {
    await resetLotOnlyData()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resetting lot-only data:", error)
    return NextResponse.json({ error: "Failed to reset lot-only data" }, { status: 500 })
  }
}
