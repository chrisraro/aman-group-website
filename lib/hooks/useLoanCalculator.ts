"use client"

import { useState } from "react"
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

export function useLoanCalculator() {
  const [result, setResult] = useState<AmortizationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  // Get the interest rate for a specific financing option and payment term
  const getInterestRate = (financingOption: FinancingOption, paymentTerm: PaymentTerm): number => {
    const rates = FINANCING_RATES[financingOption]
    return rates[paymentTerm as keyof typeof rates] || 8.5
  }

  // Calculate monthly amortization details
  const calculateMonthlyAmortization = (
    loanAmount: number,
    annualInterestRate: number,
    years: number,
  ): AmortizationResult => {
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

  // Calculate loan details
  const calculateLoan = (
    propertyPrice: number,
    downPayment: number,
    financingOption: FinancingOption,
    paymentTerm: PaymentTerm,
  ) => {
    setIsCalculating(true)

    try {
      const loanAmount = propertyPrice - downPayment
      const interestRate = getInterestRate(financingOption, paymentTerm)
      const calculationResult = calculateMonthlyAmortization(loanAmount, interestRate, paymentTerm)

      setResult(calculationResult)
      return calculationResult
    } catch (error) {
      console.error("Error calculating loan:", error)
      return null
    } finally {
      setIsCalculating(false)
    }
  }

  // Generate amortization schedule
  const generateAmortizationSchedule = (
    loanAmount: number,
    interestRate: number,
    years: number,
    monthlyPayment: number,
  ) => {
    const monthlyInterestRate = interestRate / 100 / 12
    const numberOfPayments = years * 12
    let balance = loanAmount
    const schedule = []

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = balance * monthlyInterestRate
      const principalPayment = monthlyPayment - interestPayment
      balance -= principalPayment

      schedule.push({
        month,
        date: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000),
        principal: principalPayment,
        interest: interestPayment,
        payment: monthlyPayment,
        balance: Math.max(0, balance),
      })
    }

    return schedule
  }

  // Generate yearly amortization schedule
  const generateYearlyAmortizationSchedule = (
    loanAmount: number,
    interestRate: number,
    years: number,
    monthlyPayment: number,
  ) => {
    const monthlySchedule = generateAmortizationSchedule(loanAmount, interestRate, years, monthlyPayment)

    const yearlySchedule = []

    for (let year = 1; year <= years; year++) {
      const yearStart = (year - 1) * 12
      const yearEnd = year * 12
      const yearMonths = monthlySchedule.slice(yearStart, yearEnd)

      // Skip if there are no months in this year
      if (yearMonths.length === 0) continue

      const totalPrincipal = yearMonths.reduce((sum, month) => sum + month.principal, 0)
      const totalInterest = yearMonths.reduce((sum, month) => sum + month.interest, 0)
      const totalPayment = yearMonths.reduce((sum, month) => sum + month.payment, 0)
      const balance = yearMonths[yearMonths.length - 1]?.balance || 0

      yearlySchedule.push({
        year,
        principal: totalPrincipal,
        interest: totalInterest,
        payment: totalPayment,
        balance,
      })
    }

    return yearlySchedule
  }

  return {
    result,
    isCalculating,
    calculateLoan,
    generateAmortizationSchedule,
    generateYearlyAmortizationSchedule,
    getInterestRate,
  }
}
