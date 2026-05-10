import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/lib/i18n/routing'
import { isModuleSlug, MODULE_ORDER, nextModuleSlug } from '@/lib/content/module-order'
import { getModuleMeta } from '@/lib/content/load-module-meta'
import { getFlashcards } from '@/lib/content/load-flashcards'
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck'

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of ['it', 'en']) for (const slug of MODULE_ORDER) params.push({ locale, slug })
  return params
}

export default async function FlashcardsPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isModuleSlug(slug)) notFound()
  setRequestLocale(locale)
  const meta = await getModuleMeta(locale as 'it' | 'en', slug)
  const cards = await getFlashcards(locale as 'it' | 'en', slug)
  const next = nextModuleSlug(slug)
  const t = await getTranslations('Lesson')

  return (
    <section className="mx-auto max-w-[680px]">
      <p className="text-pvj-gold display text-sm mb-2">
        {t('moduleNumber', { n: meta.order })} · Flashcard
      </p>
      <h1 className="display mb-8">{meta.title}</h1>
      <FlashcardDeck slug={slug} cards={cards} />
      <div className="mt-12 flex items-center justify-between border-t border-pvj-cream-200 pt-6">
        <Link href={`/m/${slug}/quiz`} className="text-pvj-navy/60 hover:text-pvj-navy">
          {t('backToQuiz')}
        </Link>
        {next ? (
          <Link
            href={`/m/${next}`}
            className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700"
          >
            {t('nextModule')}
          </Link>
        ) : (
          <Link
            href="/summary"
            className="rounded-md bg-pvj-gold px-4 py-2 text-pvj-navy hover:bg-pvj-gold-soft"
          >
            {t('toSummary')}
          </Link>
        )}
      </div>
    </section>
  )
}
