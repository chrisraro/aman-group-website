// This file contains the original model houses data
// It's used as a fallback if no data is found in localStorage

const modelHousesData = {
  "jill-108": {
    id: "jill-108",
    name: "Jill 108 Series",
    floorArea: "108 sqm",
    loftReady: false,
    description: "A single-attached home with an open floor plan, perfect for small families.",
    longDescription:
      "The Jill 108 Series is a beautifully designed single-attached home that offers a perfect balance of comfort and functionality. With an open floor plan that maximizes space, this model is ideal for small families. The modern kitchen opens to the dining and living areas, creating a seamless flow for entertaining and daily living. The master bedroom features an en-suite bathroom, while two additional bedrooms share a well-appointed second bathroom.",
    features: [
      "Open floor plan",
      "Living Area",
      "Dining Area",
      "Kitchen & Service Area",
      "Master's Bedroom",
      "2 Bedrooms",
      "Toilet & Bath",
    ],
    specifications: {
      foundation: "150mm thick solid concrete floating foundation, 300mm thick solid concrete wall footing",
      walls: "150mm thick solid concrete - firewall, 100mm thick solid concrete - exterior wall",
      roofing: "Pre-painted Roofing sheets, Roof Framing with C – purlins",
      ceiling: "Fiber Cement Board 4.5mm with light metal frames",
      windows: "Aluminum casement window or Approved Equal Brand",
      doors:
        "Panel Type Door (2.10 x 0.90m) with Doorknob Yale for main entrance, Flush Type Door for service area and T&B",
      flooring: "400x400mm Ceramic floor tiles",
      kitchen: "Movable Kitchen working table with single stainless sink",
      bathroom: "Ceramic floor tiles & wall tiles, Water Closet with Flush Tank – HCG or Approved Equal Brand",
      electrical: "Lighting Fixtures – Royu or Approved Equal Brand, Wiring – Phildex or Approved Equal Brand",
    },
    basePrice: 2500000,
    floorPlanImage: "/placeholder.svg?height=800&width=1200&text=Jill+108+Floor+Plan",
    imageUrl:
      "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/Model_houses_images/Jill/Jill-DL0nFXnfesSdO9P5SZTrr6wLdudfCL.png",
    developer: "Aman Engineering",
    developerColor: "#04009D",
    project: "Parkview Naga Urban Residence",
    units: [
      {
        id: "jill-108-basic",
        name: "Basic",
        seriesName: "Jill 108",
        description: "Essential features with quality construction at an affordable price point.",
        price: 3488000,
        lotOnlyPrice: 1000000,
        houseConstructionPrice: 2488000,
        location: "Parkview Naga Urban Residence, Zone 7, Brgy. San Felipe, Naga City",
        status: "Available",
        isRFO: false,
        features: [
          "Standard fixtures and finishes",
          "Basic kitchen cabinets",
          "Standard bathroom fixtures",
          "Painted walls and ceilings",
          "Tiled floors in main areas",
          "Provision for Garage",
          "Provision for Plant box",
          "Provision for Landscaping",
        ],
        floorPlanImage: "/placeholder.svg?height=800&width=1200&text=Jill+108+Basic+Floor+Plan",
        imageUrl:
          "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/Model_houses_images/Jill/Jill-DL0nFXnfesSdO9P5SZTrr6wLdudfCL.png",
        floorPlanPdfId: "1uFq1-LSFvJCJhcvq38l7ct3LhSMVwfjm",
        walkthrough: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
      {
        id: "jill-108-complete",
        name: "Complete",
        seriesName: "Jill 108",
        description: "Fully built home with all structural elements and finishes for immediate occupancy.",
        price: 4064000,
        lotOnlyPrice: 1000000,
        houseConstructionPrice: 3064000,
        location: "Parkview Naga Urban Residence, Zone 7, Brgy. San Felipe, Naga City",
        status: "Available",
        isRFO: false,
        features: [
          "Complete structural construction",
          "Premium fixtures and finishes",
          "Fully painted interior and exterior",
          "Complete electrical and plumbing systems",
          "Ready for immediate occupancy",
        ],
        floorPlanImage: "/placeholder.svg?height=800&width=1200&text=Jill+108+Complete+Floor+Plan",
        imageUrl:
          "https://8ybl2ah7tkcii6tt.public.blob.vercel-storage.com/Model_houses_images/Jill/Jill-DL0nFXnfesSdO9P5SZTrr6wLdudfCL.png",
        floorPlanPdfId: "1uFq1-LSFvJCJhcvq38l7ct3LhSMVwfjm",
        walkthrough: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      },
    ],
  },
  // Add more model house series as needed
}

export default modelHousesData
