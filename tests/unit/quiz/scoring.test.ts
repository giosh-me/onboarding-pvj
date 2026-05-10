import { describe, it, expect } from 'vitest'
import { scoreAnswers } from '@/lib/quiz/scoring'
import type { QuizQuestion } from '@/lib/content/schemas'

const questions: QuizQuestion[] = [
  { id: 'q1', type: 'mcq', question: 'a', options: ['x', 'y', 'z'], correct_index: 0, explanation: '' },
  { id: 'q2', type: 'mcq', question: 'b', options: ['x', 'y', 'z'], correct_index: 2, explanation: '' },
  { id: 'q3', type: 'mcq', question: 'c', options: ['x', 'y', 'z'], correct_index: 1, explanation: '' },
]

describe('scoreAnswers', () => {
  it('counts correct answers', () => {
    expect(scoreAnswers(questions, { q1: 0, q2: 2, q3: 0 })).toEqual({ correct: 2, total: 3, wrongIds: ['q3'] })
  })
  it('handles missing answers as wrong', () => {
    expect(scoreAnswers(questions, { q1: 0 })).toEqual({ correct: 1, total: 3, wrongIds: ['q2', 'q3'] })
  })
  it('all correct', () => {
    expect(scoreAnswers(questions, { q1: 0, q2: 2, q3: 1 })).toEqual({ correct: 3, total: 3, wrongIds: [] })
  })
})
