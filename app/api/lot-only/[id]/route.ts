import { NextResponse } from "next/server"
import { getLotOnlyPropertyById } from "@/data/lot-only-properties"
import { kv } from "@vercel/kv"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // First try to get from KV storage for real-time data
    let property = null

    try {
      const kvData = await kv.get("lot-only-properties")
      if (kvData && Array.isArray(kvData)) {
        property = kvData.find((p: any) => p.id === params.id)
      }
    } catch (kvError) {
      console.error("Error fetching from KV:", kvError)
      // Fall back to static data if KV fails
    }

    // If not found in KV, fall back to static data
    if (!property) {
      property = getLotOnlyPropertyById(params.id)
    }

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Set cache control headers to prevent caching
    const headers = new Headers()
    headers.set("Cache-Control", "no-store, max-age=0")
    headers.set("Pragma", "no-cache")

    return NextResponse.json(
      { property },
      {
        headers,
        status: 200,
      },
    )
  } catch (error) {
    console.error("Failed to fetch property:", error)
    return NextResponse.json({ error: "Failed to fetch property" }, { status: 500 })
  }
}
