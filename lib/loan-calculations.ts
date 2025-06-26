import type {
  FinancingOption,
  PaymentTerm,
  DownPaymentTerm,
  PropertyType,
  AmortizationResult,
  DownPaymentScheduleItem,
  LoanCalculationResult,
  MonthlyScheduleItem,
  YearlyScheduleItem,
  PropertyPriceBreakdown,
  ReservationFeeConfig,
  GovernmentFeesConfig,
  SpecialDownPaymentRules,
  LoanCalculatorSettings,
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
  48: 8.0, // 8.5% annual for 48 months
  60: 8.5, // 8.5% annual for 60 months
} as const

// Default configuration values
export const DEFAULT_RESERVATION_FEES: ReservationFeeConfig = {
  modelHouse: 25000,
  lotOnly: 10000,
  isActive: true,
}

export const DEFAULT_GOVERNMENT_FEES: GovernmentFeesConfig = {
  fixedAmountThreshold: 1000000,
  fixedAmount: 205000,
  percentageRate: 20.5,
  isActive: true,
}

export const DEFAULT_SPECIAL_RULES: SpecialDownPaymentRules = {
  twentyPercentRule: {
    isActive: true,
    firstYearInterestRate: 0, // 0% for first year
    subsequentYearInterestRate: 8.5, // 8.5% for subsequent years
    applicableTerms: [12, 24, 36, 48, 60], // Terms that qualify for 20% rule
  },
}

export function getInterestRate(financingOption: FinancingOption, paymentTerm: PaymentTerm): number {
  const rates = FINANCING_RATES[financingOption]
  return rates[paymentTerm as keyof typeof rates] || 8.5
}

export function getDownPaymentInterestRate(downPaymentTerm: DownPaymentTerm): number {
  return DOWN_PAYMENT_RATES[downPaymentTerm] || 0
}

export function calculatePropertyBreakdown(
  basePrice: number,
  propertyType: PropertyType,
  reservationConfig: ReservationFeeConfig = DEFAULT_RESERVATION_FEES,
  governmentFeesConfig: GovernmentFeesConfig = DEFAULT_GOVERNMENT_FEES,
): PropertyPriceBreakdown {
  const validBasePrice = isNaN(basePrice) || basePrice < 0 ? 0 : basePrice

  // Calculate reservation fee
  const reservationFee = reservationConfig.isActive
    ? propertyType === "model-house"
      ? reservationConfig.modelHouse
      : reservationConfig.lotOnly
    : 0

  // Calculate government fees and taxes
  let governmentFeesAndTaxes = 0
  if (governmentFeesConfig.isActive) {
    if (validBasePrice >= governmentFeesConfig.fixedAmountThreshold) {
      governmentFeesAndTaxes = governmentFeesConfig.fixedAmount
    } else {
      governmentFeesAndTaxes = validBasePrice * (governmentFeesConfig.percentageRate / 100)
    }
  }

  const totalAllInPrice = validBasePrice + reservationFee + governmentFeesAndTaxes

  return {
    basePrice: validBasePrice,
    reservationFee,
    governmentFeesAndTaxes,
    totalAllInPrice,
    propertyType,
  }
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
  downPaymentPercentage: number,
  specialRules: SpecialDownPaymentRules = DEFAULT_SPECIAL_RULES,
): DownPaymentScheduleItem[] {
  const validDownPayment = isNaN(downPaymentAmount) || downPaymentAmount < 0 ? 0 : downPaymentAmount

  if (downPaymentTerm === 1) {
    // Lump sum payment
    return [
      {
        month: 1,
        date: new Date(),
        payment: validDownPayment,
        balance: 0,
        cumulativePaid: validDownPayment,
        interestRate: 0,
        isFirstYear: true,
      },
    ]
  }

  // Check if 20% rule applies
  const is20PercentRule =
    specialRules.twentyPercentRule.isActive &&
    Math.abs(downPaymentPercentage - 20) < 0.1 && // Allow for small floating point differences
    specialRules.twentyPercentRule.applicableTerms.includes(downPaymentTerm)

  let schedule: DownPaymentScheduleItem[] = []

  if (is20PercentRule) {
    // Apply special 20% rule: First year 0%, subsequent years 8.5%
    schedule = calculateSpecial20PercentSchedule(
      validDownPayment,
      downPaymentTerm,
      specialRules.twentyPercentRule.firstYearInterestRate,
      specialRules.twentyPercentRule.subsequentYearInterestRate,
    )
  } else {
    // Apply standard interest rate
    const standardRate = getDownPaymentInterestRate(downPaymentTerm)
    schedule = calculateStandardDownPaymentSchedule(validDownPayment, downPaymentTerm, standardRate)
  }

  return schedule
}

