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
  LoanCalculationInput,
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

export function calculateLoan(input: LoanCalculationInput): LoanCalculation {
  // Use the provided settings, or fall back to a default structure if not provided
  const effectiveSettings: LoanCalculatorSettings = input.settings || getDefaultLoanCalculatorSettings()

  const {
    propertyPrice,
    lotPrice = 0,
    constructionCost = 0,
    downPaymentPercentage,
    loanTermYears,
    interestRate,
    propertyType,
    downPaymentTermMonths: selectedDownPaymentTermMonths, // New parameter for DP term
  } = input

  // Extract relevant settings for fees
  const reservationFeeModelHouse = effectiveSettings.reservationFees?.modelHouse ?? DEFAULT_RESERVATION_FEES.modelHouse
  const reservationFeeLotOnly = effectiveSettings.reservationFees?.lotOnly ?? DEFAULT_RESERVATION_FEES.lotOnly
  const enableReservationFee = effectiveSettings.reservationFees?.isActive ?? DEFAULT_RESERVATION_FEES.isActive

  const governmentFeeThreshold =
    effectiveSettings.governmentFeesConfig?.fixedAmountThreshold ?? DEFAULT_GOVERNMENT_FEES.fixedAmountThreshold
  const governmentFeeFixed = effectiveSettings.governmentFeesConfig?.fixedAmount ?? DEFAULT_GOVERNMENT_FEES.fixedAmount
  const governmentFeePercentage =
    effectiveSettings.governmentFeesConfig?.percentageRate ?? DEFAULT_GOVERNMENT_FEES.percentageRate
  const enableGovernmentFee = effectiveSettings.governmentFeesConfig?.isActive ?? DEFAULT_GOVERNMENT_FEES.isActive

  const constructionFeePercentage =
    effectiveSettings.constructionFeesConfig?.houseConstructionFeeRate ??
    DEFAULT_CONSTRUCTION_FEES.houseConstructionFeeRate
  const enableConstructionFee = effectiveSettings.constructionFeesConfig?.isActive ?? DEFAULT_CONSTRUCTION_FEES.isActive

  const specialDownPaymentRules = effectiveSettings.specialDownPaymentRules ?? DEFAULT_SPECIAL_RULES

  // Calculate fees first, as reservation fee affects down payment schedule
  let reservationFee = 0
  if (enableReservationFee) {
    if (propertyType === "model-house" && reservationFeeModelHouse > 0) {
      reservationFee = reservationFeeModelHouse
    } else if (propertyType === "lot-only" && reservationFeeLotOnly > 0) {
      reservationFee = reservationFeeLotOnly
    }
  }

  let governmentFees = 0
  if (enableGovernmentFee) {
    if (propertyPrice >= governmentFeeThreshold) {
      governmentFees = governmentFeeFixed
    } else {
      governmentFees = (propertyPrice * governmentFeePercentage) / 100
    }
  }

  let constructionFees = 0
  if (enableConstructionFee && propertyType === "model-house") {
    if (lotPrice > 0) {
      constructionFees += (lotPrice * constructionFeePercentage) / 100
    }
    if (constructionCost > 0) {
      constructionFees += (constructionCost * constructionFeePercentage) / 100
    }
  }

  const totalFees = reservationFee + governmentFees + constructionFees

  // Basic loan calculations
  const downPayment = (propertyPrice * downPaymentPercentage) / 100
  const loanAmount = propertyPrice - downPayment // Loan amount is based on full 20% down payment

  // Monthly interest rate for the main loan
  const monthlyRate = interestRate / 100 / 12
  const numberOfPayments = loanTermYears * 12

  // Monthly payment calculation using PMT formula for the main loan
  let monthlyPayment = 0
  if (monthlyRate > 0) {
    monthlyPayment =
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  } else {
    monthlyPayment = loanAmount / numberOfPayments
  }

  const totalPayable = monthlyPayment * numberOfPayments // Total principal + interest for the loan
  const totalInterest = totalPayable - loanAmount // Total interest for the loan

  // Calculate down payment schedule
  // The amount to be paid in installments for the down payment is the total down payment
  // minus the reservation fee (as it's paid upfront and reduces the installment amount).
  const amountForDownPaymentSchedule = Math.max(0, downPayment - reservationFee)

  // Use the selected down payment term, or fallback to default from settings
  const dpTermMonths =
    selectedDownPaymentTermMonths ||
    effectiveSettings.defaultSettings?.fixedDownPaymentTermMonths ||
    DEFAULT_SPECIAL_RULES.twentyPercentRule.downPaymentTermMonths

  const downPaymentSchedule = calculateDownPaymentSchedule(amountForDownPaymentSchedule, {
    twentyPercentRule: {
      ...specialDownPaymentRules.twentyPercentRule, // Keep other rules from settings
      downPaymentTermMonths: dpTermMonths, // Use the dynamic term
    },
  })

  // Total amount should include property price (which covers down payment and loan principal), total interest, and total fees
  const totalAmount = propertyPrice + totalInterest + totalFees // This is the total project cost

  return {
    propertyPrice,
    downPaymentPercentage,
    downPayment, // This is the full 20%
    loanAmount,
    interestRate,
    loanTermYears,
    monthlyPayment,
    totalInterest,
    totalAmount, // Total project cost
    reservationFee,
    governmentFees,
    constructionFees,
    downPaymentSchedule,
  }
}

export function calculateAmortizationSchedule(calculation: LoanCalculation): Array<{
  payment: number
  principal: number
  interest: number
  balance: number
}> {
  const schedule = []
  let remainingBalance = calculation.loanAmount
  const monthlyInterestRate = calculation.interestRate / 100 / 12

  for (let i = 1; i <= calculation.loanTermYears * 12; i++) {
    const interestPayment = remainingBalance * monthlyInterestRate
    const principalPayment = calculation.monthlyPayment - interestPayment
    remainingBalance -= principalPayment

    schedule.push({
      payment: i,
      principal: principalPayment,
      interest: interestPayment,
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
