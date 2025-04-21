export type FinancingOption = "in-house" | "in-house-bridge" | "pag-ibig" | "bank"
export type PaymentTerm = 5 | 10 | 15 | 20 | 25 | 30

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

export interface PropertyPriceBreakdown {
  lotOnlyPrice: number
  houseConstructionPrice: number
  totalPrice: number
}
