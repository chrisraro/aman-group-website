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
}

export interface LoanCalculation {
  totalPrice: number
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
