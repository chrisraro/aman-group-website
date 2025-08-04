/**
 * Format a number as currency (PHP)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a date
 */
export function formatDate(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date)
  }
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date)
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Generate a slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Format a number to two decimal places
 */
export function formatToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100
}

/**
 * Format a number with commas (e.g., 1,000,000)
 */
export function formatNumberWithCommas(value: number | undefined): string {
  if (value === undefined || isNaN(value)) return "0"
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 })
}

/**
 * Format a number as a percentage
 */
export function formatPercentage(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value / 100) // Assuming value is like 5 for 5%
}
