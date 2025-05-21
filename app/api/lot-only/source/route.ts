import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export async function GET() {
  try {
    let source = "Static Data"

    // Check if we can access Upstash KV
    try {
      // Try to access KV to see if it's available
      const testKey = "test_connection"
      await kv.set(testKey, "connected")
      const testValue = await kv.get(testKey)

      if (testValue === "connected") {
        source = "Upstash KV"
        // Clean up test key
        await kv.del(testKey)
      }
    } catch (kvError) {
      console.warn("Vercel KV access error:", kvError)
      source = "Static Data (KV Unavailable)"
    }

    // Set cache control headers to prevent caching
    const headers = new Headers()
    headers.set("Cache-Control", "no-store, max-age=0")
    headers.set("Pragma", "no-cache")

    return NextResponse.json(
      { source },
      {
        headers,
        status: 200,
      },
    )
  } catch (error) {
    console.error("Error checking data source:", error)
    return NextResponse.json({ source: "Unknown (Error)" }, { status: 500 })
  }
}
