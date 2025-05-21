import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatNumberWithCommas } from "@/lib/utils/format-utils"
import type { LotOnlyProperty } from "@/data/lot-only-properties"
import ScheduleViewingButton from "@/components/shared/ScheduleViewingButton"

interface LotOnlyCardProps {
  property: LotOnlyProperty
}

export function LotOnlyCard({ property }: LotOnlyCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="relative h-48">
        <Image
          src={property.imageUrl || `/placeholder.svg?height=300&width=400&text=${property.name}`}
          alt={property.name}
          fill
          className="object-cover"
        />
        <Badge className="absolute top-2 right-2" style={{ backgroundColor: property.developerColor }}>
          {property.developer}
        </Badge>
      </div>
      <CardContent className="p-6 flex-grow flex flex-col">
        <h3 className="text-2xl font-bold mb-2 line-clamp-1">{property.name}</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-sm font-medium">{property.lotArea}</p>
            <p className="text-xs text-muted-foreground">Lot Area</p>
          </div>
          <div>
            <p className="text-sm font-medium">₱{formatNumberWithCommas(property.price)}</p>
            <p className="text-xs text-muted-foreground">Price</p>
          </div>
        </div>
        <p className="text-muted-foreground mb-6 line-clamp-3 flex-grow">{property.description}</p>
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <Link href={`/lot-only/${property.id}`}>
            <Button
              className="w-full text-xs sm:text-sm whitespace-nowrap"
              style={{ backgroundColor: property.developerColor, borderColor: property.developerColor }}
            >
              View Details
            </Button>
          </Link>
          <ScheduleViewingButton
            propertyName={property.name}
            propertyLocation={property.location}
            className="w-full text-xs sm:text-sm whitespace-nowrap"
            variant="outline"
          />
        </div>
      </CardContent>
    </Card>
  )
}
