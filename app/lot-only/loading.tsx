import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

export default function LotOnlyLoading() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Lot Only Properties</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Find the perfect lot to build your dream home in our prime locations
        </p>

        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    </main>
  )
}
