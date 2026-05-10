'use client'
import { clsx } from 'clsx'
import { Check, X } from 'lucide-react'
import type { QuizQuestion } from '@/lib/content/schemas'

export function QuestionCard({
  question,
  index,
  total,
  selected,
  revealed,
  onSelect,
}: {
  question: QuizQuestion
  index: number
  total: number
  selected: number | null
  revealed: boolean
  onSelect: (i: number) => void
}) {
  return (
    <div className="rounded-md border border-pvj-cream-200 bg-white p-6">
      <p className="text-xs uppercase tracking-wider text-pvj-navy/50 mb-2">
        Domanda {index + 1} / {total}
      </p>
      <h2 className="display text-xl mb-6">{question.question}</h2>
      <ul className="space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = revealed && i === question.correct_index
          const isWrong = revealed && isSelected && i !== question.correct_index
          return (
            <li key={i}>
              <button
                disabled={revealed}
                onClick={() => onSelect(i)}
                className={clsx(
                  'w-full text-left flex items-center gap-3 rounded-md border-2 px-4 py-3 transition',
                  !revealed && 'border-pvj-cream-200 hover:bg-pvj-navy-50',
                  isCorrect && 'border-success bg-success/5',
                  isWrong && 'border-error bg-error/5',
                  revealed && !isSelected && i !== question.correct_index && 'border-pvj-cream-200 opacity-60',
                )}
              >
                <span className="flex-1">{opt}</span>
                {isCorrect && <Check className="h-5 w-5 text-success" />}
                {isWrong && <X className="h-5 w-5 text-error" />}
              </button>
            </li>
          )
        })}
      </ul>
      {revealed && <p className="mt-4 text-sm text-pvj-navy/70">{question.explanation}</p>}
    </div>
  )
}
