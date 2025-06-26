import type {
  FinancingOption,
  PaymentTerm,
  PropertyType,
  AmortizationResult,
  DownPaymentScheduleItem,
  LoanCalculationResult,
  MonthlyScheduleItem,
  YearlyScheduleItem,
  PropertyPriceBreakdown,
  ReservationFeeConfig,
  GovernmentFeesConfig,
  ConstructionFeesConfig,
  SpecialDownPaymentRules,
  LoanCalculatorSettings,
  LoanCalculation,
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

export const DEFAULT_CONSTRUCTION_FEES: ConstructionFeesConfig = {
  houseConstructionFeeRate: 8.5,
  lotFeeRate: 8.5,
  isActive: true,
}

export const DEFAULT_SPECIAL_RULES: SpecialDownPaymentRules = {
  twentyPercentRule: {
    isActive: true,
    firstYearInterestRate: 0, // 0% for first year
    subsequentYearInterestRate: 8.5, // 8.5% for subsequent years
    downPaymentTermMonths: 24, // Fixed to 24 months
  },
}

export function getInterestRate(financingOption: FinancingOption, paymentTerm: PaymentTerm): number {
  const rates = FINANCING_RATES[financingOption]
  return rates[paymentTerm as keyof typeof rates] || 8.5
}

export function calculatePropertyBreakdown(
  basePrice: number,
  propertyType: PropertyType,
  lotPrice?: number,
  houseConstructionCost?: number,
  reservationConfig: ReservationFeeConfig = DEFAULT_RESERVATION_FEES,
  governmentFeesConfig: GovernmentFeesConfig = DEFAULT_GOVERNMENT_FEES,
  constructionFeesConfig: ConstructionFeesConfig = DEFAULT_CONSTRUCTION_FEES,
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

  // Calculate construction fees (only for model houses)
  let constructionFees = 0
  let lotFees = 0
  if (propertyType === "model-house" && constructionFeesConfig.isActive) {
    if (houseConstructionCost) {
      constructionFees = houseConstructionCost * (constructionFeesConfig.houseConstructionFeeRate / 100)
    }
    if (lotPrice) {
      lotFees = lotPrice * (constructionFeesConfig.lotFeeRate / 100)
    }
  }

  const totalAllInPrice = validBasePrice + reservationFee + governmentFeesAndTaxes + constructionFees + lotFees

  return {
    basePrice: validBasePrice,
    lotPrice: propertyType === "model-house" ? lotPrice : undefined,
    houseConstructionCost: propertyType === "model-house" ? houseConstructionCost : undefined,
    reservationFee,
    governmentFeesAndTaxes,
    constructionFees: propertyType === "model-house" ? constructionFees : undefined,
    lotFees: propertyType === "model-house" ? lotFees : undefined,
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
  specialRules: SpecialDownPaymentRules = DEFAULT_SPECIAL_RULES,
): DownPaymentScheduleItem[] {
  const validDownPayment = isNaN(downPaymentAmount) || downPaymentAmount < 0 ? 0 : downPaymentAmount
  const downPaymentTermMonths = specialRules.twentyPercentRule.downPaymentTermMonths

  // Always apply special 20% rule since down payment is fixed at 20%
  const schedule = calculateSpecial20PercentSchedule(
    validDownPayment,
    downPaymentTermMonths,
    specialRules.twentyPercentRule.firstYearInterestRate,
    specialRules.twentyPercentRule.subsequentYearInterestRate,
  )

  return schedule
}

function calculateSpecial20PercentSchedule(
  downPaymentAmount: number,
  downPaymentTermMonths: number,
  firstYearRate: number,
  subsequentYearRate: number,
): DownPaymentScheduleItem[] {
  const schedule: DownPaymentScheduleItem[] = []
  const numberOfPayments = downPaymentTermMonths

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

export function calculateCompleteLoanDetails(
  basePrice: number,
  propertyType: PropertyType,
  lotPrice: number | undefined,
  houseConstructionCost: number | undefined,
  financingOption: FinancingOption,
  paymentTerm: PaymentTerm,
  reservationConfig?: ReservationFeeConfig,
  governmentFeesConfig?: GovernmentFeesConfig,
  constructionFeesConfig?: ConstructionFeesConfig,
  specialRules?: SpecialDownPaymentRules,
): LoanCalculationResult {
  // Calculate property breakdown with all fees
  const propertyBreakdown = calculatePropertyBreakdown(
    basePrice,
    propertyType,
    lotPrice,
    houseConstructionCost,
    reservationConfig,
    governmentFeesConfig,
    constructionFeesConfig,
  )

  // Fixed 20% down payment
  const downPaymentPercentage = 20
  const downPaymentAmount = propertyBreakdown.totalAllInPrice * 0.2

  // Calculate net loan amount (total price minus down payment)
  const netLoanAmount = propertyBreakdown.totalAllInPrice - downPaymentAmount
  const loanInterestRate = getInterestRate(financingOption, paymentTerm)

  // Calculate loan amortization
  const loanAmortization = calculateMonthlyAmortization(netLoanAmount, loanInterestRate, paymentTerm)

  // Calculate down payment schedule with special rules (always applied since it's always 20%)
  const downPaymentSchedule = calculateDownPaymentSchedule(downPaymentAmount, specialRules)

  const totalDownPayment = downPaymentSchedule.reduce((sum, item) => sum + item.payment, 0)
  const downPaymentMonthlyAmount = downPaymentSchedule.length > 0 ? downPaymentSchedule[0].payment : 0
  const totalProjectCost = totalDownPayment + loanAmortization.totalPayment

  // Special rule is always applied since down payment is always 20%
  const specialRuleApplied = true

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
    reservationFees: DEFAULT_RESERVATION_FEES,
    governmentFeesConfig: DEFAULT_GOVERNMENT_FEES,
    constructionFeesConfig: DEFAULT_CONSTRUCTION_FEES,
    specialDownPaymentRules: DEFAULT_SPECIAL_RULES,
    defaultSettings: {
      defaultFinancingOption: "in-house",
      defaultPaymentTerm: 5,
      fixedDownPaymentPercentage: 20,
      fixedDownPaymentTermMonths: 24,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    processingFeePercentage: 2,
    appraisalFee: 5000,
    notarialFeePercentage: 1,
    insuranceFeePercentage: 0.5,
    constructionFeePercentage: 8.5,
    specialRuleInterestRate: 8.5,
  }
}

interface CalculateLoanParams {
  totalPrice: number
  lotOnlyPrice?: number
  houseConstructionPrice?: number
  propertyType: "Model House" | "Lot Only"
  loanTermYears: number
  settings: LoanCalculatorSettings
}

export function calculateLoan({
  totalPrice,
  lotOnlyPrice = 0,
  houseConstructionPrice = 0,
  propertyType,
  loanTermYears,
  settings,
}: CalculateLoanParams): LoanCalculation {
  // Fixed 20% down payment
  const downPaymentPercentage = 0.2
  const downPayment = totalPrice * downPaymentPercentage

  // Calculate fees
  const fees: Array<{ name: string; amount: number; percentage?: number }> = []

  // Processing fee
  const processingFee = totalPrice * (settings.processingFeePercentage / 100)
  fees.push({
    name: "Processing Fee",
    amount: processingFee,
    percentage: settings.processingFeePercentage,
  })

  // Appraisal fee
  fees.push({
    name: "Appraisal Fee",
    amount: settings.appraisalFee,
  })

  // Notarial fee
  const notarialFee = totalPrice * (settings.notarialFeePercentage / 100)
  fees.push({
    name: "Notarial Fee",
    amount: notarialFee,
    percentage: settings.notarialFeePercentage,
  })

  // Insurance fee
  const insuranceFee = totalPrice * (settings.insuranceFeePercentage / 100)
  fees.push({
    name: "Insurance Fee",
    amount: insuranceFee,
    percentage: settings.insuranceFeePercentage,
  })

  // Model House specific fees (17% total)
  if (propertyType === "Model House" && lotOnlyPrice > 0 && houseConstructionPrice > 0) {
    // 8.5% of lot price
    const lotFee = lotOnlyPrice * (settings.constructionFeePercentage / 100)
    fees.push({
      name: "Lot Development Fee",
      amount: lotFee,
      percentage: settings.constructionFeePercentage,
    })

    // 8.5% of house construction cost
    const houseFee = houseConstructionPrice * (settings.constructionFeePercentage / 100)
    fees.push({
      name: "House Construction Fee",
      amount: houseFee,
      percentage: settings.constructionFeePercentage,
    })
  }

  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0)

  // Loan amount (total price minus down payment)
  const loanAmount = totalPrice - downPayment

  // Special rule: Always applied since down payment is always 20%
  // First year: 0% interest
  // Second year onwards: 8.5% per annum

  const monthlyLoanAmount = loanAmount / (loanTermYears * 12)
  const monthlyInterestRate = settings.specialRuleInterestRate / 100 / 12

  // First year payment (no interest)
  const firstYearMonthlyPayment = monthlyLoanAmount

  // Calculate remaining balance after first year
  const remainingBalance = loanAmount - firstYearMonthlyPayment * 12
  const remainingTermMonths = (loanTermYears - 1) * 12

  // Subsequent years payment (with 8.5% interest)
  let subsequentYearsMonthlyPayment = 0
  if (remainingTermMonths > 0 && monthlyInterestRate > 0) {
    subsequentYearsMonthlyPayment =
      (remainingBalance * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, remainingTermMonths)) /
      (Math.pow(1 + monthlyInterestRate, remainingTermMonths) - 1)
  } else if (remainingTermMonths > 0) {
    subsequentYearsMonthlyPayment = remainingBalance / remainingTermMonths
  }

  // Total cost calculation
  const totalInterest = subsequentYearsMonthlyPayment * remainingTermMonths - remainingBalance
  const totalCost = totalPrice + totalFees + totalInterest

  return {
    totalPrice,
    downPayment,
    loanAmount,
    fees,
    totalFees,
    monthlyPayments: {
      firstYear: firstYearMonthlyPayment,
      subsequentYears: subsequentYearsMonthlyPayment,
    },
    totalCost,
    loanTermYears,
    interestRate: settings.specialRuleInterestRate,
    specialRuleApplied: true,
  }
}
