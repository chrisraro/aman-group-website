import useSWR from "swr"
import { API_ENDPOINTS } from "@/lib/constants"

export interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
}

export interface CalendarAvailability {
  date: string
  slots: TimeSlot[]
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Custom hook for fetching calendar availability
export function useCalendarAvailability(startDate: string | null, endDate: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ availability: CalendarAvailability[] }>(
    startDate && endDate ? `${API_ENDPOINTS.calendar}?startDate=${startDate}&endDate=${endDate}` : null,
    fetcher,
  )

  return {
    availability: data?.availability || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Function to create a Google Calendar event URL
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
