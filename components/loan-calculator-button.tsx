import Link from "next/link"
import { Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LoanCalculatorButtonProps {
  modelName: string
  floorArea: string
  price: number
  lotOnlyPrice?: number
  houseConstructionPrice?: number
  returnUrl: string
  className?: string
}

export function LoanCalculatorButton({
  modelName,
  floorArea,
  price,
  lotOnlyPrice,
  houseConstructionPrice,
  returnUrl,
  className = "",
}: LoanCalculatorButtonProps) {
  // Create URL parameters
  const params = new URLSearchParams()
  params.append("model", modelName)
  params.append("area", floorArea)
  params.append("price", price.toString())
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
