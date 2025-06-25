import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getModelHousesByProject, getAllRFOUnits } from "@/data/model-houses"
import { projects } from "@/data/projects"

export default function EnjoyRealtyPage() {
  // Filter projects for Enjoy Realty
  const enjoyRealtyProjects = projects.filter((project) => project.developer === "Enjoy Realty")

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          <Home className="h-4 w-4 inline mr-1" />
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="font-medium">Enjoy Realty & Development Corporation</span>
      </div>

      {/* Hero Section */}
      <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-12">
        <div className="absolute inset-0 flex items-center">
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <Image
              src="https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/logo_images/Enjoy_Realty_Logo%20%281%29-RQ8HUzf03lgsW1fFNZuytby4ifEMUE.png"
              alt="Enjoy Realty Logo"
              width={600}
              height={400}
              className="object-contain p-12 opacity-20"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#65932D]/80 to-transparent z-10"></div>
          <div className="px-4 md:px-12 max-w-2xl z-20 relative">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
              Enjoy Realty & Development Corporation
            </h1>
            <p className="text-white/90 text-base md:text-lg mb-4 md:mb-6">
              Palm Villages, Parkview Communites, Haciendas de Naga
            </p>
            <Link href="/contact">
              <Button className="bg-[#FFE400] text-[#65932D] hover:bg-[#FFE400]/90">Contact Us</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-[#65932D]">Our Projects</h2>

        <Tabs defaultValue={enjoyRealtyProjects[0]?.id || ""} className="w-full">
          <TabsList className="flex w-full rounded-lg p-1 bg-gray-100/80 mb-6 md:mb-8 mobile-tabs overflow-x-auto no-scrollbar">
            {enjoyRealtyProjects.map((project) => (
              <TabsTrigger
                key={project.id}
                value={project.id}
                className="flex-1 min-w-[100px] rounded-md px-2 py-2 text-xs md:text-sm font-medium transition-all data-[state=active]:bg-[#65932D] data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-200/80"
                mobileAbbr={project.name.length > 15 ? project.name.split(" ")[0] : undefined}
              >
                {project.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {enjoyRealtyProjects.map((project, index) => (
            <TabsContent key={project.id} value={project.id}>
              <div className="bg-white rounded-lg shadow-md overflow-hidden border">
                <div className="md:flex">
                  <div className="md:w-1/2 relative">
                    <div className="h-[300px] overflow-hidden">
                      <Image
                        src={project.imageUrl || `/placeholder.svg?height=600&width=800&text=${project.name}`}
                        alt={project.name}
                        width={800}
                        height={600}
                        className="w-full h-full object-contain bg-white hover:scale-102 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                  <div className="md:w-1/2 p-6 md:p-8">
                    <h3 className="text-2xl font-bold mb-4">{project.name}</h3>
                    <p className="text-muted-foreground mb-6">{project.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <h4 className="font-semibold mb-1">Location</h4>
                        <p className="text-sm text-muted-foreground">{project.location}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Property Type</h4>
                        <p className="text-sm text-muted-foreground">{project.propertyType}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Lot Area</h4>
                        <p className="text-sm text-muted-foreground">{project.lotArea}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Status</h4>
                        <p className="text-sm text-muted-foreground">{project.status}</p>
                      </div>
                    </div>
                    <Link href={`/enjoy-realty/${project.id}`}>
                      <Button className="w-full bg-[#65932D] hover:bg-[#65932D]/90">
                        View Project Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Model Houses Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-8 text-[#65932D]">Our Model Houses</h2>

        {getModelHousesByProject("Palm Village").length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {getModelHousesByProject("Palm Village").map((series) => (
              <Card key={series.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={series.imageUrl || `/placeholder.svg?height=300&width=400&text=${series.name}`}
                    alt={series.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2">{series.name}</h3>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{series.description}</p>
                  <Link href={`/model-houses/${series.id}`}>
                    <Button
                      variant="outline"
                      className="w-full border-[#65932D] text-[#65932D] hover:bg-[#65932D] hover:text-white"
                    >
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h3 className="text-xl font-semibold mb-3 text-[#65932D]">Model Houses Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              Our model houses for this project are currently under development. Check back soon for updates on our
              latest designs and offerings.
            </p>
            <Link href="/model-houses">
              <Button className="bg-[#65932D] hover:bg-[#65932D]/90">View All Model Houses</Button>
            </Link>
          </div>
        )}
      </section>

      {/* Ready for Occupancy Section */}
      <section>
        <h2 className="text-3xl font-bold mb-8 text-[#65932D]">Ready for Occupancy Units</h2>

        {getAllRFOUnits().filter((unit) => unit.developer === "Enjoy Realty").length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {getAllRFOUnits()
              .filter((unit) => unit.developer === "Enjoy Realty" && unit.status === "Fully Constructed")
              .slice(0, 1)
              .map((unit) => (
                <div
                  key={unit.id}
                  className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={
                        unit.imageUrl || `/placeholder.svg?height=300&width=400&text=${unit.seriesName}+${unit.name}`
                      }
                      alt={`${unit.seriesName} ${unit.name}`}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-[#FFE400] text-[#65932D] px-3 py-1 font-semibold">
                      {unit.status}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">
                      {unit.seriesName} {unit.name}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-3">{unit.description}</p>
                    <Link href={`/ready-for-occupancy/${unit.id}`}>
                      <Button className="w-full bg-[#65932D] hover:bg-[#65932D]/90">View Details</Button>
                    </Link>
                  </div>
                </div>
              ))}

            <div className="grid gap-6">
              {getAllRFOUnits()
                .filter((unit) => unit.developer === "Enjoy Realty" && unit.status === "On Going")
                .slice(0, 2)
                .map((unit) => (
                  <Card key={unit.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex">
                      <div className="w-1/3 relative">
                        <Image
                          src={
                            unit.imageUrl ||
                            `/placeholder.svg?height=200&width=200&text=${unit.seriesName || "/placeholder.svg"}+${unit.name}`
                          }
                          alt={`${unit.seriesName} ${unit.name}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-0 right-0 bg-[#FFE400] text-[#65932D] px-2 py-1 text-xs font-semibold">
                          {unit.status}
                        </div>
                      </div>
                      <div className="w-2/3 p-4">
                        <h3 className="text-lg font-bold mb-2">
                          {unit.seriesName} {unit.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {unit.constructionProgress}% Complete. {unit.description}
                        </p>
                        <Link href={`/ready-for-occupancy/${unit.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#65932D] text-[#65932D] hover:bg-[#65932D] hover:text-white"
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h3 className="text-xl font-semibold mb-3 text-[#65932D]">Ready for Occupancy Units Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              Our ready for occupancy units for this project are currently under development. Check back soon for
              updates on available units ready for immediate move-in.
            </p>
            <Link href="/ready-for-occupancy">
              <Button className="bg-[#65932D] hover:bg-[#65932D]/90">View All RFO Units</Button>
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
