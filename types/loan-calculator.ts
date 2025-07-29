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

  // Additional properties for enhanced functionality
  id: string
  financingOptions: FinancingOption[]
  reservationFees: ReservationFeeConfig
  governmentFeesConfig: GovernmentFeesConfig
  constructionFeesConfig: ConstructionFeesConfig
  specialDownPaymentRules: SpecialDownPaymentRules
  defaultSettings: {
    defaultFinancingOption: string
    defaultPaymentTerm: number
    fixedDownPaymentPercentage: number
    fixedDownPaymentTermMonths: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface LoanCalculation {
  propertyPrice: number
  downPayment: number
  loanAmount: number
  fees: Array<{
    name: string
    amount: number
    percentage?: number
  }>
  totalFees: number
  monthlyPayments: {
    firstYear: number
    subsequentYears: number
  }
  totalCost: number
  loanTermYears: number
  interestRate: number
  specialRuleApplied: boolean
  downPaymentPercentage: number // Added for clarity in LoanCalculation
  reservationFee: number // Added for clarity in LoanCalculation
  governmentFees: number // Added for clarity in LoanCalculation
  constructionFees: number // Added for clarity in LoanCalculation
}

export interface MonthlyScheduleItem {
  month: number
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
  interestRate: number
  isFirstYear: boolean
}

export interface FinancingOption {
  id: string
  name: string
  value: string
  description: string
  interestRates: Record<number, number>
  availableTerms: number[]
  isActive: boolean
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

export interface PropertyPriceBreakdown {
  basePrice: number
  lotPrice?: number
  houseConstructionCost?: number
  reservationFee: number
  governmentFeesAndTaxes: number
  constructionFees?: number
  lotFees?: number
  totalAllInPrice: number
  propertyType: string
}

export interface AmortizationResult {
  monthlyPayment: number
  totalPayment: number
  totalInterest: number
  loanAmount: number
  interestRate: number
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

export type FinancingOptionType = "in-house" | "in-house-bridge" | "pag-ibig" | "bank"
export type PaymentTerm = 5 | 10 | 15 | 20 | 25 | 30
export type PropertyType = "model-house" | "lot-only"

export const DEFAULT_LOAN_CALCULATOR_SETTINGS: LoanCalculatorSettings = {
  baseInterestRate: 8.5,
  specialRuleInterestRate: 8.5,
  processingFeePercentage: 1,
  appraisalFee: 5000,
  notarialFeePercentage: 1,
  insuranceFeePercentage: 0.5,
  constructionFeePercentage: 8.5,
  specialRuleEnabled: true,
  id: "default",
  financingOptions: [],
  reservationFees: { modelHouse: 25000, lotOnly: 10000, isActive: true },
  governmentFeesConfig: { fixedAmountThreshold: 1000000, fixedAmount: 205000, percentageRate: 20.5, isActive: true },
  constructionFeesConfig: { houseConstructionFeeRate: 8.5, lotFeeRate: 8.5, isActive: true },
  specialDownPaymentRules: {
    twentyPercentRule: {
      isActive: true,
      firstYearInterestRate: 0,
      subsequentYearInterestRate: 8.5,
      downPaymentTermMonths: 24,
    },
  },
  defaultSettings: {
    defaultFinancingOption: "in-house",
    defaultPaymentTerm: 15,
    fixedDownPaymentPercentage: 20,
    fixedDownPaymentTermMonths: 24,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
}
