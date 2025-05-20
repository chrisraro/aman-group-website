import { LotOnlyList } from "./LotOnlyList"

interface LotOnlyProjectSectionProps {
  project?: string
  developer?: string
}

export function LotOnlyProjectSection({ project, developer }: LotOnlyProjectSectionProps) {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2">Lot Only Properties</h2>
        <p className="text-xl text-muted-foreground mb-8">Find the perfect lot to build your dream home</p>

        <LotOnlyList project={project} developer={developer} />
      </div>
    </section>
  )
}
