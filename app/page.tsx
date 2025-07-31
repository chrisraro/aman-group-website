"use client"

import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ChevronRight, Building2, Users, Award, Leaf, Trophy, Star, CheckCircle } from "lucide-react"
import { motion, useAnimation } from "framer-motion"

import { Button } from "@/components/ui/button"
import { getBrokerageFromParams } from "@/lib/brokerage-links"
import { storeBrokerageInfo } from "@/lib/storage-utils"
import { YouTubeEmbed } from "@/components/youtube-embed"
import { Card, CardContent } from "@/components/ui/card" // Import Card components

// Hero background images - Updated with new model houses and clubhouse
const heroImages = [
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/cLUBHOUSE.png-YqdpqiLoX7n1eYq3Ogzz1HkdjIx2Yc.jpeg",
    alt: "Palm Village Clubhouse - Modern community amenities",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thalia-uWDz1KBb3XrSKGozyP717XnDyXAujv.png",
    alt: "Thalia Model House - Contemporary two-story design",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Cheska%2072.jpg-JJvfHbooDPfbPjZhxtIWdmGgomU1lm.jpeg",
    alt: "Cheska 72 Model House - Modern single-story home",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/jASMINE%2045.jpg-zolLI9D28SdWBHLdPl2M0aoqswm4C8.jpeg",
    alt: "Jasmine 45 Model House - Elegant townhouse design",
  },
  {
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/qUEENIE%2072.jpg-AV7GXsYHd8bqNNZk7UpR3GXzOtiQh9.jpeg",
    alt: "Queenie 72 Model House - Affordable family home",
  },
]

// Project logos for carousel
const projectLogos = [
  {
    name: "Parkview Village",
    logo: "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/Project_images/Palm%20Village/Palm%20Logo%20with%20address-XwMEbdcNRDx5PEhg99DIfr0HINt6TY.jpg",
    href: "/enjoy-realty/palm-village",
  },
  {
    name: "Parkview Employees' Village",
    logo: "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/Project_images/Parkview%20Executive/Logo_PET_Transparent_Back-zZOkOK4fHnC03bfEMvKvw01Czhht7f.png",
    href: "/enjoy-realty/parkview-executive-townhouse",
  },
  {
    name: "Parkview Naga Urban Residences",
    logo: "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/Project_images/Parkview%20NUR/parkview%20Naga%20Urban%20residences%20new%20logo-L7bsoG9mPT3iPBF5pMezIOAJXxH4Oo.jpg",
    href: "/aman-engineering/parkview-naga",
  },
  {
    name: "Palm Village",
    logo: "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/Project_images/Palm%20Village/Palm%20Logo%20with%20address-XwMEbdcNRDx5PEhg99DIfr0HINt6TY.jpg",
    href: "/enjoy-realty/palm-village",
  },
  {
    name: "Haciendas de Naga",
    logo: "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/Project_images/Haciendas/hdn%202-QC0xhtuzso5HOf0sAr1S6P2MDXIJa7.jpg",
    href: "/enjoy-realty/haciendas-de-naga",
  },
  {
    name: "Parkview Executive Townhome",
    logo: "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/Project_images/Parkview%20Executive/Logo_PET_Transparent_Back-zZOkOK4fHnC03bfEMvKvw01Czhht7f.png",
    href: "/enjoy-realty/parkview-executive-townhouse",
  },
]

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

