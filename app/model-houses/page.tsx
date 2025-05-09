"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import ScheduleViewingButton from "@/components/schedule-viewing-button"
import { Loader2 } from "lucide-react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

export default function ModelHousesPage() {
  const { getAllProjects, getModelHousesByProject, isLoading, error, refreshData } = useModelHousesContext()
  const [projects, setProjects] = useState<string[]>([])

  useEffect(() => {
    setProjects(getAllProjects())
  }, [getAllProjects])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading model houses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error.message || "There was a problem loading the model houses."}</AlertDescription>
        </Alert>
        <Button onClick={refreshData}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">Model House Series</h1>
      <p className="text-xl text-muted-foreground mb-12">Explore our range of beautifully designed model houses</p>

      {projects.map((project) => (
        <div key={project} className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getModelHousesByProject(project).map((series) => {
              const isEnjoyRealty = series.developer === "Enjoy Realty"
              const developerColor = isEnjoyRealty ? "#65932D" : "#04009D"

              return (
                <div
                  key={series.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={series.imageUrl || `/placeholder.svg?height=300&width=400&text=${series.name}`}
                      alt={series.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
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
                        <Button
                          className="w-full"
                          style={{ backgroundColor: developerColor, borderColor: developerColor }}
                        >
                          View Units
                        </Button>
                      </Link>
                      <ScheduleViewingButton
                        propertyName={series.name}
                        propertyLocation={project}
                        className="w-full"
                        variant="outline"
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div className="mt-16 bg-gray-50 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          We offer customized house designs to meet your specific requirements. Contact our team to discuss your dream
          home.
        </p>
        <Link href="/contact">
          <Button size="lg">Contact Us</Button>
        </Link>
      </div>
    </div>
  )
}
