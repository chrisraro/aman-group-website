import { ModelHouseCard } from "./ModelHouseCard"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { useModelHousesByProject } from "@/lib/hooks/useModelHouses"

interface ModelHouseListProps {
  project: string
}

export function ModelHouseList({ project }: ModelHouseListProps) {
  const { modelHouses, isLoading, isError } = useModelHousesByProject(project)

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error loading model houses. Please try again later.</p>
      </div>
    )
  }

  if (modelHouses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No model houses found for this project.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {modelHouses.map((series) => (
        <ModelHouseCard key={series.id} series={series} />
      ))}
    </div>
  )
}
