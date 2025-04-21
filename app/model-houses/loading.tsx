import { ProjectCardSkeleton } from "@/components/loading-skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-10 md:mb-12 px-4">
        <div className="h-8 w-1/2 mx-auto bg-muted animate-pulse rounded-md mb-4" />
        <div className="h-4 w-3/4 mx-auto bg-muted animate-pulse rounded-md" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
      </div>
    </div>
  )
}
