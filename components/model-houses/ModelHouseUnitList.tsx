"use client"

import { useState } from "react"
import Link from "next/link"
import { useModelHouseUnits } from "@/lib/hooks/useModelHouses"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { ErrorMessage } from "@/components/ui/ErrorMessage"
import { Bed, Bath, Grid, ArrowRight } from "lucide-react"

interface ModelHouseUnitListProps {
  seriesId: string
}

export function ModelHouseUnitList({ seriesId }: ModelHouseUnitListProps) {
  const { units, isLoading, isError } = useModelHouseUnits(seriesId)
  const [activeTab, setActiveTab] = useState("all")

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError) {
    return <ErrorMessage message="Failed to load units. Please try again later." />
  }

  if (units.length === 0) {
    return <p className="text-center py-4 text-muted-foreground">No units available at this time.</p>
  }

  // Get unique unit types
  const unitTypes = Array.from(new Set(units.map((unit) => unit.type)))

  // Filter units based on active tab
  const filteredUnits = activeTab === "all" ? units : units.filter((unit) => unit.type === activeTab)

  return (
    <div>
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full mb-4 overflow-x-auto flex-nowrap whitespace-nowrap scrollbar-hide pb-2 gap-1 sm:gap-2">
          <TabsTrigger value="all" className="flex items-center gap-1 px-3 py-2" mobileAbbr="All">
            <Grid className="h-4 w-4 mr-1 sm:mr-2" />
            All Units
          </TabsTrigger>

          {unitTypes.map((type) => (
            <TabsTrigger key={type} value={type} className="px-3 py-2" mobileAbbr={type.substring(0, 3)}>
              {type}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="focus-visible:outline-none focus-visible:ring-0">
          <div className="space-y-4">
            {filteredUnits.map((unit) => (
              <Card key={unit.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className="h-40 md:h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${unit.imageUrl || "/placeholder.svg?height=200&width=300"})` }}
                    ></div>
                    <div className="p-4 md:col-span-2">
                      <h3 className="text-lg font-bold mb-2">{unit.name}</h3>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="flex items-center">
                          <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{unit.bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{unit.bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center">
                          <Grid className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{unit.floorArea}</span>
                        </div>
                      </div>
                      <p className="text-sm mb-4 line-clamp-2">{unit.description}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-bold">₱{unit.price.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{unit.status}</p>
                        </div>
                        <Link href={`/model-houses/${seriesId}/${unit.id}`}>
                          <Button size="sm" className="gap-1">
                            Details
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
