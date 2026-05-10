'use client'
import { Link } from '@/lib/i18n/routing'
import { useTranslations } from 'next-intl'
import type { Flashcard } from '@/lib/content/schemas'
import type { ModuleSlug } from '@/lib/content/module-order'

export function FlashcardReviewList({
  items,
}: {
  items: Array<Flashcard & { module: ModuleSlug }>
}) {
  const t = useTranslations('Summary')
  if (items.length === 0) return <p className="text-pvj-navy/60">{t('flashcardReviewEmpty')}</p>
  return (
    <section className="mb-12">
      <h2 className="display mb-4">{t('reviewTitle', { n: items.length })}</h2>
      <ul className="space-y-2">
        {items.map((c) => (
          <li
            key={c.id}
            className="rounded-md border border-pvj-cream-200 bg-white p-3 flex items-baseline justify-between gap-4"
          >
            <div>
              <p className="display">{c.front}</p>
              <p className="text-xs text-pvj-navy/50 mt-0.5">{c.module}</p>
            </div>
            <Link
              href={`/m/${c.module}/flashcards`}
              className="text-xs text-pvj-gold whitespace-nowrap"
            >
              {t('reviewLink')}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
