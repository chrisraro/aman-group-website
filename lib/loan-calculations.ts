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
  if (governmentFeesConfig.isActive && validBasePrice > 0) {
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
    if (houseConstructionCost && houseConstructionCost > 0) {
      constructionFees = houseConstructionCost * (constructionFeesConfig.houseConstructionFeeRate / 100)
    }
    if (lotPrice && lotPrice > 0) {
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
  let firstYearPayment = 0
  if (firstYearMonths > 0) {
    firstYearPayment = downPaymentAmount / numberOfPayments // Distribute principal evenly for first year
  }

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
    baseInterestRate: 8.5,
    specialRuleEnabled: true,
  }
}

interface CalculateLoanParams {
  propertyPrice: number
  lotPrice?: number
  houseConstructionPrice?: number
  propertyType: "model-house" | "lot-only"
  downPaymentPercentage: number
  loanTermYears: number
  interestRate: number
  settings: LoanCalculatorSettings
}

export function calculateLoan({
  propertyPrice,
  lotPrice = 0,
  houseConstructionPrice = 0,
  propertyType,
  downPaymentPercentage,
  loanTermYears,
  interestRate,
  settings,
}: CalculateLoanParams): LoanCalculation {
  // Calculate total price including property, lot, and construction if applicable
  let totalPrice = propertyPrice
  if (propertyType === "model-house") {
    totalPrice = propertyPrice + lotPrice + houseConstructionPrice
  }

  const downPayment = totalPrice * (downPaymentPercentage / 100)

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

  // Construction Fees - only for model houses and if enabled
  let constructionFees = 0
  if (settings.constructionFeesConfig.isActive && propertyType === "model-house") {
    if (lotPrice > 0) {
      constructionFees += (lotPrice * settings.constructionFeesConfig.lotFeeRate) / 100
    }
    if (houseConstructionPrice > 0) {
      constructionFees += (houseConstructionPrice * settings.constructionFeesConfig.houseConstructionFeeRate) / 100
    }
  }

  const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0) + constructionFees

  // Loan amount (total price minus down payment)
  const loanAmount = totalPrice - downPayment

  // Loan amortization with special rule (0% first year, then specialRuleInterestRate)
  const numberOfPayments = loanTermYears * 12
  const firstYearMonths = Math.min(12, numberOfPayments)
  const remainingMonths = numberOfPayments - firstYearMonths

  let firstYearMonthlyPayment = 0
  let subsequentYearsMonthlyPayment = 0
  let totalInterest = 0

  if (settings.specialRuleEnabled && loanTermYears > 0) {
    // First year (0% interest)
    firstYearMonthlyPayment = loanAmount / numberOfPayments // Distribute principal evenly for first year

    // Calculate remaining balance after first year's principal payments
    const principalPaidFirstYear = firstYearMonthlyPayment * firstYearMonths
    const remainingBalanceAfterFirstYear = loanAmount - principalPaidFirstYear

    // Subsequent years (with specialRuleInterestRate)
    if (remainingMonths > 0) {
      const monthlyInterestRateSubsequent = settings.specialRuleInterestRate / 100 / 12
      if (monthlyInterestRateSubsequent > 0) {
        subsequentYearsMonthlyPayment =
          (remainingBalanceAfterFirstYear *
            monthlyInterestRateSubsequent *
            Math.pow(1 + monthlyInterestRateSubsequent, remainingMonths)) /
          (Math.pow(1 + monthlyInterestRateSubsequent, remainingMonths) - 1)
      } else {
        subsequentYearsMonthlyPayment = remainingBalanceAfterFirstYear / remainingMonths
      }
      totalInterest = subsequentYearsMonthlyPayment * remainingMonths - remainingBalanceAfterFirstYear
    }
  } else {
    // Standard amortization if special rule is not enabled or loan term is 0
    const monthlyInterestRate = interestRate / 100 / 12
    if (monthlyInterestRate > 0) {
      firstYearMonthlyPayment =
        (loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments))) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
      subsequentYearsMonthlyPayment = firstYearMonthlyPayment // Same for all years
      totalInterest = firstYearMonthlyPayment * numberOfPayments - loanAmount
    } else {
      firstYearMonthlyPayment = loanAmount / numberOfPayments
      subsequentYearsMonthlyPayment = firstYearMonthlyPayment
      totalInterest = 0
    }
  }

  const totalAmount =
    firstYearMonthlyPayment * firstYearMonths + subsequentYearsMonthlyPayment * remainingMonths + totalFees

  // Reservation Fee - only if enabled and greater than 0
  let reservationFee = 0
  if (settings.reservationFees.isActive) {
    if (propertyType === "model-house" && settings.reservationFees.modelHouse > 0) {
      reservationFee = settings.reservationFees.modelHouse
    } else if (propertyType === "lot-only" && settings.reservationFees.lotOnly > 0) {
      reservationFee = settings.reservationFees.lotOnly
    }
  }

  // Government Fees - only if enabled
  let governmentFees = 0
  if (settings.governmentFeesConfig.isActive) {
    if (propertyPrice >= settings.governmentFeesConfig.fixedAmountThreshold) {
      governmentFees = settings.governmentFeesConfig.fixedAmount
    } else {
      governmentFees = (propertyPrice * settings.governmentFeesConfig.percentageRate) / 100
    }
  }

  return {
    propertyPrice: totalPrice, // Use calculated total price here
    downPaymentPercentage,
    downPayment,
    loanAmount,
    interestRate,
    loanTermYears,
    monthlyPayments: {
      firstYear: firstYearMonthlyPayment,
      subsequentYears: subsequentYearsMonthlyPayment,
    },
    totalInterest,
    totalAmount,
    reservationFee,
    governmentFees,
    constructionFees,
  }
}

export function calculateAmortizationSchedule(calculation: LoanCalculation): Array<{
  month: number
  principal: number
  interest: number
  payment: number
  balance: number
}> {
  const schedule = []
  let remainingBalance = calculation.loanAmount
  const numberOfPayments = calculation.loanTermYears * 12

  for (let i = 1; i <= numberOfPayments; i++) {
    // Determine the interest rate based on the year
    const currentYear = Math.ceil(i / 12)
    const monthlyInterestRate =
      currentYear === 1 && calculation.specialRuleApplied // Assuming specialRuleApplied means 0% first year for loan
        ? 0
        : calculation.interestRate / 100 / 12 // Use the general interest rate for subsequent years

    let currentMonthlyPayment = calculation.monthlyPayments.subsequentYears
    if (currentYear === 1) {
      currentMonthlyPayment = calculation.monthlyPayments.firstYear
    }

    const interestPayment = remainingBalance * monthlyInterestRate
    const principalPayment = currentMonthlyPayment - interestPayment
    remainingBalance -= principalPayment

    schedule.push({
      month: i,
      principal: principalPayment,
      interest: interestPayment,
      payment: currentMonthlyPayment,
      balance: Math.max(0, remainingBalance),
    })

    if (remainingBalance <= 0) break
  }

  return schedule
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-PH").format(num)
}
