import type {
  FinancingOption,
  PaymentTerm,
  DownPaymentTerm,
  AmortizationResult,
  DownPaymentScheduleItem,
  LoanCalculationResult,
  MonthlyScheduleItem,
  YearlyScheduleItem,
} from "@/types/loan-calculator"

// Financing options with their interest rates
export const FINANCING_RATES = {
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
} as const

// Down payment interest rates (for installment plans)
export const DOWN_PAYMENT_RATES = {
  1: 0, // No interest for 1 month (lump sum)
  3: 2.0, // 2% annual for 3 months
  6: 3.0, // 3% annual for 6 months
  12: 4.0, // 4% annual for 12 months
  18: 5.0, // 5% annual for 18 months
  24: 6.0, // 6% annual for 24 months
  36: 7.0, // 7% annual for 36 months
} as const

export function getInterestRate(financingOption: FinancingOption, paymentTerm: PaymentTerm): number {
  const rates = FINANCING_RATES[financingOption]
  return rates[paymentTerm as keyof typeof rates] || 8.5
}

export function getDownPaymentInterestRate(downPaymentTerm: DownPaymentTerm): number {
  return DOWN_PAYMENT_RATES[downPaymentTerm] || 0
}

export function calculateMonthlyAmortization(
  loanAmount: number,
  annualInterestRate: number,
  years: number,
): AmortizationResult {
  // Ensure we have valid numbers
  const validLoanAmount = isNaN(loanAmount) || loanAmount < 0 ? 0 : loanAmount
  const validInterestRate = isNaN(annualInterestRate) ? 0 : annualInterestRate
  const validYears = isNaN(years) || years <= 0 ? 1 : years

  const monthlyInterestRate = validInterestRate / 100 / 12
  const numberOfPayments = validYears * 12

  let monthlyPayment: number

  if (monthlyInterestRate === 0 || validLoanAmount === 0) {
    monthlyPayment = validLoanAmount / numberOfPayments
  } else {
    monthlyPayment =
      (validLoanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
  }

  if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
    monthlyPayment = 0
  }

  const totalPayment = monthlyPayment * numberOfPayments
  const totalInterest = totalPayment - validLoanAmount

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    loanAmount: validLoanAmount,
    interestRate: validInterestRate,
  }
}

export function calculateDownPaymentSchedule(
  downPaymentAmount: number,
  downPaymentTerm: DownPaymentTerm,
): DownPaymentScheduleItem[] {
  const validDownPayment = isNaN(downPaymentAmount) || downPaymentAmount < 0 ? 0 : downPaymentAmount
  const interestRate = getDownPaymentInterestRate(downPaymentTerm)

  if (downPaymentTerm === 1) {
    // Lump sum payment
    return [
      {
        month: 1,
        date: new Date(),
        payment: validDownPayment,
        balance: 0,
        cumulativePaid: validDownPayment,
      },
    ]
  }

  const monthlyInterestRate = interestRate / 100 / 12
  const numberOfPayments = downPaymentTerm

  let monthlyPayment: number

  if (monthlyInterestRate === 0) {
    monthlyPayment = validDownPayment / numberOfPayments
  } else {
    monthlyPayment =
      (validDownPayment * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
  }

  if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
    monthlyPayment = validDownPayment / numberOfPayments
  }

  let balance = validDownPayment
  let cumulativePaid = 0
  const schedule: DownPaymentScheduleItem[] = []

  for (let month = 1; month <= numberOfPayments; month++) {
    const interestPayment = balance * monthlyInterestRate
    const principalPayment = monthlyPayment - interestPayment

    balance -= principalPayment
    cumulativePaid += monthlyPayment

    schedule.push({
      month,
      date: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000),
      payment: monthlyPayment,
      balance: Math.max(0, balance),
      cumulativePaid,
    })
  }

  return schedule
}

export function calculateCompleteLoanDetails(
  propertyPrice: number,
  downPaymentAmount: number,
  downPaymentTerm: DownPaymentTerm,
  financingOption: FinancingOption,
  paymentTerm: PaymentTerm,
): LoanCalculationResult {
  const loanAmount = propertyPrice - downPaymentAmount
  const loanInterestRate = getInterestRate(financingOption, paymentTerm)

  const loanAmortization = calculateMonthlyAmortization(loanAmount, loanInterestRate, paymentTerm)
  const downPaymentSchedule = calculateDownPaymentSchedule(downPaymentAmount, downPaymentTerm)

  const totalDownPayment = downPaymentSchedule.reduce((sum, item) => sum + item.payment, 0)
  const downPaymentMonthlyAmount = downPaymentSchedule.length > 0 ? downPaymentSchedule[0].payment : 0
  const totalProjectCost = totalDownPayment + loanAmortization.totalPayment

  return {
    loanAmortization,
    downPaymentSchedule,
    totalDownPayment,
    downPaymentMonthlyAmount,
    totalProjectCost,
  }
}

export function generateLoanAmortizationSchedule(
  loanAmount: number,
  interestRate: number,
  years: number,
  monthlyPayment: number,
): MonthlyScheduleItem[] {
  const monthlyInterestRate = interestRate / 100 / 12
  const numberOfPayments = years * 12
  let balance = loanAmount
  const schedule: MonthlyScheduleItem[] = []

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

export function generateYearlyAmortizationSchedule(
  monthlySchedule: MonthlyScheduleItem[],
  years: number,
): YearlyScheduleItem[] {
  const yearlySchedule: YearlyScheduleItem[] = []

  for (let year = 1; year <= years; year++) {
    const yearStart = (year - 1) * 12
    const yearEnd = year * 12
    const yearMonths = monthlySchedule.slice(yearStart, yearEnd)

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
