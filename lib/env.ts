/**
 * Utility functions for accessing environment variables with fallbacks
 */

// Google Calendar related environment variables
export function getGoogleCalendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID || "default-calendar-id"
}

export function getGoogleApiKey(): string {
  return process.env.GOOGLE_API_KEY || ""
}

export function getGoogleCalendarApiEndpoint(): string {
  return process.env.GOOGLE_CALENDAR_API_ENDPOINT || "https://www.googleapis.com/calendar/v3/calendars"
}
export const getGoogleCalendarUrl = () =>
  process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL ||
  "https://calendar.google.com/calendar/embed?src=marketing.erdc%40gmail.com&ctz=Asia%2FManila"
export const getGoogleDriveEmbedUrl = () =>
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_EMBED_URL || "https://drive.google.com/file/d/"

// Formspree related environment variables
export const getFormspreeFormId = () => process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || ""

// iCal URL
export function getICalUrl(): string {
  return process.env.NEXT_PUBLIC_ICAL_URL || ""
}

// Add KV environment variables
export function getKvUrl(): string {
  return process.env.KV_REST_API_URL || ""
}

export function getKvToken(): string {
  return process.env.KV_REST_API_TOKEN || ""
}

// Check if KV is configured
export function isKvConfigured(): boolean {
  return !!getKvUrl() && !!getKvToken()
}