// Social Proof Images and Links
const socialProofItems = [
  {
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-dhpSzlcBVw5yGxrTh8G8wdsoUCwwNB.jpeg",
    alt_text: "Happy family receiving keys to their new single-story home.",
    link_url:
      "https://www.facebook.com/enjoyrealty/posts/pfbid0RxXgSxZ9p8H96vunkSaJr3PPVBY1aZfZPrfK6KiUMGPy9NCtEMFcCzv4Lyq93pmyl",
  },
  {
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-EPFlOuR99Ij5myVPhMmSY9VT0vfmVC.jpeg",
    alt_text: "Family receiving keys to their new green townhouse unit.",
    link_url: "https://www.facebook.com/enjoyrealty/posts/pfbid047ungR92akbBravAUj7ZWJdqNA6rGc49l",
  },
  {
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-E4m8AjzzamSIcJ7eieI4VMLItCpYye.jpeg",
    alt_text: "Another happy family receiving keys to their new single-story home.",
    link_url:
      "https://www.facebook.com/enjoyrealty/posts/pfbid04V6cwjZJgcud6BW9p2hVdSf7nsN95cRg9rakzs2fjAqwi9QJ7mBKuve9LgfAuC1Ul",
  },
  {
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image.png-bpMsZ4fcLbBCzKTCwuWA2mbO4W01cI.jpeg",
    alt_text: "Family and agents celebrating inside a new home's garage.",
    link_url:
      "https://www.facebook.com/enjoyrealty/posts/pfbid02X6ZcepKwuAoi8iPq22DpgydP4mXVC3j9gdRrdpHRbtcK1qW2M3WbsAKDXbfreYUql",
  },
  {
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ZwKtAyRdkE07by9pEHeD793gAM2XMc.png",
    alt_text: "Group photo of a family and agents in front of a new single-story house.",
    link_url:
      "https://www.facebook.com/enjoyrealty/posts/pfbid02X6ZcepKwuAoi8iPq22DpgydP4mXVC3j9gdRrdpHRbtcK1qW2M3WbsAKDXbfreYUql", // Reusing a link as there were only 4 unique FB links provided previously
  },
]

// Top Brokers' Success Data - Updated to use full card images
const topBrokersSuccessItems = [
  {
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-BSY6sJdFKDRaByfbqzPokE21aKY8U1.png",
    alt_text: "Congratulations card for Margie Hernandez, Chelsea 86 Deluxe",
    link_url: "https://www.facebook.com/photo/?fbid=924073309523614&set=pcb.924071099523835",
  },
  {
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-DpdVvPsKohViSrTc46M9T1zr6EbXjT.png",
    alt_text: "Congratulations card for Jesse Belleza, Chloe 72 Basic",
    link_url: "https://www.facebook.com/photo/?fbid=924070669523878&set=pcb.924071099523835",
  },
  {
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-L99h068CAIHQCLDiGB7M3rKYoIlOBF.png",
    alt_text: "Congratulations card for Reggie Guevarra, Thalia 80 Basic",
    link_url: "https://www.facebook.com/photo/?fbid=924070722857206&set=pcb.924071099523835",
  },
  {
    image_url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-w5RNLBT9i0rwTV4AK1pIRXl2f346rO.png",
    alt_text: "Congratulations card for Marissa Reyes, Queenie 72 Basic with Loft",
    link_url: "https://www.facebook.com/photo?fbid=924070746190537&set=pcb.924071099523835",
  },
]

