'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useProgress } from '@/lib/progress/use-progress'
import { MODULE_ORDER, type ModuleSlug } from '@/lib/content/module-order'
import type { Flashcard } from '@/lib/content/schemas'
import { FlipCard } from './FlipCard'

export function FlashcardDeck({ slug, cards }: { slug: ModuleSlug; cards: Flashcard[] }) {
  const t = useTranslations('Flashcards')
  const { markFlashcardKnown, markFlashcardUnknown, resetFlashcardDeck } = useProgress(MODULE_ORDER)
  const [queue, setQueue] = useState<Flashcard[]>(cards)
  const [revealed, setRevealed] = useState(false)

  if (cards.length === 0) {
    return <p className="text-pvj-navy/60">{t('empty')}</p>
  }

  const card = queue[0]

  if (!card) {
    return (
      <div className="space-y-4 text-center">
        <p className="display text-2xl">{t('done')}</p>
        <button
          onClick={() => {
            resetFlashcardDeck(slug)
            setQueue(cards)
          }}
          className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700"
        >
          {t('reshuffle')}
        </button>
      </div>
    )
  }

  function answer(known: boolean) {
    if (known) {
      markFlashcardKnown(slug, card.id)
      setQueue((q) => q.slice(1))
    } else {
      markFlashcardUnknown(slug, card.id)
      setQueue((q) => [...q.slice(1), q[0]])
    }
    setRevealed(false)
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-pvj-navy/50">{t('remaining', { n: queue.length })}</p>
      <div onClick={() => setRevealed(true)}>
        <FlipCard front={card.front} back={card.back} />
      </div>
      {revealed && (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => answer(false)}
            className="rounded-md border-2 border-error/50 px-4 py-2 text-error hover:bg-error/5"
          >
            {t('didntKnow')}
          </button>
          <button
            onClick={() => answer(true)}
            className="rounded-md border-2 border-success/50 px-4 py-2 text-success hover:bg-success/5"
          >
            {t('knew')}
          </button>
        </div>
      )}
    </div>
  )
}
