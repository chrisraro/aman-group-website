export interface LoanCalculatorSettings {
  // Interest rates
  baseInterestRate: number
  specialRuleInterestRate: number

  // Fees
  processingFeePercentage: number
  appraisalFee: number
  notarialFeePercentage: number
  insuranceFeePercentage: number
  constructionFeePercentage: number // New: 8.5% for both lot and house construction

  // Special rule settings
  specialRuleEnabled: boolean

  // New fields from getDefaultLoanCalculatorSettings
  id?: string
  financingOptions?: Array<{
    id: string
    name: string
    value: string
    description: string
    interestRates: { [key: number]: number }
    availableTerms: number[]
    isActive: boolean
  }>
  reservationFees?: ReservationFeeConfig
  governmentFeesConfig?: GovernmentFeesConfig
  constructionFeesConfig?: ConstructionFeesConfig
  specialDownPaymentRules?: SpecialDownPaymentRules
  defaultSettings?: {
    defaultFinancingOption: string
    defaultPaymentTerm: number
    fixedDownPaymentPercentage: number
    fixedDownPaymentTermMonths: number
  }
  createdAt?: Date
  updatedAt?: Date
}

export interface LoanCalculation {
  propertyPrice: number
  downPaymentPercentage: number
  downPayment: number
  loanAmount: number
  interestRate: number
  loanTermYears: number
  monthlyPayment: number
  totalInterest: number
  totalAmount: number // This will be updated to reflect total cost including down payment
  reservationFee: number
  governmentFees: number
  constructionFees: number
  downPaymentSchedule: DownPaymentScheduleItem[] // Added this
}

export const DEFAULT_LOAN_CALCULATOR_SETTINGS: LoanCalculatorSettings = {
  baseInterestRate: 8.5,
  specialRuleInterestRate: 8.5,
  processingFeePercentage: 1,
  appraisalFee: 5000,
  notarialFeePercentage: 1,
  insuranceFeePercentage: 0.5,
  constructionFeePercentage: 8.5,
  specialRuleEnabled: true,
}

// Moved from lib/loan-calculations.ts
export type FinancingOption = "in-house" | "in-house-bridge" | "pag-ibig" | "bank"
export type PropertyType = "model-house" | "lot-only"
export type PaymentTerm = 5 | 10 | 15 | 20 | 25 | 30

export interface AmortizationResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  loanAmount: number
  interestRate: number
}

export interface DownPaymentScheduleItem {
  month: number
  date: Date
  payment: number
  balance: number
  cumulativePaid: number
  interestRate: number
  isFirstYear: boolean
}

export interface LoanCalculationResult {
  propertyBreakdown: PropertyPriceBreakdown
  loanAmortization: AmortizationResult
  downPaymentSchedule: DownPaymentScheduleItem[]
  totalDownPayment: number
  downPaymentMonthlyAmount: number
  totalProjectCost: number
  netLoanAmount: number
  specialRuleApplied: boolean
  downPaymentPercentage: number
}

export interface MonthlyScheduleItem {
  month: number
  date: Date
  principal: number
  interest: number
  payment: number
  balance: number
}

export interface YearlyScheduleItem {
  year: number
  principal: number
  interest: number
  payment: number
  balance: number
}

export interface PropertyPriceBreakdown {
  basePrice: number
  lotPrice?: number
  houseConstructionCost?: number
  reservationFee: number
  governmentFeesAndTaxes: number
  constructionFees?: number
  lotFees?: number
  totalAllInPrice: number
  propertyType: PropertyType
}

export interface ReservationFeeConfig {
  modelHouse: number
  lotOnly: number
  isActive: boolean
}

export interface GovernmentFeesConfig {
  fixedAmountThreshold: number
  fixedAmount: number
  percentageRate: number
  isActive: boolean
}

export interface ConstructionFeesConfig {
  houseConstructionFeeRate: number
  lotFeeRate: number
  isActive: boolean
}

export interface SpecialDownPaymentRules {
  twentyPercentRule: {
    isActive: boolean
    firstYearInterestRate: number
    subsequentYearInterestRate: number
    downPaymentTermMonths: number
  }
}

export interface LoanCalculationInput {
  propertyPrice: number
  lotPrice?: number
  constructionCost?: number
  downPaymentPercentage: number
  loanTermYears: number
  interestRate: number
  propertyType: "model-house" | "lot-only"
  settings?: LoanCalculatorSettings // Changed type here
  downPaymentTermMonths?: number // Added for dynamic down payment term
}
