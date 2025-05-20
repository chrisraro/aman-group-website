import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

export default function LotOnlyDetailLoading() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    </main>
  )
}
