'use client'
import { useProgress } from '@/lib/progress/use-progress'
import { MODULE_ORDER } from '@/lib/content/module-order'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/routing'
import { SummaryHeader } from '@/components/summary/SummaryHeader'
import { ModuleScoreTable } from '@/components/summary/ModuleScoreTable'
import { FlashcardReviewList } from '@/components/summary/FlashcardReviewList'
import { ResetDialog } from '@/components/shared/ResetDialog'
import type { ModuleFrontmatter, Flashcard } from '@/lib/content/schemas'
import type { ModuleSlug } from '@/lib/content/module-order'

export function SummaryClient({
  metas,
  allFlashcards,
}: {
  metas: ModuleFrontmatter[]
  allFlashcards: Array<Flashcard & { module: ModuleSlug }>
}) {
  const t = useTranslations('Summary')
  const { progress, stats, resetAll } = useProgress(MODULE_ORDER)
  const incomplete = stats.modulesCompleted < stats.totalModules

  const unknownIds = new Set<string>()
  for (const slug of MODULE_ORDER) {
    const mp = progress.modules[slug]
    mp?.flashcards.unknown.forEach((id) => unknownIds.add(id))
  }
  const reviewItems = allFlashcards.filter((c) => unknownIds.has(c.id))

  if (incomplete) {
    const missing = metas.filter(
      (m) => !progress.modules[m.slug] || progress.modules[m.slug].quiz.bestScore === null,
    )
    return (
      <section className="text-center py-16">
        <h1 className="display mb-4">{t('lockedTitle')}</h1>
        <p className="text-pvj-navy/60 mb-8">
          {t('lockedBody', { done: stats.modulesCompleted, total: stats.totalModules })}
        </p>
        <ul className="text-left max-w-md mx-auto space-y-1 mb-8">
          {missing.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/m/${m.slug}`}
                className="text-pvj-gold underline-offset-4 hover:underline"
              >
                {m.order}. {m.title}
              </Link>
            </li>
          ))}
        </ul>
        <Link href="/" className="text-pvj-navy/60 hover:text-pvj-navy">
          ← Dashboard
        </Link>
      </section>
    )
  }

  return (
    <article className="mx-auto max-w-[720px]">
      <SummaryHeader percent={stats.percentComplete} totalTimeMs={progress.totalTimeMs} />
      <ModuleScoreTable progress={progress} metas={metas} />
      <FlashcardReviewList items={reviewItems} />
      <div className="mt-12 flex items-center justify-between border-t border-pvj-cream-200 pt-6 no-print">
        <button
          onClick={() => window.print()}
          className="rounded-md border border-pvj-navy/20 px-4 py-2 text-pvj-navy hover:bg-pvj-navy-50"
        >
          {t('print')}
        </button>
        <ResetDialog onConfirm={resetAll} />
      </div>
    </article>
  )
}
