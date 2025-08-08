import { type NextRequest, NextResponse } from "next/server"
import { lotOnlyProperties } from "@/data/lot-only-properties"
import { after } from "next/server"
import { incrementModuleChange, recordAdminActivity, setCounts } from "@/lib/server/admin-activity"

export async function GET(request: NextRequest) {
  try {
    // Add a small delay to simulate real API behavior
    await new Promise((resolve) => setTimeout(resolve, 100))

    const searchParams = request.nextUrl.searchParams
    const project = searchParams.get("project")
    const developer = searchParams.get("developer")

    // Use the static data directly
    let properties = [...lotOnlyProperties]

    // Filter by project if specified
    if (project) {
      properties = properties.filter((property) => property.project.toLowerCase().includes(project.toLowerCase()))
    }

    // Filter by developer if specified
    if (developer) {
      properties = properties.filter((property) => property.developer.toLowerCase().includes(developer.toLowerCase()))
    }

    // Set cache control headers to prevent caching
    const headers = new Headers()
    headers.set("Cache-Control", "no-store, max-age=0")
    headers.set("Pragma", "no-cache")

    return NextResponse.json(
      {
        success: true,
        properties: properties,
        total: properties.length,
      },
      {
        headers,
        status: 200,
      },
    )
  } catch (error) {
    console.error("Error fetching lot-only properties:", error)

    // Return fallback data instead of error
    return NextResponse.json(
      {
        success: true,
        properties: lotOnlyProperties,
        total: lotOnlyProperties.length,
      },
      { status: 200 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { properties } = body

    if (!properties || !Array.isArray(properties)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid data format",
        },
        { status: 400 },
      )
    }

    // For now, just return success since we're using static data
    const response = NextResponse.json({ success: true })

    after(async () => {
      try {
        await recordAdminActivity({ module: "lot-only", action: "update" })
        if (Array.isArray(properties)) {
          await setCounts({ "lot-only": properties.length })
        }
        await incrementModuleChange("lot-only", 1)
      } catch (e) {
        console.error("lot-only POST activity error:", e)
      }
    })

    return response
  } catch (error) {
    console.error("Error saving lot-only properties:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save lot-only properties",
      },
      { status: 500 },
    )
  }
}

export async function PUT() {
  try {
    // For now, just return success since we're using static data
    const response = NextResponse.json({ success: true })

    after(async () => {
      try {
        await recordAdminActivity({ module: "lot-only", action: "reset" })
        await incrementModuleChange("lot-only", 1)
      } catch (e) {
        console.error("lot-only PUT activity error:", e)
      }
    })

    return response
  } catch (error) {
    console.error("Error resetting lot-only data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset lot-only data",
      },
      { status: 500 },
    )
  }
}
