// Centralized constants for the application

// Project locations
export const PROJECT_LOCATIONS = ["Palm Village", "Parkview Naga Urban Residence"] as const

// Property interest types
export const PROPERTY_INTEREST_TYPES = ["Model House", "Ready for Occupancy", "Lot Only", "Other"] as const

// Developer colors
export const DEVELOPER_COLORS = {
  "Enjoy Realty": "#65932D",
  "Aman Engineering": "#04009D",
} as const

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
}
