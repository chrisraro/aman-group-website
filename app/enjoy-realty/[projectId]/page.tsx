import { Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CanvaEmbed } from "@/components/canva-embed"
import { getModelHousesByProject } from "@/data/model-houses"
import { projects } from "@/data/projects"
import { YouTubeEmbed } from "@/components/youtube-embed"

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const { projectId = "" } = params
  const project = projects.find((p) => p.id === projectId && p.developer === "Enjoy Realty")

  if (!project) {
    return <div className="container mx-auto px-4 py-12">Project not found</div>
  }

  // Get model houses for this project
  const modelHouses = getModelHousesByProject(project.name)

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          <Home className="h-4 w-4 inline mr-1" />
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <Link href="/enjoy-realty" className="text-muted-foreground hover:text-primary">
          Enjoy Realty & Development Corporation
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="font-medium">{project.name}</span>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <Link href="/enjoy-realty">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-12">
        <Image
          src={project.imageUrl || `/placeholder.svg?height=800&width=1600&text=${project.name}`}
          alt={project.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#65932D]/80 to-transparent flex items-center">
          <div className="px-4 md:px-12 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">{project.name}</h1>
            <p className="text-white/90 text-base md:text-lg mb-4 md:mb-6">{project.description}</p>
            <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
              {project.status}
            </div>
          </div>
        </div>
      </div>

      {/* Project Details Tabs */}
      <Tabs defaultValue="overview" className="w-full mb-16">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-2 mb-6 md:mb-8 mobile-tabs overflow-x-auto">
          <TabsTrigger value="overview" className="text-xs md:text-sm">
            Overview
          </TabsTrigger>
          <TabsTrigger value="amenities" className="text-xs md:text-sm">
            Amenities & Features
          </TabsTrigger>
          <TabsTrigger value="sales-map" className="text-xs md:text-sm">
            Sales Map
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-4 text-[#65932D]">About {project.name}</h2>
              <p className="text-muted-foreground mb-6">{project.longDescription}</p>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Location</h3>
                  <p className="text-muted-foreground">{project.location}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Property Type</h3>
                  <p className="text-muted-foreground">{project.propertyType}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Lot Area</h3>
                  <p className="text-muted-foreground">{project.lotArea}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Status</h3>
                  <p className="text-muted-foreground">{project.status}</p>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-gray-50 rounded-lg p-6 border">
                <h3 className="text-lg font-semibold mb-4">Interested in this project?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Contact us to learn more about {project.name} and watch our project video below.
                </p>
                <Button className="w-full bg-[#65932D] hover:bg-[#65932D]/90 mb-4">Schedule a Visit</Button>
                <YouTubeEmbed
                  videoId={project.youtubeVideoId || "CB-ceJnOV3U?si=H3Nh47b2hnn4ahee"}
                  title={`${project.name} Project Video`}
                  primaryColor="#65932D"
                  height="200px"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="amenities">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-[#65932D]">Amenities</h2>
              <div className="bg-white rounded-lg border p-6">
                <ul className="space-y-3">
                  {project.amenities.map((amenity, index) => (
                    <li key={index} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-[#FFE400] mr-3"></div>
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6 text-[#65932D]">Features</h2>
              <div className="bg-white rounded-lg border p-6">
                <ul className="space-y-3">
                  {project.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-[#FFE400] mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sales-map">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6 text-[#65932D]">Sales Map</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto mb-8">
              View the layout of available lots and properties in {project.name}. You can open it in Canva for a better
              view.
            </p>

            <CanvaEmbed
              canvaDesignUrl={project.salesMapCanvaUrl}
              title={`${project.name} Sales Map`}
              primaryColor="#65932D"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Model Houses Section */}
      {modelHouses.length > 0 ? (
        <section>
          <h2 className="text-2xl font-bold mb-8 text-[#65932D]">Available Model Houses</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {modelHouses.map((series) => (
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
                  <h3 className="text-xl font-bold mb-2">{series.name}</h3>
                  <p className="text-muted-foreground mb-4">{series.description}</p>
                  <Link href={`/model-houses/${series.id}`}>
                    <Button
                      variant="outline"
                      className="w-full border-[#65932D] text-[#65932D] hover:bg-[#65932D] hover:text-white"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section>
          <h2 className="text-2xl font-bold mb-8 text-[#65932D]">Available Model Houses</h2>
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h3 className="text-xl font-semibold mb-3 text-[#65932D]">Model Houses Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              Model houses for {project.name} are currently under development. Check back soon for updates on our latest
              designs and offerings.
            </p>
            <Link href="/model-houses">
              <Button className="bg-[#65932D] hover:bg-[#65932D]/90">View All Model Houses</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
