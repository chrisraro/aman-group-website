import type { Metadata } from "next"
import { LotOnlyList } from "@/components/lot-only/LotOnlyList"

export const metadata: Metadata = {
  title: "Lot Only Properties | Aman Group",
  description:
    "Browse our selection of lot-only properties in prime locations. Find the perfect lot to build your dream home.",
}

export default function LotOnlyPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Lot Only Properties</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Find the perfect lot to build your dream home in our prime locations
        </p>

        <LotOnlyList />
      </div>
    </main>
  )
}
