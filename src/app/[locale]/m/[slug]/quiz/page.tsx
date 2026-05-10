import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/lib/i18n/routing'
import { isModuleSlug, MODULE_ORDER } from '@/lib/content/module-order'
import { getModuleMeta } from '@/lib/content/load-module-meta'
import { getQuiz } from '@/lib/content/load-quiz'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of ['it', 'en']) for (const slug of MODULE_ORDER) params.push({ locale, slug })
  return params
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isModuleSlug(slug)) notFound()
  setRequestLocale(locale)
  const meta = await getModuleMeta(locale as 'it' | 'en', slug)
  const questions = await getQuiz(locale as 'it' | 'en', slug)
  const t = await getTranslations('Lesson')

  return (
    <section className="mx-auto max-w-[680px]">
      <p className="text-pvj-gold display text-sm mb-2">
        {t('moduleNumber', { n: meta.order })} · Quiz
      </p>
      <h1 className="display mb-8">{meta.title}</h1>
      <QuizPlayer slug={slug} questions={questions} />
      <div className="mt-12 flex items-center justify-between border-t border-pvj-cream-200 pt-6">
        <Link href={`/m/${slug}`} className="text-pvj-navy/60 hover:text-pvj-navy">
          {t('backToLesson')}
        </Link>
        <Link
          href={`/m/${slug}/flashcards`}
          className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700"
        >
          {t('toFlashcards')}
        </Link>
      </div>
    </section>
  )
}