export default function Home() {
  const searchParams = useSearchParams()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Carousel animation controls for social proof
  const socialProofCarouselControls = useAnimation()
  const socialProofCarouselTrackRef = useRef<HTMLDivElement>(null)
  const [socialProofTrackWidth, setSocialProofTrackWidth] = useState(0)

  // Carousel animation controls for top brokers
  const topBrokersCarouselControls = useAnimation()
  const topBrokersCarouselTrackRef = useRef<HTMLDivElement>(null)
  const [topBrokersTrackWidth, setTopBrokersTrackWidth] = useState(0)

  // Auto-slide hero images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Check for brokerage parameters and store them
  useEffect(() => {
    const brokerageInfo = getBrokerageFromParams(searchParams)
    if (brokerageInfo) {
      storeBrokerageInfo(brokerageInfo)
    }
  }, [searchParams])

  // Calculate track width dynamically for infinite social proof carousel
  useEffect(() => {
    if (socialProofCarouselTrackRef.current && socialProofItems.length > 0) {
      // Get the width of the first card, including its margins
      const firstCard = socialProofCarouselTrackRef.current.children[0] as HTMLElement
      if (firstCard) {
        const cardComputedStyle = window.getComputedStyle(firstCard)
        const cardWidth = firstCard.offsetWidth
        const marginLeft = Number.parseFloat(cardComputedStyle.marginLeft)
        const marginRight = Number.parseFloat(cardComputedStyle.marginRight)
        const totalCardWidth = cardWidth + marginLeft + marginRight
        setSocialProofTrackWidth(totalCardWidth * socialProofItems.length)
      }
    }
  }, [socialProofItems.length])

  // Start social proof carousel animation when trackWidth is known
  useEffect(() => {
    if (socialProofTrackWidth > 0) {
      socialProofCarouselControls.start({
        x: [0, -socialProofTrackWidth], // Animate from 0 to negative width of one set of posts
        transition: {
          x: {
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            duration: socialProofItems.length * 5, // Adjust duration for speed
            ease: "linear",
          },
        },
      })
    }
  }, [socialProofTrackWidth, socialProofCarouselControls, socialProofItems.length])

  const handleSocialProofCarouselMouseEnter = () => {
    socialProofCarouselControls.stop() // Stop the animation on hover
  }

  const handleSocialProofCarouselMouseLeave = () => {
    // Resume animation from the beginning of the loop cycle
    socialProofCarouselControls.start({
      x: [0, -socialProofTrackWidth],
      transition: {
        x: {
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          duration: socialProofItems.length * 5,
          ease: "linear",
        },
      },
    })
  }

  // Calculate track width dynamically for infinite top brokers carousel
  useEffect(() => {
    if (topBrokersCarouselTrackRef.current && topBrokersSuccessItems.length > 0) {
      const firstCard = topBrokersCarouselTrackRef.current.children[0] as HTMLElement
      if (firstCard) {
        const cardComputedStyle = window.getComputedStyle(firstCard)
        const cardWidth = firstCard.offsetWidth
        const marginLeft = Number.parseFloat(cardComputedStyle.marginLeft)
        const marginRight = Number.parseFloat(cardComputedStyle.marginRight)
        const totalCardWidth = cardWidth + marginLeft + marginRight
        setTopBrokersTrackWidth(totalCardWidth * topBrokersSuccessItems.length)
      }
    }
  }, [topBrokersSuccessItems.length])

  // Start top brokers carousel animation when trackWidth is known
  useEffect(() => {
    if (topBrokersTrackWidth > 0) {
      topBrokersCarouselControls.start({
        x: [0, -topBrokersTrackWidth],
        transition: {
          x: {
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            duration: topBrokersSuccessItems.length * 5,
            ease: "linear",
          },
        },
      })
    }
  }, [topBrokersTrackWidth, topBrokersCarouselControls, topBrokersSuccessItems.length])

  const handleTopBrokersCarouselMouseEnter = () => {
    topBrokersCarouselControls.stop()
  }

  const handleTopBrokersCarouselMouseLeave = () => {
    topBrokersCarouselControls.start({
      x: [0, -topBrokersTrackWidth],
      transition: {
        x: {
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          duration: topBrokersSuccessItems.length * 5,
          ease: "linear",
        },
      },
    })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Images */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{
                opacity: currentImageIndex === index ? 1 : 0,
              }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </motion.div>
          ))}
          {/* Dark overlay for better text visibility */}
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-shadow-lg">
              Building Dreams,
              <br />
              <span className="text-primary drop-shadow-lg">Creating Communities</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Quality homes and sustainable communities for Bicolano families since 1989
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {developers.map((developer, index) => (
                <motion.div
                  key={developer.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 + index * 0.2 }}
                >
                  <Link href={`/${developer.slug}`}>
                    <Button
                      size="lg"
                      className="text-lg px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                      style={{
                        backgroundColor: developer.primary_color,
                        borderColor: developer.primary_color,
                      }}
                    >
                      {developer.name === "Enjoy Realty & Development" ? "Enjoy Realty" : "Aman Engineering"}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
            className="flex flex-col items-center"
          >
            <span className="text-sm mb-2 drop-shadow-md">Scroll to explore</span>
            <ChevronRight className="h-6 w-6 rotate-90 drop-shadow-md" />
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Projects Carousel */}
      <section className="py-16 bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Featured Projects</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our premium residential developments across the Bicol Region
            </p>
          </motion.div>
        </div>

        {/* Continuous Carousel */}
        <div className="relative">
          <motion.div
            animate={{ x: [0, -100 * projectLogos.length] }}
            transition={{
              duration: 30,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="flex gap-8 w-max"
          >
            {[...projectLogos, ...projectLogos].map((project, index) => (
              <Link key={`${project.name}-${index}`} href={project.href} className="flex-shrink-0 group">
                <div className="w-48 h-32 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group-hover:scale-105 flex items-center justify-center p-4">
                  <Image
                    src={project.logo || "/placeholder.svg"}
                    alt={project.name}
                    width={180}
                    height={120}
                    className="object-contain max-w-full max-h-full"
                  />
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Merged Construction Innovation & ARISE Technology Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Construction Innovation Sub-section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Construction Innovation</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {[
              {
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Buhos%20card%201-AlvLbTq6Jf6SEv6SixDhatJuLhMXpR.webp",
                alt: "House under construction with concrete walls",
                title: "Solid Concrete (BUHOS)",
                description:
                  "poured directly into molds, creating seamless, durable, and strong structures ideal for foundations and walls.",
              },
              {
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/pest%20card-l3JIGHaFSVrQGu9mRNbyhmeUy2hBpz.webp",
                alt: "Person in hazmat suit spraying for pests",
                title: "Pest-Resistant",
                description:
                  "enhance the longevity of buildings, crops, and goods by preventing the entry or survival of pests.",
              },
              {
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thalia%20Palm-aDfirJaIwHX0KDTkYBIcEYpswbFe3D.webp", // Thalia Palm for Earthquake-Resistant
                alt: "Modern two-story house with a car",
                title: "Earthquake-Resistant",
                description:
                  "structures are designed to withstand seismic forces, minimizing damage and ensuring safety during earthquakes.",
              },
              {
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kate%20palm-hyzgRK7tpVazkfnSaDnLpQnlT1ffgb.webp", // Kate Palm for Typhoon-Resistant
                alt: "Modern single-story house with a car",
                title: "Typhoon-Resistant",
                description:
                  "structures are built to endure strong winds and heavy rain, using reinforced materials and design techniques to prevent damage and ensure safety during severe storms.",
              },
              {
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/thalia%20fusion-DXc2ZQLi0UqXljipiJVkH3TgAJIdd8.webp", // Thalia Fusion for Fire-Resistant
                alt: "Modern two-story house with a car",
                title: "Fire-Resistant",
                description:
                  "materials or structures are designed to withstand high temperatures and slow the spread of fire, providing enhanced safety and protection during a fire.",
              },
              {
                image:
                  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/chelsea%20palm-txrxcXI5ijceI1EqcyQJ3fQ5U65Ff0.webp", // Chelsea Palm for Future-Expansion-Ready
                alt: "Modern single-story house with a car",
                title: "Future-Expansion-Ready",
                description:
                  "designs or structures are built with the capability to easily accommodate future growth or additions, minimizing disruptions and costs when expanding.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative w-full h-48">
                  <Image
                    src={feature.image || "/placeholder.svg"}
                    alt={feature.alt}
                    fill
                    className="object-cover rounded-t-2xl"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ARISE Technology Sub-section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-green-50 rounded-2xl shadow-lg p-8 md:p-12 flex flex-col md:flex-row items-center gap-8"
          >
            <div className="flex-shrink-0 w-48 h-48 md:w-64 md:h-64 relative">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ARISE%20Technology%20Logo%20Transparent%201-wRAQvPKaMIwjzf3Y29ijvjlO0Wmvlh.png"
                alt="ARISE Technology Logo"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-green-700 mb-6">What is ARISE Technology</h3>
              <ul className="space-y-3 text-lg text-gray-800">
                <li className="flex items-center justify-center md:justify-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span>Aman Engineering</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span>Reliable Innovation for Stronger</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span>Economical and;</span>
                </li>
                <li className="flex items-center justify-center md:justify-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <span>Environment Friendly Technology</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary font-semibold mb-4">Our Vision & Mission</p>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 max-w-4xl mx-auto leading-tight">
              Leading the Way in Premium Real Estate Development and Sustainable Living
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <p className="text-lg leading-relaxed text-gray-700">
                At Enjoy Realty & Development Corporation (ERDC), we are committed to leading the real estate industry
                in the Bicol Region through innovative house construction technology and the creation of vibrant,
                sustainable communities.
              </p>
              <p className="text-lg leading-relaxed text-gray-700">
                Our team of dedicated professionals works tirelessly to deliver exceptional service and value to our
                clients. We offer thoughtfully designed house-and-lot packages, townhouses, and themed residential
                estates that promote a premium and healthy lifestyle.
              </p>
              <p className="text-lg leading-relaxed text-gray-700">
                With a strong emphasis on environmental protection, we strive to build eco-friendly communities where
                residents can thrive.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-primary">
                  <Building2 className="h-5 w-5" />
                  <span className="font-semibold">Premium Construction</span>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <Leaf className="h-5 w-5" />
                  <span className="font-semibold">Sustainable Living</span>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">Community Focus</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white p-6">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/achievements.jpg-R8nzEbAGFa4sejCMOBMdvQOctX465L.jpeg"
                  alt="Awards and recognitions from Housing and Land Use Regulatory Board"
                  width={600}
                  height={400}
                  className="object-cover w-full h-[400px] rounded-lg"
                />

                {/* Recognition Text Below Image */}
                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Trophy className="h-6 w-6 text-yellow-600" />
                      <h3 className="text-xl font-bold text-gray-900">Our Achievements</h3>
                      <Trophy className="h-6 w-6 text-yellow-600" />
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border-l-4 border-yellow-500">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Star className="h-5 w-5 text-yellow-600" />
                          <span className="font-bold text-lg text-gray-900">BEST DEVELOPMENT DESIGN</span>
                          <Star className="h-5 w-5 text-yellow-600" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">Housing and Land Use Regulatory Board</p>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Award className="h-5 w-5 text-blue-600" />
                          <span className="font-bold text-lg text-gray-900">
                            LEADING DEVELOPER FOR ECONOMIC HOUSING REGION 5
                          </span>
                          <Award className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-600 font-medium">
                          Land Development Category • Housing and Land Use Regulatory Board
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Developer Showcase */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Developers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Two trusted names in real estate development, working together to build your dreams
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {developers.map((developer, index) => (
              <motion.div
                key={developer.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="h-64 relative">
                  <Image
                    src={developer.logo_url || "/placeholder.svg"}
                    alt={developer.name}
                    fill
                    className="object-contain p-8 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-opacity-80 to-transparent opacity-10"
                    style={{
                      backgroundImage: `linear-gradient(to top, ${developer.primary_color}, transparent)`,
                    }}
                  />
                </div>
                <div
                  className="p-8 border-t-4"
                  style={{
                    borderColor: developer.secondary_color || developer.primary_color,
                  }}
                >
                  <h3 className="text-2xl font-bold mb-4" style={{ color: developer.primary_color }}>
                    {developer.slug === "enjoy-realty"
                      ? "Enjoy Realty & Development Corporation"
                      : "Aman Engineering Enterprises"}
                  </h3>
                  <p className="mb-6 text-muted-foreground leading-relaxed">{developer.description}</p>
                  <Link href={`/${developer.slug}`}>
                    <Button
                      className="w-full text-base font-medium group-hover:scale-105 transition-transform duration-300"
                      style={{
                        backgroundColor: developer.primary_color,
                        borderColor: developer.primary_color,
                      }}
                    >
                      Explore Projects <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Aman Group</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              With over 30 years of experience, we've built a reputation for excellence, quality, and trust in the Bicol
              Region
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Building2,
                title: "Quality Construction",
                description: "Built with premium materials and expert craftsmanship for lasting value and durability.",
              },
              {
                icon: Users,
                title: "Strategic Locations",
                description: "Prime locations with access to essential amenities, schools, and transportation hubs.",
              },
              {
                icon: Award,
                title: "Affordable Options",
                description: "Flexible payment terms and financing options to make homeownership accessible to all.",
              },
              {
                icon: Leaf,
                title: "Sustainable Development",
                description:
                  "Eco-friendly communities designed with environmental protection and green living in mind.",
              },
              {
                icon: Building2,
                title: "Proven Track Record",
                description: "Over 30 years of successful projects and thousands of satisfied homeowners across Bicol.",
              },
              {
                icon: Users,
                title: "Community Focus",
                description: "Creating vibrant neighborhoods where families can grow, connect, and thrive together.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300 group"
              >
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Profile Video Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Company Story</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Discover the story of Aman Group of Companies and our commitment to building quality homes and
                communities in the Bicol Region
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <YouTubeEmbed
                videoId="tZsoxfR2TbY"
                title="Aman Group of Companies Profile"
                height="h-[300px] md:h-[500px]"
                autoplay={false}
                muted={false}
                loop={false}
                showControls={true}
                className="mb-0"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Section - Animated Carousel */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Community Says</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              See what our satisfied clients and community members are sharing
            </p>
          </motion.div>

          {/* Carousel Container */}
          <div
            className="relative overflow-hidden"
            onMouseEnter={handleSocialProofCarouselMouseEnter}
            onMouseLeave={handleSocialProofCarouselMouseLeave}
          >
            <motion.div
              ref={socialProofCarouselTrackRef}
              className="flex w-max" // w-max allows content to define width
              animate={socialProofCarouselControls}
            >
              {/* Duplicate items for infinite loop illusion */}
              {[...socialProofItems, ...socialProofItems].map((item, index) => (
                <Link
                  key={index}
                  href={item.link_url}
                  target="_blank" // Open link in new tab
                  rel="noopener noreferrer" // Security best practice for target="_blank"
                  className="flex-shrink-0 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1rem)] mx-2 group"
                >
                  <Card className="w-full rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0 relative w-full aspect-square">
                      <Image
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.alt_text}
                        fill
                        className="object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white text-lg font-semibold">View Post</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Brokers' Success Section - Animated Carousel */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary font-semibold mb-4">Meet the Experts Behind Our Recent Sales Triumphs</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Celebrating Our Top Brokers' Success</h2>
          </motion.div>

          {/* Carousel Container */}
          <div
            className="relative overflow-hidden"
            onMouseEnter={handleTopBrokersCarouselMouseEnter}
            onMouseLeave={handleTopBrokersCarouselMouseLeave}
          >
            <motion.div
              ref={topBrokersCarouselTrackRef}
              className="flex w-max" // w-max allows content to define width
              animate={topBrokersCarouselControls}
            >
              {/* Duplicate items for infinite loop illusion */}
              {[...topBrokersSuccessItems, ...topBrokersSuccessItems].map((item, index) => (
                <Link
                  key={index}
                  href={item.link_url}
                  target="_blank" // Open link in new tab
                  rel="noopener noreferrer" // Security best practice for target="_blank"
                  className="flex-shrink-0 w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1rem)] mx-2 group"
                >
                  <Card className="w-full rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-0 relative w-full aspect-square">
                      <Image
                        src={item.image_url || "/placeholder.svg"}
                        alt={item.alt_text}
                        fill
                        className="object-cover rounded-2xl"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-white text-lg font-semibold">View Post</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
