'use client'
import { Link } from '@/lib/i18n/routing'
import { Check } from 'lucide-react'
import { clsx } from 'clsx'
import type { ModuleFrontmatter } from '@/lib/content/schemas'
import { isModuleCompleted } from '@/lib/progress/stats'
import type { ModuleProgress } from '@/lib/progress/types'

export function ModuleCard({
  meta,
  progress,
}: {
  meta: ModuleFrontmatter
  progress: ModuleProgress | undefined
}) {
  const m = progress
  const complete = m ? isModuleCompleted(m) : false
  return (
    <Link
      href={`/m/${meta.slug}`}
      className={clsx(
        'group block rounded-md border bg-white p-5 transition hover:-translate-y-0.5',
        complete ? 'border-pvj-gold-soft' : 'border-pvj-cream-200 hover:border-pvj-gold-soft',
      )}
    >
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-pvj-gold display text-sm">{String(meta.order).padStart(2, '0')}</span>
        {complete && (
          <span className="flex items-center gap-1 text-success text-xs">
            <Check className="h-3.5 w-3.5" /> Completato
          </span>
        )}
      </div>
      <h3 className="display text-xl mb-2 group-hover:text-pvj-gold transition-colors">{meta.title}</h3>
      <p className="text-sm text-pvj-navy/60">{meta.estimated_minutes} min · lezione + quiz + flashcard</p>
      {m?.quiz.bestScore !== null && m?.quiz.bestScore !== undefined && (
        <p className="mt-2 text-xs text-pvj-navy/50">Score: {Math.round(m.quiz.bestScore * 100)}%</p>
      )}
    </Link>
  )
}
