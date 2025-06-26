export type FinancingOption = "in-house" | "in-house-bridge" | "pag-ibig" | "bank"
export type PaymentTerm = 5 | 10 | 15 | 20 | 25 | 30
export type DownPaymentTerm = 1 | 3 | 6 | 12 | 18 | 24 | 36 | 48 | 60
export type PropertyType = "model-house" | "lot-only"

export interface AmortizationResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  loanAmount: number
  interestRate: number
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

export interface DownPaymentScheduleItem {
  month: number
  date: Date
  payment: number
  balance: number
  cumulativePaid: number
  interestRate: number // Track interest rate for each month
  isFirstYear: boolean // Track if it's within first year
}

export interface PropertyPriceBreakdown {
  basePrice: number
  reservationFee: number
  governmentFeesAndTaxes: number
  totalAllInPrice: number
  propertyType: PropertyType
}

export interface LoanCalculatorSettings {
  id: string
  financingOptions: FinancingOptionConfig[]
  downPaymentTerms: DownPaymentTermConfig[]
  reservationFees: ReservationFeeConfig
  governmentFeesConfig: GovernmentFeesConfig
  specialDownPaymentRules: SpecialDownPaymentRules
  defaultSettings: DefaultCalculatorSettings
  createdAt: Date
  updatedAt: Date
}

export interface FinancingOptionConfig {
  id: string
  name: string
  value: FinancingOption
  description: string
  interestRates: Record<PaymentTerm, number>
  availableTerms: PaymentTerm[]
  isActive: boolean
}

export interface DownPaymentTermConfig {
  id: string
  name: string
  value: DownPaymentTerm
  description: string
  interestRate: number
  isActive: boolean
  applicableFinancing: FinancingOption[]
}

export interface ReservationFeeConfig {
  modelHouse: number
  lotOnly: number
  isActive: boolean
}

export interface GovernmentFeesConfig {
  fixedAmountThreshold: number // 1,000,000
  fixedAmount: number // 205,000
  percentageRate: number // 20.5%
  isActive: boolean
}

export interface SpecialDownPaymentRules {
  twentyPercentRule: {
    isActive: boolean
    firstYearInterestRate: number // 0%
    subsequentYearInterestRate: number // 8.5%
    applicableTerms: DownPaymentTerm[] // Terms that qualify for this rule
  }
}

export interface DefaultCalculatorSettings {
  defaultFinancingOption: FinancingOption
  defaultPaymentTerm: PaymentTerm
  defaultDownPaymentTerm: DownPaymentTerm
  defaultDownPaymentPercentage: number
  minimumDownPaymentPercentage: number
  maximumDownPaymentPercentage: number
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
