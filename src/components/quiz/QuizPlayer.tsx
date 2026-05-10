'use client'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { QuizQuestion } from '@/lib/content/schemas'
import { scoreAnswers } from '@/lib/quiz/scoring'
import { useProgress } from '@/lib/progress/use-progress'
import { MODULE_ORDER, type ModuleSlug } from '@/lib/content/module-order'
import { QuestionCard } from './QuestionCard'
import { ResultBar } from './ResultBar'

export function QuizPlayer({ slug, questions }: { slug: ModuleSlug; questions: QuizQuestion[] }) {
  const t = useTranslations('Quiz')
  const { recordQuizAttempt } = useProgress(MODULE_ORDER)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [revealedFor, setRevealedFor] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState(false)

  const q = questions[index]
  const result = useMemo(() => (done ? scoreAnswers(questions, answers) : null), [done, questions, answers])

  function select(i: number) {
    if (revealedFor[q.id]) return
    setAnswers((a) => ({ ...a, [q.id]: i }))
    setRevealedFor((r) => ({ ...r, [q.id]: true }))
  }

  function next() {
    if (index < questions.length - 1) setIndex(index + 1)
    else {
      const r = scoreAnswers(questions, answers)
      recordQuizAttempt(slug, r.correct, r.total)
      setDone(true)
    }
  }

  function retryWrong() {
    if (!result) return
    const wrongQs = questions.filter((qq) => result.wrongIds.includes(qq.id))
    if (wrongQs.length === 0) return
    setAnswers({})
    setRevealedFor({})
    setIndex(0)
    setDone(false)
  }

  if (questions.length === 0) {
    return <p className="text-pvj-navy/60">{t('emptyQuiz')}</p>
  }

  if (done && result) {
    return (
      <div className="space-y-6">
        <ResultBar correct={result.correct} total={result.total} />
        {result.wrongIds.length > 0 && (
          <button
            onClick={retryWrong}
            className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700"
          >
            {t('retryWrong')}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <QuestionCard
        question={q}
        index={index}
        total={questions.length}
        selected={answers[q.id] ?? null}
        revealed={!!revealedFor[q.id]}
        onSelect={select}
      />
      {revealedFor[q.id] && (
        <div className="text-right">
          <button onClick={next} className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700">
            {index < questions.length - 1 ? t('next') : t('finish')}
          </button>
        </div>
      )}
    </div>
  )
}
