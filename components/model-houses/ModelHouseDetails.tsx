import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useModelHouseSeriesById } from "@/lib/hooks/useModelHouses"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import ScheduleViewingButton from "@/components/shared/ScheduleViewingButton"
import { ModelHouseUnitList } from "./ModelHouseUnitList"

interface ModelHouseDetailsProps {
  seriesId: string
}

export function ModelHouseDetails({ seriesId }: ModelHouseDetailsProps) {
  const { series, isLoading, isError } = useModelHouseSeriesById(seriesId)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError || !series) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading model house details. Please try again later.</p>
        <Link href="/model-houses" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Model Houses
          </Button>
        </Link>
      </div>
    )
  }

  // Create query parameters for the contact form
  const contactQueryParams = new URLSearchParams({
    propertyInterest: "Model House",
    modelHousesSeries: seriesId,
    projectLocation: series.project,
  }).toString()

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          <Home className="h-4 w-4 inline mr-1" />
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <Link href="/model-houses" className="text-muted-foreground hover:text-primary">
          Model House Series
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="font-medium">{series.name}</span>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <Link href="/model-houses">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Model House Series
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 relative h-[400px]">
            <Image
              src={series.imageUrl || `/placeholder.svg?height=300&width=400&text=${series.name}`}
              alt={series.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="md:w-1/2 p-6 md:p-8">
            <h1 className="text-3xl font-bold mb-2">{series.name}</h1>
            <p className="text-muted-foreground mb-6">{series.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold mb-1">Floor Area</h3>
                <p className="text-muted-foreground">{series.floorArea}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Design Type</h3>
                <p className="text-muted-foreground">{series.loftReady ? "Loft Ready" : "Standard Design"}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Project</h3>
                <p className="text-muted-foreground">{series.project}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ScheduleViewingButton
                propertyName={series.name}
                propertyLocation={series.project}
                className="w-full"
                style={{ backgroundColor: series.developerColor, borderColor: series.developerColor }}
              />
              <Link href={`/contact?${contactQueryParams}`}>
                <Button variant="outline" className="w-full">
                  Inquire Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Units Section */}
      <section>
        <h2 className="text-2xl font-bold mb-8">Available Units</h2>
        <ModelHouseUnitList series={series} />
      </section>
    </div>
  )
}
