import { Skeleton } from "@/components/ui/skeleton"

export function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="h-48 bg-muted animate-pulse" />
      <div className="p-6 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-1/4 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export function ProjectDetailSkeleton() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden border">
        <div className="md:flex">
          <div className="md:w-1/2 h-[300px] bg-muted animate-pulse" />
          <div className="md:w-1/2 p-6 md:p-8 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <div className="pt-4">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
