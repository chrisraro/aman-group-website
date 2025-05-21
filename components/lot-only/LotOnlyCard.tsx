import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatNumberWithCommas } from "@/lib/utils/format-utils"
import type { LotOnlyProperty } from "@/data/lot-only-properties"
import { ScheduleViewingButton } from "@/components/shared/ScheduleViewingButton"
import { ArrowRight, Calendar } from "lucide-react"

interface LotOnlyCardProps {
  property: LotOnlyProperty
}

export function LotOnlyCard({ property }: LotOnlyCardProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md">
      <div className="aspect-[4/3] relative bg-muted">
        {property.imageUrl ? (
          <img
            src={property.imageUrl || "/placeholder.svg"}
            alt={property.name}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Badge
            className="text-xs font-medium"
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
          <Badge
            variant="outline"
            className="text-xs font-medium bg-white/80 backdrop-blur-sm"
            style={{ borderColor: property.developerColor, color: property.developerColor }}
          >
            {property.developer}
          </Badge>
        </div>
      </div>
      <CardContent className="flex-grow flex flex-col p-5">
        <div className="mb-3">
          <h3 className="text-lg font-semibold line-clamp-1 mb-1">{property.name}</h3>
          <p className="text-sm text-muted-foreground">{property.location}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Price</span>
            <span className="text-sm font-medium">₱{formatNumberWithCommas(property.price)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Lot Area</span>
            <span className="text-sm font-medium">{property.lotArea}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">{property.description}</p>
      </CardContent>
      <CardFooter className="p-5 pt-0 mt-auto">
        <div className="flex flex-col sm:flex-row w-full gap-3">
          <Button
            asChild
            variant="outline"
            className="w-full h-11 flex-1 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <Link href={`/lot-only/${property.id}`} className="flex items-center justify-center gap-2">
              <span className="font-medium">View Details</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <ScheduleViewingButton
            propertyName={property.name}
            propertyType="Lot Only"
            className="w-full h-11 flex-1 bg-primary hover:bg-primary/90 text-white font-medium flex items-center justify-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden xs:inline">Schedule</span>
            <span>Viewing</span>
          </ScheduleViewingButton>
        </div>
      </CardFooter>
    </Card>
  )
}
