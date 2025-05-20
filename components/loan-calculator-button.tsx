import Link from "next/link"
import { Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LoanCalculatorButtonProps {
  modelName?: string
  floorArea?: string
  price?: number
  lotOnlyPrice?: number
  houseConstructionPrice?: number
  returnUrl?: string
  className?: string
  propertyPrice?: number
}

function LoanCalculatorButton({
  modelName = "Property",
  floorArea = "N/A",
  price,
  lotOnlyPrice,
  houseConstructionPrice,
  returnUrl = "/",
  className = "",
  propertyPrice,
}: LoanCalculatorButtonProps) {
  // Use propertyPrice as a fallback if price is undefined
  const finalPrice = price || propertyPrice || 0

  // Create URL parameters
  const params = new URLSearchParams()
  params.append("model", modelName)
  params.append("area", floorArea)
  params.append("price", finalPrice.toString())
  params.append("returnUrl", returnUrl)

  const href = `/loan-calculator?${params.toString()}`

  return (
    <Link href={href} className={cn("block", className)}>
      <Button className="w-full bg-[#65932D] hover:bg-[#65932D]/90">
        <Calculator className="mr-2 h-4 w-4" /> Loan Sample Computation
      </Button>
    </Link>
  )
}

// Add both named and default exports
export { LoanCalculatorButton }
export default LoanCalculatorButton
