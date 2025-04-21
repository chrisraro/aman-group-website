import type { FinancingOption, PaymentTerm, AmortizationResult } from "@/types/loan-calculator"

// Financing options with their interest rates
const FINANCING_RATES = {
  "in-house": {
    5: 8.5,
    10: 9.5,
    15: 10.5,
  },
  "in-house-bridge": {
    5: 8.5,
    10: 8.5,
    15: 8.5,
  },
  "pag-ibig": {
    5: 6.25,
    10: 6.25,
    15: 6.25,
    20: 6.25,
    25: 6.25,
    30: 6.25,
  },
  bank: {
    5: 7.5,
    10: 7.5,
    15: 7.5,
  },
}

/**
 * Get the interest rate for a specific financing option and payment term
 */
export function getInterestRate(financingOption: FinancingOption, paymentTerm: PaymentTerm): number {
  const rates = FINANCING_RATES[financingOption]
  return rates[paymentTerm as keyof typeof rates] || 8.5
}

/**
 * Calculate monthly amortization details based on loan amount, interest rate, and term
 */
export function calculateMonthlyAmortization(
  loanAmount: number,
  annualInterestRate: number,
  years: number,
): AmortizationResult {
  const monthlyInterestRate = annualInterestRate / 100 / 12
  const numberOfPayments = years * 12

  let monthlyPayment: number

  if (monthlyInterestRate === 0) {
    // If interest rate is 0, simply divide principal by number of payments
    monthlyPayment = loanAmount / numberOfPayments
  } else {
    monthlyPayment =
      (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
  }

  const totalPayment = monthlyPayment * numberOfPayments
  const totalInterest = totalPayment - loanAmount

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    loanAmount,
    interestRate: annualInterestRate,
  }
}
