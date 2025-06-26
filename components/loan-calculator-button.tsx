"use client"

import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

interface LoanCalculatorButtonProps {
  modelName?: string
  propertyName?: string
  propertyId?: string
  floorArea?: string
  price?: number
  propertyPrice?: number
  lotOnlyPrice?: number
  houseConstructionPrice?: number
  propertyType?: string
  returnUrl?: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  children?: ReactNode
}

export function LoanCalculatorButton({
  modelName,
  propertyName,
  propertyId,
  floorArea,
  price,
  propertyPrice,
  lotOnlyPrice,
  houseConstructionPrice,
  propertyType,
  returnUrl,
  className,
  variant = "default",
  children,
}: LoanCalculatorButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    const params = new URLSearchParams()

    // If we have a property ID, use it for dynamic fetching
    if (propertyId) {
      params.set("propertyId", propertyId)
    } else {
      // Fallback to manual parameters
      const finalPropertyType = propertyType || (lotOnlyPrice && houseConstructionPrice ? "Model House" : "Lot Only")
      const finalPrice = price || propertyPrice || 0
      const finalPropertyName = modelName || propertyName || "Property"

      params.set("propertyName", finalPropertyName)
      params.set("propertyType", finalPropertyType)
      params.set("price", finalPrice.toString())

      if (floorArea) {
        params.set("floorArea", floorArea)
      }

      if (lotOnlyPrice) {
        params.set("lotPrice", lotOnlyPrice.toString())
      }

      if (houseConstructionPrice) {
        params.set("houseConstructionCost", houseConstructionPrice.toString())
      }
    }

    if (returnUrl) {
      params.set("returnUrl", returnUrl)
    }

    router.push(`/loan-calculator?${params.toString()}`)
  }

  return (
    <Button onClick={handleClick} variant={variant} className={className}>
      <Calculator className="h-4 w-4 mr-2" />
      {children || "Calculate Loan"}
    </Button>
  )
}

export default LoanCalculatorButton
