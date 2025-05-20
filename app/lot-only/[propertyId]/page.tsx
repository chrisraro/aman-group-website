import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MapPin, Ruler, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatNumberWithCommas } from "@/lib/utils/format-utils"
import { getLotOnlyPropertyById } from "@/data/lot-only-properties"
import ScheduleViewingButton from "@/components/shared/ScheduleViewingButton"
import LoanCalculatorButton from "@/components/loan-calculator-button"

interface LotOnlyDetailPageProps {
  params: {
    propertyId: string
  }
}

export async function generateMetadata({ params }: LotOnlyDetailPageProps): Promise<Metadata> {
  const property = getLotOnlyPropertyById(params.propertyId)

  if (!property) {
    return {
      title: "Property Not Found | Aman Group",
    }
  }

  return {
    title: `${property.name} | Aman Group`,
    description: property.description,
  }
}

export default function LotOnlyDetailPage({ params }: LotOnlyDetailPageProps) {
  const property = getLotOnlyPropertyById(params.propertyId)

  if (!property) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Link href="/lot-only" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Lot Only Properties
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Property details */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <Image
                  src={property.imageUrl || `/placeholder.svg?height=800&width=1200&text=${property.name}`}
                  alt={property.name}
                  fill
                  className="object-cover"
                />
                <Badge
                  className="absolute top-4 right-4 text-sm px-3 py-1"
                  style={{ backgroundColor: property.developerColor }}
                >
                  {property.developer}
                </Badge>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2">{property.name}</h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{property.location}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-muted-foreground mb-1">
                    <Tag className="h-4 w-4 mr-1" />
                    <span className="text-xs">Price</span>
                  </div>
                  <p className="font-semibold">₱{formatNumberWithCommas(property.price)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-muted-foreground mb-1">
                    <Ruler className="h-4 w-4 mr-1" />
                    <span className="text-xs">Lot Area</span>
                  </div>
                  <p className="font-semibold">{property.lotArea}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center text-muted-foreground mb-1">
                    <span className="text-xs">Status</span>
                  </div>
                  <p className="font-semibold">{property.status}</p>
                </div>
              </div>

              <div className="prose max-w-none mb-8">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p>{property.description}</p>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Features</h2>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {property.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {property.utilities && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Utilities</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {property.utilities.map((utility, index) => (
                      <li key={index} className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                        {utility}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {property.nearbyAmenities && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Nearby Amenities</h2>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {property.nearbyAmenities.map((amenity, index) => (
                      <li key={index} className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mr-2"></div>
                        {amenity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Contact and financing info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Financing Information</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-semibold">₱{formatNumberWithCommas(property.price)}</p>
                  </div>

                  {property.reservationFee && (
                    <div>
                      <p className="text-sm text-muted-foreground">Reservation Fee</p>
                      <p className="font-semibold">₱{formatNumberWithCommas(property.reservationFee)}</p>
                    </div>
                  )}

                  {property.downPaymentPercentage && (
                    <div>
                      <p className="text-sm text-muted-foreground">Down Payment</p>
                      <p className="font-semibold">
                        {property.downPaymentPercentage}% (₱
                        {formatNumberWithCommas((property.price * property.downPaymentPercentage) / 100)})
                      </p>
                      {property.downPaymentTerms && (
                        <p className="text-xs text-muted-foreground">{property.downPaymentTerms}</p>
                      )}
                    </div>
                  )}

                  {property.financingOptions && (
                    <div>
                      <p className="text-sm text-muted-foreground">Financing Options</p>
                      <p className="font-semibold">{property.financingOptions}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 space-y-3">
                  <LoanCalculatorButton
                    modelName={property.name}
                    floorArea={property.lotArea}
                    price={property.price}
                    returnUrl={`/lot-only/${property.id}`}
                    className="w-full"
                  />

                  <ScheduleViewingButton
                    propertyName={property.name}
                    propertyLocation={property.location}
                    className="w-full"
                  />

                  <Button variant="outline" className="w-full">
                    Contact Agent
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Property Details</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Project</p>
                    <p className="font-semibold">{property.project}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Developer</p>
                    <p className="font-semibold">{property.developer}</p>
                  </div>

                  {property.zoning && (
                    <div>
                      <p className="text-sm text-muted-foreground">Zoning</p>
                      <p className="font-semibold">{property.zoning}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
