import { type NextRequest, NextResponse } from "next/server"
import { getModelHousesData, saveModelHousesData, resetModelHousesData } from "@/lib/storage/kv-storage"

export async function GET() {
  try {
    const data = await getModelHousesData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching model houses data:", error)
    return NextResponse.json({ error: "Failed to fetch model houses data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    await saveModelHousesData(data)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving model houses data:", error)
    return NextResponse.json({ error: "Failed to save model houses data" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // This endpoint is for resetting data to defaults
    await resetModelHousesData()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error resetting model houses data:", error)
    return NextResponse.json({ error: "Failed to reset model houses data" }, { status: 500 })
  }
}
