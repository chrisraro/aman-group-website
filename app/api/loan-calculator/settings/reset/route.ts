import { NextResponse } from "next/server"
import { resetLoanCalculatorSettings } from "@/lib/storage/kv-storage"

export async function POST() {
  try {
    const result = await resetLoanCalculatorSettings()

    if (result.success) {
      return NextResponse.json({ success: true, message: "Settings reset to default" })
    } else {
      return NextResponse.json({ error: result.error || "Failed to reset settings" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error resetting loan calculator settings:", error)
    return NextResponse.json({ error: "Failed to reset loan calculator settings" }, { status: 500 })
  }
}
