import { type NextRequest, NextResponse } from "next/server"
import { getGoogleCalendarId, getGoogleApiKey, getGoogleCalendarApiEndpoint } from "@/lib/env"

// Types for Google Calendar API responses
interface GoogleCalendarEvent {
  id: string
  summary: string
  description?: string
  location?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  status: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Missing required parameters: startDate and endDate" }, { status: 400 })
    }

    // Use the environment variables with fallbacks
    const calendarId = getGoogleCalendarId()
    const apiKey = getGoogleApiKey()
    const apiEndpoint = getGoogleCalendarApiEndpoint()

    if (!apiKey) {
      console.error("Missing Google Calendar API key")
      // Return empty busy times instead of error to allow the app to function
      return NextResponse.json({ busyTimes: [] })
    }

    // Format dates for Google Calendar API
    const timeMin = new Date(startDate).toISOString()
    const timeMax = new Date(endDate + "T23:59:59").toISOString()

    try {
      // Fetch events from Google Calendar
      const response = await fetch(
        `${apiEndpoint}/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        { next: { revalidate: 60 } }, // Cache for 60 seconds
      )

      if (!response.ok) {
        console.error("Google Calendar API error status:", response.status)
        // Return empty busy times instead of error to allow the app to function
        return NextResponse.json({ busyTimes: [] })
      }

      const data = await response.json()
      const busyTimes = extractBusyTimesFromEvents(data.items || [])

      return NextResponse.json({ busyTimes })
    } catch (fetchError) {
      console.error("Error fetching from Google Calendar API:", fetchError)
      // Return empty busy times instead of error to allow the app to function
      return NextResponse.json({ busyTimes: [] })
    }
  } catch (error) {
    console.error("Error in calendar API route:", error)
    // Return empty busy times instead of error to allow the app to function
    return NextResponse.json({ busyTimes: [] })
  }
}

// Helper function to extract busy times from events
function extractBusyTimesFromEvents(events: GoogleCalendarEvent[]): string[] {
  const busyTimes: string[] = []

  events.forEach((event) => {
    if (event.status !== "cancelled" && event.start?.dateTime) {
      // Convert to local date format YYYY-MM-DDThh:mm
      const startDateTime = new Date(event.start.dateTime)
      const hour = startDateTime.getHours().toString().padStart(2, "0")
      const minute = startDateTime.getMinutes().toString().padStart(2, "0")
      const dateStr = startDateTime.toISOString().split("T")[0]

      busyTimes.push(`${dateStr}T${hour}:${minute}`)
    }
  })

  return busyTimes
}
