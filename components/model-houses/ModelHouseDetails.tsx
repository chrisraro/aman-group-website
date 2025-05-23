"use client"

import { useState } from "react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, Home, MapPin, Ruler, DollarSign, Calendar } from "lucide-react"
import type { ModelHouseSeries } from "@/lib/hooks/useModelHouses"
import { ModelHouseUnitList } from "./ModelHouseUnitList"
import ScheduleViewingButton from "@/components/shared/ScheduleViewingButton"
import LoanCalculatorButton from "@/components/loan-calculator-button"

interface ModelHouseDetailsProps {
  series: ModelHouseSeries
}

export function ModelHouseDetails({ series }: ModelHouseDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const isEnjoyRealty = series.developer === "Enjoy Realty"
  const developerColor = isEnjoyRealty ? "#65932D" : "#04009D"

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg mb-6">
            <Image
              src={series.imageUrl || `/placeholder.svg?height=600&width=800&text=${series.name}`}
              alt={series.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-6 overflow-x-auto flex-nowrap whitespace-nowrap scrollbar-hide pb-2 gap-1 sm:gap-2">
              <TabsTrigger value="overview" className="flex items-center gap-1 px-3 py-2" mobileAbbr="Info">
                <Info className="h-4 w-4 mr-1 sm:mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="units" className="flex items-center gap-1 px-3 py-2" mobileAbbr="Units">
                <Home className="h-4 w-4 mr-1 sm:mr-2" />
                Available Units
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-1 px-3 py-2" mobileAbbr="Map">
                <MapPin className="h-4 w-4 mr-1 sm:mr-2" />
                Location
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="focus-visible:outline-none focus-visible:ring-0">
              <Card>
                <CardHeader>
                  <CardTitle>About {series.name}</CardTitle>
                  <CardDescription>{series.project}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                    <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                      <Ruler className="h-5 w-5 mb-2 text-primary" />
                      <p className="text-sm font-medium">{series.floorArea}</p>
                      <p className="text-xs text-muted-foreground">Floor Area</p>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                      <DollarSign className="h-5 w-5 mb-2 text-primary" />
                      <p className="text-sm font-medium">₱{series.basePrice.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Starting Price</p>
                    </div>
                    <div className="flex flex-col items-center p-3 bg-muted rounded-lg">
                      <Calendar className="h-5 w-5 mb-2 text-primary" />
                      <p className="text-sm font-medium">{series.completionDate || "Available Now"}</p>
                      <p className="text-xs text-muted-foreground">Completion</p>
                    </div>
                  </div>
                  <p className="mb-4">{series.description}</p>
                  <h3 className="text-lg font-semibold mb-2">Features</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Modern architectural design</li>
                    <li>Quality construction materials</li>
                    <li>Spacious living areas</li>
                    <li>Loft-ready design</li>
                    <li>Customizable interior options</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="units" className="focus-visible:outline-none focus-visible:ring-0">
              <Card>
                <CardHeader>
                  <CardTitle>Available Units</CardTitle>
                  <CardDescription>Choose from our selection of available units</CardDescription>
                </CardHeader>
                <CardContent>
                  <ModelHouseUnitList seriesId={series.id} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="focus-visible:outline-none focus-visible:ring-0">
              <Card>
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                  <CardDescription>{series.location || series.project}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-[16/9] w-full bg-muted rounded-lg overflow-hidden mb-4">
                    <iframe
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.802548850001!2d121.04882857489534!3d14.553883977357207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c8efd99aad53%3A0xb64b39847a866fdd!2sMakati%2C%20Metro%20Manila!5e0!3m2!1sen!2sph!4v1651234567890!5m2!1sen!2sph`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={`Map of ${series.name} location`}
                    ></iframe>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nearby Establishments</h3>
                  <ul className="list-disc pl-5 mb-4 space-y-1">
                    <li>Shopping Centers (5 min drive)</li>
                    <li>Schools and Universities (10 min drive)</li>
                    <li>Hospitals and Medical Centers (8 min drive)</li>
                    <li>Parks and Recreational Areas (3 min drive)</li>
                    <li>Business Districts (15 min drive)</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>{series.name}</CardTitle>
              <CardDescription>{series.project}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Starting Price:</span>
                <span className="font-bold text-lg">₱{series.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Floor Area:</span>
                <span className="font-medium">{series.floorArea}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Loft Ready:</span>
                <span className="font-medium">{series.loftReady ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Developer:</span>
                <span className="font-medium">{series.developer}</span>
              </div>
              <div className="pt-4 space-y-3">
                <Button
                  className="w-full"
                  style={{ backgroundColor: developerColor, borderColor: developerColor }}
                  onClick={() => setActiveTab("units")}
                >
                  View Available Units
                </Button>
                <ScheduleViewingButton
                  propertyName={series.name}
                  propertyLocation={series.project}
                  className="w-full"
                  variant="outline"
                />
                <LoanCalculatorButton
                  propertyName={series.name}
                  propertyPrice={series.basePrice}
                  className="w-full"
                  variant="outline"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
