"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getBrokerageFromParams } from "@/lib/brokerage-links"
import { storeBrokerageInfo } from "@/lib/storage-utils"
import { YouTubeEmbed } from "@/components/youtube-embed"

// Developer data
const developers = [
  {
    id: 1,
    name: "Enjoy Realty & Development",
    slug: "enjoy-realty",
    description: "Specializing in residential developments with a focus on quality and affordability.",
    logo_url:
      "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/logo_images/Enjoy_Realty_Logo%20%281%29-RQ8HUzf03lgsW1fFNZuytby4ifEMUE.png",
    primary_color: "#65932D",
    secondary_color: "#FFE400",
  },
  {
    id: 2,
    name: "Aman Engineering Enterprise",
    slug: "aman-engineering",
    description: "Experts in construction and engineering with a commitment to excellence and innovation.",
    logo_url:
      "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/logo_images/aman_engineering_logo-uZFrkvP8LjG5wN6CEoGfixc9Zgsu91.png",
    primary_color: "#04009D",
    secondary_color: "#FE0000",
  },
]

export default function Home() {
  const searchParams = useSearchParams()

  // Check for brokerage parameters and store them
  useEffect(() => {
    const brokerageInfo = getBrokerageFromParams(searchParams)
    if (brokerageInfo) {
      // Store the brokerage info in localStorage
      storeBrokerageInfo(brokerageInfo)
    }
  }, [searchParams])

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <section className="text-center mb-8 md:mb-12 px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-6">Aman Group of Companies</h1>
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
          Building quality homes and communities for Bicolano families.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-5xl mx-auto px-0 md:px-4">
        {developers.map((developer) => (
          <div
            key={developer.id}
            className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-shadow"
          >
            <div className="h-48 md:h-64 relative">
              <Image
                src={developer.logo_url || `/placeholder.svg?height=400&width=600&text=${developer.name}`}
                alt={developer.name}
                fill
                className="object-contain p-8"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-opacity-80 to-transparent"
                style={{
                  backgroundImage: `linear-gradient(to top, ${developer.primary_color}80, transparent)`,
                }}
              ></div>
            </div>
            <div
              className="p-4 md:p-6 border-t-4"
              style={{
                borderColor: developer.secondary_color || developer.primary_color,
              }}
            >
              <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3" style={{ color: developer.primary_color }}>
                {developer.slug === "enjoy-realty"
                  ? "Enjoy Realty & Development Corporation"
                  : "Aman Engineering Enterprises"}
              </h2>
              <p className="mb-4 md:mb-6 text-muted-foreground text-sm md:text-base">{developer.description}</p>
              <Link href={`/${developer.slug}`}>
                <Button
                  className="w-full hover:opacity-90 mobile-touch-target"
                  style={{
                    backgroundColor: developer.primary_color,
                    borderColor: developer.primary_color,
                  }}
                >
                  View Projects <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-12 md:mt-20 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Our Commitment</h2>
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto mb-6 md:mb-10">
          At Aman Group of Companies, we are committed to building quality homes and communities that enhance the lives
          of Bicolano families.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          <div className="p-4 md:p-6 bg-white rounded-lg shadow-sm border">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Quality Construction</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Built with premium materials and expert craftsmanship for lasting value.
            </p>
          </div>

          <div className="p-4 md:p-6 bg-white rounded-lg shadow-sm border">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Strategic Locations</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Prime locations with access to essential amenities and transportation.
            </p>
          </div>

          <div className="p-4 md:p-6 bg-white rounded-lg shadow-sm border">
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
            <h3 className="text-lg md:text-xl font-semibold mb-2">Affordable Options</h3>
            <p className="text-sm md:text-base text-muted-foreground">
              Flexible payment terms and financing options to make homeownership accessible.
            </p>
          </div>
        </div>
      </section>

      {/* Company Profile Video Section */}
      <section className="py-12 md:py-16 bg-gray-50 rounded-xl mt-12 md:mt-16 mb-16 md:mb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Company Profile</h2>
              <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                Discover the story of Aman Group of Companies and our commitment to building quality homes and
                communities in the Bicol Region. Watch our company profile video to learn more about our vision,
                mission, and values.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <YouTubeEmbed
                videoId="tZsoxfR2TbY"
                title="Aman Group of Companies Profile"
                height="h-[250px] md:h-[450px]"
                autoplay={true}
                muted={true}
                loop={true}
                showControls={true}
                className="mb-0"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
