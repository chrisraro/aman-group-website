import { getICalUrl } from "@/lib/env"

// Export the iCal URL constant
export const ICAL_URL = getICalUrl()

// Types for Google Calendar API responses
export interface GoogleCalendarEvent {
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

export interface CalendarAvailability {
  date: string
  slots: {
    startTime: string
    endTime: string
    available: boolean
  }[]
}

// Function to fetch busy times from Google Calendar
export async function fetchCalendarBusyTimes(startDate: string, endDate: string): Promise<string[]> {
  try {
    // Use our server-side route to fetch busy times
    const response = await fetch(
      `/api/calendar?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
        // Add timeout to prevent long-hanging requests
        signal: AbortSignal.timeout(5000), // 5 second timeout
      },
    )

    if (!response.ok) {
      console.error("Calendar API error status:", response.status)
      // Return empty array instead of throwing to allow the app to function
      return []
    }

    const data = await response.json()
    return data.busyTimes || []
  } catch (error) {
    console.error("Error fetching calendar busy times:", error)
    // Return empty array instead of throwing to allow the app to function
    return []
  }
}

// Function to get available time slots for a date range
export async function getAvailabilityForDateRange(startDate: string, endDate: string): Promise<CalendarAvailability[]> {
  try {
    // Fetch busy times from Google Calendar
    const busyTimes = await fetchCalendarBusyTimes(startDate, endDate)

    // Generate availability for each day in the range
    const availability: CalendarAvailability[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      const dateStr = day.toISOString().split("T")[0]

      // Generate time slots for this day
      const slots = generateTimeSlotsForDay(dateStr, busyTimes)

      availability.push({
        date: dateStr,
        slots,
      })
    }

    return availability
  } catch (error) {
    console.error("Error getting availability:", error)

    // Generate fallback availability with all slots available
    return generateFallbackAvailability(startDate, endDate)
  }
}

// Helper function to generate fallback availability
function generateFallbackAvailability(startDate: string, endDate: string): CalendarAvailability[] {
  const availability: CalendarAvailability[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    const dateStr = day.toISOString().split("T")[0]

    // Generate fallback time slots for this day (all available)
    const slots = generateFallbackTimeSlotsForDay(dateStr)

    availability.push({
      date: dateStr,
      slots,
    })
  }

  return availability
}

// Business hours definition - centralized for reuse
const BUSINESS_HOURS = [
  { start: "09:00", end: "10:00" },
  { start: "10:00", end: "11:00" },
  { start: "11:00", end: "12:00" },
  { start: "13:00", end: "14:00" }, // Skip lunch hour (12-1)
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
]

// Helper function to generate time slots for a day
function generateTimeSlotsForDay(
  date: string,
  busyTimes: string[],
): { startTime: string; endTime: string; available: boolean }[] {
  // Check if the date is in the past
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // If date is in the past, return all slots as unavailable
  if (selectedDate < today) {
    return BUSINESS_HOURS.map((hour) => ({
      startTime: `${date}T${hour.start}`,
      endTime: `${date}T${hour.end}`,
      available: false,
    }))
  }

  // Check if the date is today, if so, filter out past hours
  const isToday = selectedDate.getTime() === today.getTime()
  const currentHour = new Date().getHours()

  return BUSINESS_HOURS.map((hour) => {
    const hourNum = Number.parseInt(hour.start.split(":")[0])
    const isAvailable =
      (!isToday || hourNum > currentHour) && // Not in the past
      !busyTimes.includes(`${date}T${hour.start}`) // Not already booked

    return {
      startTime: `${date}T${hour.start}`,
      endTime: `${date}T${hour.end}`,
      available: isAvailable,
    }
  })
}

// Helper function to generate fallback time slots (all available)
function generateFallbackTimeSlotsForDay(date: string): { startTime: string; endTime: string; available: boolean }[] {
  // Check if the date is in the past
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // If date is in the past, return all slots as unavailable
  if (selectedDate < today) {
    return BUSINESS_HOURS.map((hour) => ({
      startTime: `${date}T${hour.start}`,
      endTime: `${date}T${hour.end}`,
      available: false,
    }))
  }

  // Check if the date is today, if so, filter out past hours
  const isToday = selectedDate.getTime() === today.getTime()
  const currentHour = new Date().getHours()

  return BUSINESS_HOURS.map((hour) => {
    const hourNum = Number.parseInt(hour.start.split(":")[0])
    const isAvailable = !isToday || hourNum > currentHour // Not in the past

    return {
      startTime: `${date}T${hour.start}`,
      endTime: `${date}T${hour.end}`,
      available: isAvailable,
    }
  })
}

// Function to create a Google Calendar event
export async function createCalendarEvent(
  summary: string,
  description: string,
  location: string,
  startDateTime: string,
  endDateTime: string,
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    // For now, we'll use the Google Calendar URL approach
    // In a production app, you would implement server-side OAuth2 authentication
    // and use the Google Calendar API to create events directly

    // Return success with a placeholder event ID
    return {
      success: true,
      eventId: `event_${Date.now()}`,
    }
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create calendar event",
    }
  }
}

// Function to generate a Google Calendar URL for adding an event
export function createGoogleCalendarUrl(
  title: string,
  details: string,
  location: string,
  startDateTime: string,
  endDateTime: string,
): string {
  const googleCalendarUrl = new URL("https://calendar.google.com/calendar/render")
  googleCalendarUrl.searchParams.append("action", "TEMPLATE")
  googleCalendarUrl.searchParams.append("text", title)
  googleCalendarUrl.searchParams.append("details", details)
  googleCalendarUrl.searchParams.append("location", location)

  // Format dates for Google Calendar
  const formattedStart = startDateTime.replace(/[-:]/g, "")
  const formattedEnd = endDateTime.replace(/[-:]/g, "")
  googleCalendarUrl.searchParams.append("dates", `${formattedStart}/${formattedEnd}`)

  // Add other useful parameters
  googleCalendarUrl.searchParams.append("ctz", Intl.DateTimeFormat().resolvedOptions().timeZone)
  googleCalendarUrl.searchParams.append("sf", "true")
  googleCalendarUrl.searchParams.append("output", "xml")

  return googleCalendarUrl.toString()
}

// Helper functions for formatting dates and times
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatTime(timeString: string): string {
  const time = timeString.split("T")[1]
  const hour = Number.parseInt(time.split(":")[0])
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:00 ${ampm}`
}
