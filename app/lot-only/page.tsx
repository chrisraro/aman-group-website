"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Home, MapPin, Building2 } from "lucide-react"
import { LotOnlyList } from "@/components/lot-only/LotOnlyList"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

function LotOnlyContent() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          <Home className="h-4 w-4 inline mr-1" />
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="font-medium">Lot Only Properties</span>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <MapPin className="h-12 w-12 text-primary mr-4" />
          <Building2 className="h-12 w-12 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Lot Only Properties</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Discover prime residential lots perfect for building your dream home. Choose from various locations and sizes
          to match your vision and budget.
        </p>
      </div>

      {/* Properties List */}
      <LotOnlyList />
    </div>
  )
}

export default function LotOnlyPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
              <p>Loading lot-only properties...</p>
            </div>
          </div>
        </div>
      }
    >
      <LotOnlyContent />
    </Suspense>
  )
}
