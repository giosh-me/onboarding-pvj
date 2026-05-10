'use client'
import { useProgress } from '@/lib/progress/use-progress'
import { MODULE_ORDER } from '@/lib/content/module-order'
import { ModuleCard } from '@/components/dashboard/ModuleCard'
import { ProgressRing } from '@/components/dashboard/ProgressRing'
import { ResetDialog } from '@/components/shared/ResetDialog'
import type { ModuleFrontmatter } from '@/lib/content/schemas'

export function Dashboard({
  metas,
  title,
  subtitle,
}: {
  metas: ModuleFrontmatter[]
  title: string
  subtitle: string
}) {
  const { progress, stats, resetAll } = useProgress(MODULE_ORDER)
  return (
    <section>
      <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between mb-12">
        <div>
          <h1 className="display">{title}</h1>
          <p className="mt-2 text-pvj-navy/60">{subtitle}</p>
        </div>
        <ProgressRing value={stats.percentComplete} />
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metas.map((meta) => (
          <ModuleCard key={meta.slug} meta={meta} progress={progress.modules[meta.slug]} />
        ))}
      </div>
      <div className="mt-12 text-right">
        <ResetDialog onConfirm={resetAll} />
      </div>
    </section>
  )
}
