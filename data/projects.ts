import type { Project } from "@/types/loan-calculator"

export const projects: Project[] = [
  {
    id: "parkview-naga-urban-residences",
    name: "Parkview Naga Urban Residences",
    description: "Modern urban living in Naga City.",
    location: "Naga City",
    developer: "Aman Engineering Enterprises",
    status: "ongoing",
    images: [
      "/images/projects/parkview-nur-main.jpg",
      "/images/projects/parkview-nur-amenities.jpg",
      "/images/projects/parkview-nur-units.jpg",
    ],
    features: [
      "Gated Community",
      "24/7 Security",
      "Landscaped Gardens",
      "Wide Roads",
      "Underground Utilities",
      "Flood-Free Location",
    ],
    amenities: [
      "Swimming Pool",
      "Clubhouse",
      "Basketball Court",
      "Playground",
      "Jogging Path",
      "Function Hall",
      "Gym",
      "Multi-purpose Court",
    ],
    priceRange: {
      min: 1200000,
      max: 3500000,
    },
    totalUnits: 500,
    lotSizes: ["80 sqm", "100 sqm", "120 sqm", "150 sqm"],
    floorArea: ["45 sqm", "60 sqm", "72 sqm", "80 sqm"],
    bedrooms: [2, 3, 4],
    bathrooms: [1, 2, 3],
    carports: [1, 2],
    turnoverDate: "2025-2027",
    logo: "/images/projects/parkview-nur-logo.png",
    image: "/images/hero/queenie-72.jpg",
    dhsudLtsNo: "048",
    primaryColor: "#04009D", // Blue
  },
  {
    id: "palm-village",
    name: "Palm Village",
    description:
      "An affordable housing community designed for growing families, featuring modern amenities and convenient location.",
    location: "Naga City, Camarines Sur",
    developer: "Aman Engineering Enterprises",
    status: "ongoing",
    images: [
      "/images/projects/palm-village-main.jpg",
      "/images/projects/palm-village-amenities.jpg",
      "/images/projects/palm-village-units.jpg",
    ],
    features: ["Gated Community", "Security", "Paved Roads", "Drainage System", "Electrical System", "Water System"],
    amenities: ["Clubhouse", "Basketball Court", "Playground", "Multi-purpose Hall", "Covered Court"],
    priceRange: {
      min: 800000,
      max: 2000000,
    },
    totalUnits: 300,
    lotSizes: ["60 sqm", "80 sqm", "100 sqm"],
    floorArea: ["36 sqm", "45 sqm", "60 sqm"],
    bedrooms: [2, 3],
    bathrooms: [1, 2],
    carports: [1],
    turnoverDate: "2024-2026",
    logo: "/images/projects/parkview-village-logo.png",
  },
  {
    id: "haciendas-de-naga",
    name: "Haciendas de Naga",
    description: "Spacious lots and homes in a prime location.",
    location: "Naga City",
    developer: "Aman Engineering Enterprises",
    status: "upcoming",
    images: [
      "/images/projects/haciendas-main.jpg",
      "/images/projects/haciendas-amenities.jpg",
      "/images/projects/haciendas-units.jpg",
    ],
    features: [
      "Exclusive Gated Community",
      "Premium Security",
      "Landscaped Environment",
      "Wide Tree-lined Streets",
      "Underground Utilities",
      "Flood Control System",
    ],
    amenities: [
      "Grand Clubhouse",
      "Resort-style Pool",
      "Tennis Court",
      "Basketball Court",
      "Fitness Center",
      "Function Rooms",
      "Children's Playground",
      "Jogging Trail",
    ],
    priceRange: {
      min: 2500000,
      max: 8000000,
    },
    totalUnits: 200,
    lotSizes: ["150 sqm", "200 sqm", "250 sqm", "300 sqm"],
    floorArea: ["80 sqm", "100 sqm", "120 sqm", "150 sqm"],
    bedrooms: [3, 4, 5],
    bathrooms: [2, 3, 4],
    carports: [2, 3],
    turnoverDate: "2026-2028",
    logo: "/images/projects/haciendas-logo.png",
    image: "/images/hero/construction-bg.jpg",
    dhsudLtsNo: "036",
    primaryColor: "#65932D", // Green
  },
  {
    id: "parkview-executive-village",
    name: "Parkview Executive Village",
    description: "Exclusive living with premium facilities.",
    location: "Naga City",
    developer: "Aman Engineering Enterprises",
    status: "completed",
    images: [
      "/images/projects/parkview-executive-main.jpg",
      "/images/projects/parkview-executive-amenities.jpg",
      "/images/projects/parkview-executive-units.jpg",
    ],
    features: [
      "Executive Community",
      "Premium Security",
      "Modern Architecture",
      "Quality Construction",
      "Strategic Location",
      "Complete Infrastructure",
    ],
    amenities: ["Clubhouse", "Swimming Pool", "Basketball Court", "Function Hall", "Playground", "Gazebo"],
    priceRange: {
      min: 1800000,
      max: 4500000,
    },
    totalUnits: 150,
    lotSizes: ["100 sqm", "120 sqm", "150 sqm"],
    floorArea: ["60 sqm", "80 sqm", "100 sqm"],
    bedrooms: [3, 4],
    bathrooms: [2, 3],
    carports: [1, 2],
    turnoverDate: "2023-2024",
    logo: "/images/projects/parkview-executive-logo.png",
    image: "/images/hero/jasmine-45.jpg",
    dhsudLtsNo: "036",
    primaryColor: "#04009D", // Blue
  },
]

export const getProjectById = (id: string): Project | undefined => {
  return projects.find((project) => project.id === id)
}

export const getProjectsByDeveloper = (developer: string): Project[] => {
  return projects.filter((project) => project.developer === developer)
}

export const getProjectsByStatus = (status: Project["status"]): Project[] => {
  return projects.filter((project) => project.status === status)
}
