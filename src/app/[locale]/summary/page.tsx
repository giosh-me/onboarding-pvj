import { setRequestLocale } from 'next-intl/server'
import { getAllModuleMeta } from '@/lib/content/load-module-meta'
import { getAllFlashcards } from '@/lib/content/load-flashcards'
import { SummaryClient } from './_summary-client'

export default async function SummaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const metas = await getAllModuleMeta(locale as 'it' | 'en')
  const allFlashcards = await getAllFlashcards(locale as 'it' | 'en')
  return <SummaryClient metas={metas} allFlashcards={allFlashcards} />
}
