import { type NextRequest, NextResponse } from "next/server"
import { getLoanCalculatorSettings, saveLoanCalculatorSettings } from "@/lib/storage/kv-storage"
import { after } from "next/server"
import { incrementModuleChange, recordAdminActivity } from "@/lib/server/admin-activity"

export async function GET() {
  try {
    const settings = await getLoanCalculatorSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching loan calculator settings:", error)
    return NextResponse.json({ error: "Failed to fetch loan calculator settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    // Add timestamp
    settings.updatedAt = new Date()

    const result = await saveLoanCalculatorSettings(settings)

    if (result.success) {
      after(async () => {
        try {
          await recordAdminActivity({ module: "loan-calculator", action: "update" })
          await incrementModuleChange("loan-calculator", 1)
        } catch (e) {
          console.error("loan-calculator POST activity error:", e)
        }
      })
      return NextResponse.json({ success: true, settings })
    } else {
      return NextResponse.json({ error: result.error || "Failed to save settings" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error saving loan calculator settings:", error)
    return NextResponse.json({ error: "Failed to save loan calculator settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const updates = await request.json()

    // Get current settings
    const currentSettings = await getLoanCalculatorSettings()

    // Merge updates with current settings
    const updatedSettings = {
      ...currentSettings,
      ...updates,
      updatedAt: new Date(),
    }

    const result = await saveLoanCalculatorSettings(updatedSettings)

    if (result.success) {
      after(async () => {
        try {
          await recordAdminActivity({ module: "loan-calculator", action: "update" })
          await incrementModuleChange("loan-calculator", 1)
        } catch (e) {
          console.error("loan-calculator PUT activity error:", e)
        }
      })
      return NextResponse.json({ success: true, settings: updatedSettings })
    } else {
      return NextResponse.json({ error: result.error || "Failed to update settings" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating loan calculator settings:", error)
    return NextResponse.json({ error: "Failed to update loan calculator settings" }, { status: 500 })
  }
}