function calculateSpecial20PercentSchedule(
  downPaymentAmount: number,
  downPaymentTerm: DownPaymentTerm,
  firstYearRate: number,
  subsequentYearRate: number,
): DownPaymentScheduleItem[] {
  const schedule: DownPaymentScheduleItem[] = []
  const numberOfPayments = downPaymentTerm

  // Calculate payments for first year (0% interest)
  const firstYearMonths = Math.min(12, numberOfPayments)
  const firstYearPayment = downPaymentAmount / numberOfPayments // Equal payments, no interest

  let balance = downPaymentAmount
  let cumulativePaid = 0

  // First year payments (0% interest)
  for (let month = 1; month <= firstYearMonths; month++) {
    balance -= firstYearPayment
    cumulativePaid += firstYearPayment

    schedule.push({
      month,
      date: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000),
      payment: firstYearPayment,
      balance: Math.max(0, balance),
      cumulativePaid,
      interestRate: firstYearRate,
      isFirstYear: true,
    })
  }

  // Subsequent years (8.5% interest) if term > 12 months
  if (numberOfPayments > 12) {
    const remainingMonths = numberOfPayments - 12
    const remainingBalance = balance

    // Calculate monthly payment for remaining balance with interest
    const monthlyInterestRate = subsequentYearRate / 100 / 12
    let monthlyPayment: number

    if (monthlyInterestRate === 0) {
      monthlyPayment = remainingBalance / remainingMonths
    } else {
      monthlyPayment =
        (remainingBalance * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, remainingMonths)) /
        (Math.pow(1 + monthlyInterestRate, remainingMonths) - 1)
    }

    if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
      monthlyPayment = remainingBalance / remainingMonths
    }

    // Generate schedule for remaining months
    for (let month = 13; month <= numberOfPayments; month++) {
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
        interestRate: subsequentYearRate,
        isFirstYear: false,
      })
    }
  }

  return schedule
}

function calculateStandardDownPaymentSchedule(
  downPaymentAmount: number,
  downPaymentTerm: DownPaymentTerm,
  interestRate: number,
): DownPaymentScheduleItem[] {
  const monthlyInterestRate = interestRate / 100 / 12
  const numberOfPayments = downPaymentTerm

  let monthlyPayment: number

  if (monthlyInterestRate === 0) {
    monthlyPayment = downPaymentAmount / numberOfPayments
  } else {
    monthlyPayment =
      (downPaymentAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
  }

  if (isNaN(monthlyPayment) || !isFinite(monthlyPayment)) {
    monthlyPayment = downPaymentAmount / numberOfPayments
  }

  let balance = downPaymentAmount
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
      interestRate: interestRate,
      isFirstYear: month <= 12,
    })
  }

  return schedule
}

