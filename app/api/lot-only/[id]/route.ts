import { type NextRequest, NextResponse } from "next/server"
import { lotOnlyProperties } from "@/data/lot-only-properties"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Property ID is required",
        },
        { status: 400 },
      )
    }

    // Find the property by ID
    const property = lotOnlyProperties.find((p) => p.id === id)

    if (!property) {
      return NextResponse.json(
        {
          success: false,
          error: "Property not found",
        },
        { status: 404 },
      )
    }

    // Set cache control headers
    const headers = new Headers()
    headers.set("Cache-Control", "no-store, max-age=0")
    headers.set("Pragma", "no-cache")

    return NextResponse.json(
      {
        success: true,
        property,
      },
      {
        headers,
        status: 200,
      },
    )
  } catch (error) {
    console.error("Error fetching lot-only property:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch property",
      },
      { status: 500 },
    )
  }
}
