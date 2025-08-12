import { type NextRequest, NextResponse } from "next/server"
import { generateBrokerageLink, accreditedBrokerages } from "@/lib/brokerage-links"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { brokerageId, agentId } = body

    if (!brokerageId) {
      return NextResponse.json({ error: "Brokerage ID is required" }, { status: 400 })
    }

    // Verify brokerage exists
    const brokerage = accreditedBrokerages.find((b) => b.id === brokerageId)
    if (!brokerage) {
      return NextResponse.json({ error: "Invalid brokerage ID" }, { status: 400 })
    }

    // Get the base URL from the request
    const baseUrl = `${request.nextUrl.protocol}//${request.nextUrl.host}`

    // Generate the link
    const link = await generateBrokerageLink(brokerageId, baseUrl, agentId)

    if (!link) {
      return NextResponse.json({ error: "Failed to generate link" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      link,
      brokerage: {
        id: brokerage.id,
        name: brokerage.name,
        agency: brokerage.agency,
        department: brokerage.department,
      },
    })
  } catch (error) {
    console.error("Error generating brokerage link:", error)
    return NextResponse.json({ error: "Failed to generate brokerage link" }, { status: 500 })
  }
}
