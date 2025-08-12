import { type NextRequest, NextResponse } from "next/server"
import { getAgentsData, saveAgentsData, resetAgentsData } from "@/lib/storage/kv-storage"
import { after } from "next/server"
import { incrementModuleChange, recordAdminActivity, setCounts } from "@/lib/server/admin-activity"

export async function GET() {
  try {
    const data = await getAgentsData()
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error fetching agents data:", error)

    // Return fallback data instead of error
    const { getAllAgents } = await import("@/lib/data/agents")
    const { accreditedBrokerages } = await import("@/lib/data/brokerages")
    const fallbackData = getAllAgents().map((a) => ({
      ...a,
      email: `${a.name.toLowerCase().replace(/\s+/g, ".")}@${
        accreditedBrokerages
          .find((b) => b.id === a.agencyId)
          ?.agency.toLowerCase()
          .replace(/\s+/g, "") || "agency"
      }.com`,
      phone: "+63 912 345 6789",
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
    const result = await saveAgentsData(data)

    if (result.success) {
      after(async () => {
        try {
          await recordAdminActivity({ module: "agents", action: "update" })
          if (Array.isArray(data)) {
            await setCounts({ agents: data.length })
          }
          await incrementModuleChange("agents", 1)
        } catch (e) {
          console.error("agents POST activity error:", e)
        }
      })
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error || "Failed to save data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error saving agents data:", error)
    return NextResponse.json({ error: "Failed to save agents data" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const result = await resetAgentsData()

    if (result.success) {
      after(async () => {
        try {
          await recordAdminActivity({ module: "agents", action: "reset" })
          await setCounts({ agents: 45 }) // Default count
          await incrementModuleChange("agents", 1)
        } catch (e) {
          console.error("agents PUT activity error:", e)
        }
      })
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: result.error || "Failed to reset data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error resetting agents data:", error)
    return NextResponse.json({ error: "Failed to reset agents data" }, { status: 500 })
  }
}
