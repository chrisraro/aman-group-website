import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import type { ModelHouseSeries } from "@/lib/hooks/useModelHouses"

interface ModelHouseUnitListProps {
  series: ModelHouseSeries
}

export function ModelHouseUnitList({ series }: ModelHouseUnitListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {series.units.map((unit) => {
        // Create query parameters for the unit contact form
        const unitContactQueryParams = new URLSearchParams({
          propertyInterest: unit.isRFO ? "Ready for Occupancy" : "Model House",
          modelHousesSeries: series.id,
          projectLocation: series.project,
          unitId: unit.id,
        }).toString()

        return (
          <div
            key={unit.id}
            className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={unit.imageUrl || `/placeholder.svg?height=300&width=400&text=${series.name}+${unit.name}`}
                alt={`${series.name} ${unit.name}`}
                fill
                className="object-cover"
              />
              {unit.isRFO && (
                <div
                  className={`absolute top-0 right-0 px-3 py-1 font-semibold text-white ${
                    unit.status === "Fully Constructed" ? "bg-[#65932D]" : "bg-[#f59e0b]"
                  }`}
                >
                  {unit.status}
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold">{unit.name}</h3>
                <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                  ₱{unit.price.toLocaleString()}
                </div>
              </div>
              <p className="text-muted-foreground mb-4 line-clamp-2">{unit.description}</p>
              <div className="grid grid-cols-2 gap-2">
                <Link href={`/model-houses/${series.id}/${unit.id}`}>
                  <Button
                    className="w-full"
                    style={{ backgroundColor: series.developerColor, borderColor: series.developerColor }}
                  >
                    View Details
                  </Button>
                </Link>
                <Link href={`/contact?${unitContactQueryParams}`}>
                  <Button variant="outline" className="w-full">
                    Inquire Now
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
