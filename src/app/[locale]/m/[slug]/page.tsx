import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/lib/i18n/routing'
import { isModuleSlug, MODULE_ORDER } from '@/lib/content/module-order'
import { getModuleMeta } from '@/lib/content/load-module-meta'
import { LessonMarkRead } from './_lesson-mark-read'

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of ['it', 'en']) for (const slug of MODULE_ORDER) params.push({ locale, slug })
  return params
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isModuleSlug(slug)) notFound()
  setRequestLocale(locale)
  const meta = await getModuleMeta(locale as 'it' | 'en', slug)
  const t = await getTranslations('Lesson')

  const order = String(meta.order).padStart(2, '0')
  const Mdx = (await import(`@/content/${locale}/modules/${order}-${slug}.mdx`)).default

  return (
    <article className="mx-auto max-w-[680px]">
      <p className="text-pvj-gold display text-sm mb-2">{t('moduleNumber', { n: meta.order })}</p>
      <h1 className="display mb-4">{meta.title}</h1>
      <p className="text-pvj-navy/50 text-sm mb-10">{t('estimated', { n: meta.estimated_minutes })}</p>
      <Mdx />
      <LessonMarkRead slug={slug} />
      <div className="mt-12 flex items-center justify-between border-t border-pvj-cream-200 pt-6">
        <Link href="/" className="text-pvj-navy/60 hover:text-pvj-navy">
          {t('back')}
        </Link>
        <Link
          href={`/m/${slug}/quiz`}
          className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700"
        >
          {t('toQuiz')}
        </Link>
      </div>
    </article>
  )
}
