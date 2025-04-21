/**
 * Utility functions for accessing environment variables with fallbacks
 */

// Google Calendar related environment variables
export const getGoogleCalendarId = () => process.env.GOOGLE_CALENDAR_ID || "marketing.erdc@gmail.com"
export const getGoogleApiKey = () => process.env.GOOGLE_API_KEY || ""
export const getGoogleCalendarApiEndpoint = () =>
  process.env.GOOGLE_CALENDAR_API_ENDPOINT || "https://www.googleapis.com/calendar/v3/calendars"
export const getGoogleCalendarUrl = () =>
  process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_URL ||
  "https://calendar.google.com/calendar/embed?src=marketing.erdc%40gmail.com&ctz=Asia%2FManila"
export const getGoogleDriveEmbedUrl = () =>
  process.env.NEXT_PUBLIC_GOOGLE_DRIVE_EMBED_URL || "https://drive.google.com/file/d/"

// Formspree related environment variables
export const getFormspreeFormId = () => process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID || ""

// iCal URL
export const getICalUrl = () =>
  process.env.NEXT_PUBLIC_ICAL_URL ||
  "https://calendar.google.com/calendar/ical/marketing.erdc%40gmail.com/public/basic.ics"
