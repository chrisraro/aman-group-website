import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Calculator } from "lucide-react"
import { LoanCalculatorButton } from "@/components/loan-calculator-button"
import ScheduleViewingButton from "@/components/schedule-viewing-button"
import type { LotOnlyProperty } from "@/lib/hooks/useLotOnlyProperties"

interface LotOnlyCardProps {
  property: LotOnlyProperty
}

export function LotOnlyCard({ property }: LotOnlyCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <Image
          src={property.imageUrl || `/placeholder.svg?height=300&width=400&text=${property.name}`}
          alt={property.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <Badge
            className="text-xs"
            style={{
              backgroundColor:
                property.status === "Available"
                  ? "rgb(22, 163, 74)"
                  : property.status === "Reserved"
                    ? "rgb(234, 88, 12)"
                    : "rgb(220, 38, 38)",
              color: "white",
            }}
          >
            {property.status}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-bold mb-2 line-clamp-1">{property.name}</h3>
        <div className="flex items-center gap-1 mb-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="line-clamp-1">{property.location}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div>
            <span className="font-medium">₱{property.price.toLocaleString()}</span>
            <p className="text-xs text-muted-foreground">Total Price</p>
          </div>
          <div>
            <span className="font-medium">{property.lotArea}</span>
            <p className="text-xs text-muted-foreground">Lot Area</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{property.description}</p>
        <div className="grid grid-cols-1 gap-2">
          <Link href={`/lot-only/${property.id}`} className="w-full">
            <Button
              className="w-full"
              style={{
                backgroundColor: property.developerColor,
                borderColor: property.developerColor,
              }}
            >
              View Details
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <ScheduleViewingButton
              propertyName={property.name}
              propertyLocation={property.location}
              className="w-full text-xs"
              variant="outline"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Schedule
            </ScheduleViewingButton>
            <LoanCalculatorButton
              propertyName={property.name}
              propertyPrice={property.price}
              propertyType="Lot Only"
              returnUrl={`/lot-only/${property.id}`}
              className="w-full text-xs"
              variant="outline"
            >
              <Calculator className="h-3 w-3 mr-1" />
              Calculate
            </LoanCalculatorButton>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
