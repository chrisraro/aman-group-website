import { type NextRequest, NextResponse } from "next/server"
import { validateBrokerageLink, getBrokerageFromParams } from "@/lib/brokerage-links"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Validate the brokerage link parameters
    const brokerageInfo = await getBrokerageFromParams(searchParams)

    if (!brokerageInfo) {
      return NextResponse.json({ error: "Invalid brokerage link parameters" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      brokerage: brokerageInfo,
    })
  } catch (error) {
    console.error("Error validating brokerage link:", error)
    return NextResponse.json({ error: "Failed to validate brokerage link" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brokerageId, hash, agentId } = body

    if (!brokerageId || !hash) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const isValid = await validateBrokerageLink(brokerageId, hash, agentId)

    return NextResponse.json({
      valid: isValid,
    })
  } catch (error) {
    console.error("Error validating brokerage link:", error)
    return NextResponse.json({ error: "Failed to validate brokerage link" }, { status: 500 })
  }
}
