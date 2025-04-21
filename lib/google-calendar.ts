// Google Calendar API integration utilities

// Time slot interface
export interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
}

// Function to generate available time slots for a specific date
export function generateTimeSlots(date: string, bookedSlots: string[] = []): TimeSlot[] {
  // Business hours: 9 AM to 5 PM
  const businessHours = [
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "13:00", end: "14:00" }, // Skip lunch hour (12-1)
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
    { start: "16:00", end: "17:00" },
  ]

  // Check if the date is in the past
  const selectedDate = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // If date is in the past, return all slots as unavailable
  if (selectedDate < today) {
    return businessHours.map((hour) => ({
      startTime: `${date}T${hour.start}`,
      endTime: `${date}T${hour.end}`,
      available: false,
    }))
  }

  // Check if the date is today, if so, filter out past hours
  const isToday = selectedDate.getTime() === today.getTime()
  const currentHour = new Date().getHours()

  return businessHours.map((hour) => {
    const hourNum = Number.parseInt(hour.start.split(":")[0])
    const isAvailable =
      (!isToday || hourNum > currentHour) && // Not in the past
      !bookedSlots.includes(`${date}T${hour.start}`) // Not already booked

    return {
      startTime: `${date}T${hour.start}`,
      endTime: `${date}T${hour.end}`,
      available: isAvailable,
    }
  })
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

// Function to format a date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Function to format a time for display
export function formatTime(timeString: string): string {
  const time = timeString.split("T")[1]
  const hour = Number.parseInt(time.split(":")[0])
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:00 ${ampm}`
}
