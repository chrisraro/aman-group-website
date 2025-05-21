import { NextResponse } from "next/server"
import { getLotOnlyData, saveLotOnlyData, resetLotOnlyData } from "@/lib/storage/kv-storage"

export async function GET(request: Request) {
  try {
    const properties = await getLotOnlyData()

    // Set cache control headers to prevent caching
    const headers = new Headers()
    headers.set("Cache-Control", "no-store, max-age=0")
    headers.set("Pragma", "no-cache")

    return NextResponse.json(
      { properties },
      {
        headers,
        status: 200,
      },
    )
  } catch (error) {
    console.error("Error fetching lot-only properties:", error)
    return NextResponse.json({ error: "Failed to fetch lot-only properties" }, { status: 500 })
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
