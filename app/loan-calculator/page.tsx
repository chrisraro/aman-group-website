import { LoanCalculatorForm } from "@/components/loan-calculator-form"
import { LoanCalculatorNote } from "@/components/loan-calculator-note"

export default function LoanCalculatorPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const modelPrice = searchParams.price ? Number(searchParams.price) : undefined
  const modelName = searchParams.model ? String(searchParams.model) : undefined
  const returnUrl = searchParams.returnUrl ? String(searchParams.returnUrl) : "/model-houses"

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Loan Sample Computation and Estimate</h1>
          <p className="text-muted-foreground">
            {modelName
              ? `Calculate monthly amortization for ${modelName}`
              : "Calculate your monthly amortization based on different financing options"}
          </p>
        </div>
        <LoanCalculatorForm initialPrice={modelPrice} returnUrl={returnUrl} modelName={modelName} />
        <LoanCalculatorNote />
      </div>
    </div>
  )
}
