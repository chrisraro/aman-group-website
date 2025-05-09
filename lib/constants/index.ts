/**
 * Centralized constants for the Aman Group application
 */

// Project locations
export const PROJECT_LOCATIONS = ["Palm Village", "Parkview Naga Urban Residence"] as const

export type ProjectLocation = (typeof PROJECT_LOCATIONS)[number]

// Property interest types
export const PROPERTY_INTEREST_TYPES = ["Model House", "Ready for Occupancy", "Lot Only", "Other"] as const

export type PropertyInterestType = (typeof PROPERTY_INTEREST_TYPES)[number]

// Developer colors
export const DEVELOPER_COLORS = {
  "Enjoy Realty": {
    primary: "#65932D",
    secondary: "#FFE400",
  },
  "Aman Engineering": {
    primary: "#04009D",
    secondary: "#FE0000",
  },
} as const

export type Developer = keyof typeof DEVELOPER_COLORS

// API endpoints
export const API_ENDPOINTS = {
  modelHouses: "/api/model-houses",
  rfoUnits: "/api/rfo-units",
  projects: "/api/projects",
  contact: "/api/contact",
  calendar: "/api/calendar",
}

// Form validation messages
export const VALIDATION_MESSAGES = {
  required: "This field is required",
  email: "Please enter a valid email address",
  phone: "Please enter a valid phone number",
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be at most ${max} characters`,
}

// Loan calculator constants
export const LOAN_CALCULATOR = {
  defaultPrice: 4707475,
  defaultDownPaymentPercentage: 20,
  downPaymentOptions: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
  loanTermYears: [5, 10, 15, 20, 25, 30],
  defaultInterestRate: 6.5,
}

// PWA constants
export const PWA = {
  appName: "Aman Group",
  cacheVersion: "v1",
  themeColor: "#65932D",
}

// Offline constants
export const OFFLINE = {
  dbName: "AmanGroupOfflineDB",
  dbVersion: 1,
  stores: {
    contactForms: "contactForms",
    viewingRequests: "viewingRequests",
  },
}

// Brokerage constants
export const BROKERAGE = {
  storageKey: "aman-group-brokerage-info",
  referralValidityDays: 15,
}
