import type { PropertyInterestType } from "@/lib/constants"

export interface LotOnlyProperty {
  id: string
  name: string
  description: string
  price: number
  location: string
  project: string
  developer: string
  developerColor: string
  status: string
  lotArea: string
  features: string[]
  imageUrl: string
  propertyType: PropertyInterestType
  reservationFee?: number
  financingOptions?: string
  downPaymentPercentage?: number
  downPaymentTerms?: string
  zoning?: string
  utilities?: string[]
  nearbyAmenities?: string[]
}

export const lotOnlyProperties: LotOnlyProperty[] = [
  {
    id: "parkview-lot-1",
    name: "Parkview Residential Lot 1",
    description: "Prime residential lot in Parkview Naga Urban Residence, perfect for building your dream home.",
    price: 800000,
    location: "Parkview Naga Urban Residence, Zone 7, Brgy. San Felipe, Naga City",
    project: "Parkview Naga Urban Residence",
    developer: "Aman Engineering",
    developerColor: "#04009D",
    status: "Available",
    lotArea: "100 sqm",
    features: [
      "Flat terrain",
      "Regular shape",
      "Ready for construction",
      "Complete utilities",
      "Accessible location",
      "Near amenities",
    ],
    imageUrl: "/placeholder.svg?height=400&width=600&text=Parkview+Lot+1",
    propertyType: "Lot Only",
    reservationFee: 20000,
    financingOptions: "Bank/Pag-Ibig Financing",
    downPaymentPercentage: 20,
    downPaymentTerms: "payable in 2 years with 0% interest",
    zoning: "Residential",
    utilities: ["Water", "Electricity", "Internet", "Drainage"],
    nearbyAmenities: ["School", "Market", "Hospital", "Park", "Church"],
  },
  {
    id: "parkview-lot-2",
    name: "Parkview Residential Lot 2",
    description: "Corner lot in Parkview Naga Urban Residence with excellent location and accessibility.",
    price: 950000,
    location: "Parkview Naga Urban Residence, Zone 7, Brgy. San Felipe, Naga City",
    project: "Parkview Naga Urban Residence",
    developer: "Aman Engineering",
    developerColor: "#04009D",
    status: "Available",
    lotArea: "120 sqm",
    features: [
      "Corner lot",
      "Flat terrain",
      "Regular shape",
      "Ready for construction",
      "Complete utilities",
      "Accessible location",
      "Near amenities",
    ],
    imageUrl: "/placeholder.svg?height=400&width=600&text=Parkview+Lot+2",
    propertyType: "Lot Only",
    reservationFee: 20000,
    financingOptions: "Bank/Pag-Ibig Financing",
    downPaymentPercentage: 20,
    downPaymentTerms: "payable in 2 years with 0% interest",
    zoning: "Residential",
    utilities: ["Water", "Electricity", "Internet", "Drainage"],
    nearbyAmenities: ["School", "Market", "Hospital", "Park", "Church"],
  },
  {
    id: "parkview-lot-3",
    name: "Parkview Residential Lot 3",
    description: "Spacious residential lot in Parkview Naga Urban Residence, ideal for a large family home.",
    price: 1200000,
    location: "Parkview Naga Urban Residence, Zone 7, Brgy. San Felipe, Naga City",
    project: "Parkview Naga Urban Residence",
    developer: "Aman Engineering",
    developerColor: "#04009D",
    status: "Available",
    lotArea: "150 sqm",
    features: [
      "Flat terrain",
      "Regular shape",
      "Ready for construction",
      "Complete utilities",
      "Accessible location",
      "Near amenities",
      "Spacious area",
    ],
    imageUrl: "/placeholder.svg?height=400&width=600&text=Parkview+Lot+3",
    propertyType: "Lot Only",
    reservationFee: 25000,
    financingOptions: "Bank/Pag-Ibig Financing",
    downPaymentPercentage: 20,
    downPaymentTerms: "payable in 2 years with 0% interest",
    zoning: "Residential",
    utilities: ["Water", "Electricity", "Internet", "Drainage"],
    nearbyAmenities: ["School", "Market", "Hospital", "Park", "Church"],
  },
  {
    id: "palm-village-lot-1",
    name: "Palm Village Residential Lot 1",
    description:
      "Beautiful residential lot in Palm Village, perfect for building your dream home in a serene environment.",
    price: 750000,
    location: "Palm Village, Brgy. Concepcion Grande, Naga City",
    project: "Palm Village",
    developer: "Enjoy Realty",
    developerColor: "#65932D",
    status: "Available",
    lotArea: "100 sqm",
    features: [
      "Flat terrain",
      "Regular shape",
      "Ready for construction",
      "Complete utilities",
      "Accessible location",
      "Near amenities",
      "Serene environment",
    ],
    imageUrl: "/placeholder.svg?height=400&width=600&text=Palm+Village+Lot+1",
    propertyType: "Lot Only",
    reservationFee: 20000,
    financingOptions: "Bank/Pag-Ibig Financing",
    downPaymentPercentage: 20,
    downPaymentTerms: "payable in 2 years with 0% interest",
    zoning: "Residential",
    utilities: ["Water", "Electricity", "Internet", "Drainage"],
    nearbyAmenities: ["School", "Market", "Hospital", "Park", "Church"],
  },
  {
    id: "palm-village-lot-2",
    name: "Palm Village Residential Lot 2",
    description: "Corner lot in Palm Village with excellent location and accessibility.",
    price: 900000,
    location: "Palm Village, Brgy. Concepcion Grande, Naga City",
    project: "Palm Village",
    developer: "Enjoy Realty",
    developerColor: "#65932D",
    status: "Available",
    lotArea: "120 sqm",
    features: [
      "Corner lot",
      "Flat terrain",
      "Regular shape",
      "Ready for construction",
      "Complete utilities",
      "Accessible location",
      "Near amenities",
      "Serene environment",
    ],
    imageUrl: "/placeholder.svg?height=400&width=600&text=Palm+Village+Lot+2",
    propertyType: "Lot Only",
    reservationFee: 20000,
    financingOptions: "Bank/Pag-Ibig Financing",
    downPaymentPercentage: 20,
    downPaymentTerms: "payable in 2 years with 0% interest",
    zoning: "Residential",
    utilities: ["Water", "Electricity", "Internet", "Drainage"],
    nearbyAmenities: ["School", "Market", "Hospital", "Park", "Church"],
  },
  {
    id: "palm-village-lot-3",
    name: "Palm Village Residential Lot 3",
    description: "Spacious residential lot in Palm Village, ideal for a large family home in a serene environment.",
    price: 1100000,
    location: "Palm Village, Brgy. Concepcion Grande, Naga City",
    project: "Palm Village",
    developer: "Enjoy Realty",
    developerColor: "#65932D",
    status: "Available",
    lotArea: "150 sqm",
    features: [
      "Flat terrain",
      "Regular shape",
      "Ready for construction",
      "Complete utilities",
      "Accessible location",
      "Near amenities",
      "Spacious area",
      "Serene environment",
    ],
    imageUrl: "/placeholder.svg?height=400&width=600&text=Palm+Village+Lot+3",
    propertyType: "Lot Only",
    reservationFee: 25000,
    financingOptions: "Bank/Pag-Ibig Financing",
    downPaymentPercentage: 20,
    downPaymentTerms: "payable in 2 years with 0% interest",
    zoning: "Residential",
    utilities: ["Water", "Electricity", "Internet", "Drainage"],
    nearbyAmenities: ["School", "Market", "Hospital", "Park", "Church"],
  },
]

export function getAllLotOnlyProperties() {
  return lotOnlyProperties
}

export function getLotOnlyPropertiesByProject(project: string) {
  return lotOnlyProperties.filter((property) => property.project === project)
}

export function getLotOnlyPropertyById(id: string) {
  return lotOnlyProperties.find((property) => property.id === id) || null
}

export function getLotOnlyPropertiesByDeveloper(developer: string) {
  return lotOnlyProperties.filter((property) => property.developer === developer)
}
