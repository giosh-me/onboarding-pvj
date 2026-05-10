import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAllFlashcards } from '@/lib/content/load-flashcards'
import { GlossaryTable } from '@/components/glossary/GlossaryTable'

export default async function GlossaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const entries = await getAllFlashcards(locale as 'it' | 'en')
  entries.sort((a, b) => a.front.localeCompare(b.front))
  const t = await getTranslations('Glossary')
  return (
    <section>
      <h1 className="display mb-2">{t('title')}</h1>
      <p className="text-pvj-navy/60 mb-8">{t('subtitle')}</p>
      <GlossaryTable entries={entries} />
    </section>
  )
}
