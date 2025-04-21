"use client"

import Link from "next/link"
import Image from "next/image"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getAllRFOUnits } from "@/data/model-houses"
import ScheduleViewingButton from "@/components/schedule-viewing-button"

export default function ReadyForOccupancyPage() {
  const rfoUnits = getAllRFOUnits()
  const fullyConstructedUnits = rfoUnits.filter((unit) => unit.status === "Fully Constructed")
  const onGoingUnits = rfoUnits.filter((unit) => unit.status === "On Going")

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Ready for Occupancy Units</h1>
      <p className="text-xl text-muted-foreground mb-12">Move in immediately or watch your dream home being built</p>

      {/* Fully Constructed Units */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Fully Constructed Units</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fullyConstructedUnits.map((unit) => {
            const developerColorClass = unit.developerColor === "#65932D" ? "bg-[#65932D]" : "bg-[#04009D]"
            return (
              <div
                key={unit.id}
                className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={unit.imageUrl || `/placeholder.svg?height=300&width=400&text=${unit.seriesName}+${unit.name}`}
                    alt={`${unit.seriesName} ${unit.name}`}
                    fill
                    className="object-cover"
                  />
                  <div className={cn("absolute top-0 right-0 px-3 py-1 font-semibold text-white", developerColorClass)}>
                    {unit.status}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">
                      {unit.seriesName} {unit.name}
                    </h3>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      ₱{unit.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{unit.location}</span>
                  </div>
                  <div className="flex gap-4 my-3">
                    <div>
                      <span className="text-sm font-medium">{unit.loftReady ? "Loft Ready" : "Standard"}</span>
                      <span className="text-xs text-muted-foreground"> design</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">{unit.floorArea}</span>
                      <span className="text-xs text-muted-foreground"> area</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{unit.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/ready-for-occupancy/${unit.id}`}>
                      <Button className={cn("w-full", developerColorClass)}>View Details</Button>
                    </Link>
                    <ScheduleViewingButton
                      propertyName={`${unit.seriesName} ${unit.name}`}
                      propertyLocation={unit.location}
                      className={cn("w-full", "bg-transparent", "border-gray-300", "text-gray-700", "hover:bg-gray-50")}
                      variant="outline"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* On Going Construction Units */}
      <section>
        <h2 className="text-2xl font-bold mb-8">On Going Construction</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {onGoingUnits.map((unit) => {
            const developerColorClass = unit.developerColor === "#65932D" ? "bg-[#65932D]" : "bg-[#04009D]"
            const progressWidthClass = unit.constructionProgress
              ? unit.constructionProgress <= 25
                ? "w-1/4"
                : unit.constructionProgress <= 50
                  ? "w-1/2"
                  : unit.constructionProgress <= 75
                    ? "w-3/4"
                    : "w-full"
              : "w-0"
            return (
              <div
                key={unit.id}
                className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={unit.imageUrl || `/placeholder.svg?height=300&width=400&text=${unit.seriesName}+${unit.name}`}
                    alt={`${unit.seriesName} ${unit.name}`}
                    fill
                    className="object-cover"
                  />
                  <div className={cn("absolute top-0 right-0 px-3 py-1 font-semibold text-white", developerColorClass)}>
                    {unit.status}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">
                      {unit.seriesName} {unit.name}
                    </h3>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      ₱{unit.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{unit.location}</span>
                  </div>
                  <div className="flex gap-4 my-3">
                    <div>
                      <span className="text-sm font-medium">{unit.loftReady ? "Loft Ready" : "Standard"}</span>
                      <span className="text-xs text-muted-foreground"> design</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">{unit.floorArea}</span>
                      <span className="text-xs text-muted-foreground"> area</span>
                    </div>
                  </div>
                  {/* Construction Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Construction Progress</span>
                      <span>{unit.constructionProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className={cn("h-1.5 rounded-full", developerColorClass, progressWidthClass)}></div>
                    </div>
                    {unit.completionDate && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Expected completion: {unit.completionDate}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/ready-for-occupancy/${unit.id}`}>
                      <Button className={cn("w-full", developerColorClass)}>View Details</Button>
                    </Link>
                    <ScheduleViewingButton
                      propertyName={`${unit.seriesName} ${unit.name}`}
                      propertyLocation={unit.location}
                      className={cn("w-full", "bg-transparent", "border-gray-300", "text-gray-700", "hover:bg-gray-50")}
                      variant="outline"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