export function calculateCompleteLoanDetails(
  basePrice: number,
  propertyType: PropertyType,
  downPaymentAmount: number,
  downPaymentTerm: DownPaymentTerm,
  financingOption: FinancingOption,
  paymentTerm: PaymentTerm,
  reservationConfig?: ReservationFeeConfig,
  governmentFeesConfig?: GovernmentFeesConfig,
  specialRules?: SpecialDownPaymentRules,
): LoanCalculationResult {
  // Calculate property breakdown with all fees
  const propertyBreakdown = calculatePropertyBreakdown(basePrice, propertyType, reservationConfig, governmentFeesConfig)

  // Calculate down payment percentage
  const downPaymentPercentage = (downPaymentAmount / propertyBreakdown.totalAllInPrice) * 100

  // Calculate net loan amount (total price minus down payment)
  const netLoanAmount = propertyBreakdown.totalAllInPrice - downPaymentAmount
  const loanInterestRate = getInterestRate(financingOption, paymentTerm)

  // Calculate loan amortization
  const loanAmortization = calculateMonthlyAmortization(netLoanAmount, loanInterestRate, paymentTerm)

  // Calculate down payment schedule with special rules
  const downPaymentSchedule = calculateDownPaymentSchedule(
    downPaymentAmount,
    downPaymentTerm,
    downPaymentPercentage,
    specialRules,
  )

  const totalDownPayment = downPaymentSchedule.reduce((sum, item) => sum + item.payment, 0)
  const downPaymentMonthlyAmount = downPaymentSchedule.length > 0 ? downPaymentSchedule[0].payment : 0
  const totalProjectCost = totalDownPayment + loanAmortization.totalPayment

  // Check if special rule was applied
  const specialRuleApplied =
    (specialRules?.twentyPercentRule.isActive &&
      Math.abs(downPaymentPercentage - 20) < 0.1 &&
      specialRules.twentyPercentRule.applicableTerms.includes(downPaymentTerm)) ||
    false

  return {
    propertyBreakdown,
    loanAmortization,
    downPaymentSchedule,
    totalDownPayment,
    downPaymentMonthlyAmount,
    totalProjectCost,
    netLoanAmount,
    specialRuleApplied,
    downPaymentPercentage,
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

// Remove the existing saveLoanCalculatorSettings and loadLoanCalculatorSettings functions
// They are no longer needed as we're using the API and KV storage

export function getDefaultLoanCalculatorSettings(): LoanCalculatorSettings {
  return {
    id: "default",
    financingOptions: [
      {
        id: "1",
        name: "In-House Financing",
        value: "in-house",
        description: "Direct financing from Aman Group",
        interestRates: { 5: 8.5, 10: 9.5, 15: 10.5 },
        availableTerms: [5, 10, 15],
        isActive: true,
      },
      {
        id: "2",
        name: "In-House Bridge Financing",
        value: "in-house-bridge",
        description: "Bridge financing option",
        interestRates: { 5: 8.5, 10: 8.5, 15: 8.5 },
        availableTerms: [5, 10, 15],
        isActive: true,
      },
      {
        id: "3",
        name: "Pag-IBIG Financing",
        value: "pag-ibig",
        description: "Government housing loan program",
        interestRates: { 5: 6.25, 10: 6.25, 15: 6.25, 20: 6.25, 25: 6.25, 30: 6.25 },
        availableTerms: [5, 10, 15, 20, 25, 30],
        isActive: true,
      },
      {
        id: "4",
        name: "Bank Financing",
        value: "bank",
        description: "Traditional bank loan",
        interestRates: { 5: 7.5, 10: 7.5, 15: 7.5 },
        availableTerms: [5, 10, 15],
        isActive: true,
      },
    ],
    downPaymentTerms: [
      {
        id: "1",
        name: "Lump Sum",
        value: 1,
        description: "One-time payment",
        interestRate: 0,
        isActive: true,
        applicableFinancing: ["in-house", "in-house-bridge", "pag-ibig", "bank"],
      },
      {
        id: "2",
        name: "3 Months",
        value: 3,
        description: "3-month installment plan",
        interestRate: 2.0,
        isActive: true,
        applicableFinancing: ["in-house", "in-house-bridge"],
      },
      {
        id: "3",
        name: "6 Months",
        value: 6,
        description: "6-month installment plan",
        interestRate: 3.0,
        isActive: true,
        applicableFinancing: ["in-house", "in-house-bridge"],
      },
      {
        id: "4",
        name: "12 Months (Option 1)",
        value: 12,
        description: "12-month installment plan",
        interestRate: 4.0,
        isActive: true,
        applicableFinancing: ["in-house", "in-house-bridge"],
      },
      {
        id: "5",
        name: "18 Months",
        value: 18,
        description: "18-month installment plan",
        interestRate: 5.0,
        isActive: true,
        applicableFinancing: ["in-house"],
      },
      {
        id: "6",
        name: "24 Months (Option 2)",
        value: 24,
        description: "24-month installment plan",
        interestRate: 6.0,
        isActive: true,
        applicableFinancing: ["in-house"],
      },
      {
        id: "7",
        name: "36 Months (Option 2)",
        value: 36,
        description: "36-month installment plan",
        interestRate: 7.0,
        isActive: true,
        applicableFinancing: ["in-house"],
      },
      {
        id: "8",
        name: "48 Months (Option 2)",
        value: 48,
        description: "48-month installment plan",
        interestRate: 8.0,
        isActive: true,
        applicableFinancing: ["in-house"],
      },
      {
        id: "9",
        name: "60 Months (Option 2)",
        value: 60,
        description: "60-month installment plan",
        interestRate: 8.5,
        isActive: true,
        applicableFinancing: ["in-house"],
      },
    ],
    reservationFees: DEFAULT_RESERVATION_FEES,
    governmentFeesConfig: DEFAULT_GOVERNMENT_FEES,
    specialDownPaymentRules: DEFAULT_SPECIAL_RULES,
    defaultSettings: {
      defaultFinancingOption: "in-house",
      defaultPaymentTerm: 5,
      defaultDownPaymentTerm: 12,
      defaultDownPaymentPercentage: 20,
      minimumDownPaymentPercentage: 5,
      maximumDownPaymentPercentage: 50,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}
