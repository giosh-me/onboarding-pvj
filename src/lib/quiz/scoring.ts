import type { QuizQuestion } from '@/lib/content/schemas'

export interface ScoreResult {
  correct: number
  total: number
  wrongIds: string[]
}

export function scoreAnswers(
  questions: QuizQuestion[],
  answers: Record<string, number | undefined>,
): ScoreResult {
  let correct = 0
  const wrongIds: string[] = []
  for (const q of questions) {
    const a = answers[q.id]
    if (a === q.correct_index) correct += 1
    else wrongIds.push(q.id)
  }
  return { correct, total: questions.length, wrongIds }
}
