import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { ModelHouseSeries } from "@/lib/hooks/useModelHouses"
import ScheduleViewingButton from "@/components/shared/ScheduleViewingButton"

interface ModelHouseCardProps {
  series: ModelHouseSeries
}

export function ModelHouseCard({ series }: ModelHouseCardProps) {
  const isEnjoyRealty = series.developer === "Enjoy Realty"
  const developerColor = isEnjoyRealty ? "#65932D" : "#04009D"

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48">
        <Image
          src={series.imageUrl || `/placeholder.svg?height=300&width=400&text=${series.name}`}
          alt={series.name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-6">
        <h3 className="text-2xl font-bold mb-2">{series.name}</h3>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-sm font-medium">{series.loftReady ? "Yes" : "No"}</p>
            <p className="text-xs text-muted-foreground">Loft Ready</p>
          </div>
          <div>
            <p className="text-sm font-medium">{series.floorArea}</p>
            <p className="text-xs text-muted-foreground">Floor Area</p>
          </div>
        </div>
        <p className="text-muted-foreground mb-6 line-clamp-3">{series.description}</p>
        <div className="grid grid-cols-2 gap-2">
          <Link href={`/model-houses/${series.id}`}>
            <Button className="w-full" style={{ backgroundColor: developerColor, borderColor: developerColor }}>
              View Units
            </Button>
          </Link>
          <ScheduleViewingButton
            propertyName={series.name}
            propertyLocation={series.project}
            className="w-full"
            variant="outline"
          />
        </div>
      </CardContent>
    </Card>
  )
}
