export type FinancingOption = "in-house" | "in-house-bridge" | "pag-ibig" | "bank"
export type PaymentTerm = 5 | 10 | 15 | 20 | 25 | 30
export type DownPaymentTerm = 1 | 3 | 6 | 12 | 18 | 24 | 36

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
}

export interface PropertyPriceBreakdown {
  lotOnlyPrice: number
  houseConstructionPrice: number
  totalPrice: number
}

export interface LoanCalculatorSettings {
  id: string
  financingOptions: FinancingOptionConfig[]
  downPaymentTerms: DownPaymentTermConfig[]
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

export interface DefaultCalculatorSettings {
  defaultFinancingOption: FinancingOption
  defaultPaymentTerm: PaymentTerm
  defaultDownPaymentTerm: DownPaymentTerm
  defaultDownPaymentPercentage: number
  minimumDownPaymentPercentage: number
  maximumDownPaymentPercentage: number
}

export interface LoanCalculationResult {
  loanAmortization: AmortizationResult
  downPaymentSchedule: DownPaymentScheduleItem[]
  totalDownPayment: number
  downPaymentMonthlyAmount: number
  totalProjectCost: number
}
