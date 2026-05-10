import { QUIZ_PASS_THRESHOLD } from '@/lib/config'
import type { ModuleProgress, Progress } from './types'

export function isModuleCompleted(m: ModuleProgress): boolean {
  if (!m.lessonReadAt) return false
  if (m.quiz.bestScore === null || m.quiz.bestScore < QUIZ_PASS_THRESHOLD) return false
  if (!m.flashcards.completedAt) return false
  return true
}

export interface Stats {
  modulesCompleted: number
  totalModules: number
  percentComplete: number
  avgScore: number | null
}

export function computeStats(p: Progress, slugs: readonly string[]): Stats {
  let completed = 0
  const scores: number[] = []
  for (const slug of slugs) {
    const m = p.modules[slug]
    if (!m) continue
    if (isModuleCompleted(m)) completed += 1
    if (m.quiz.bestScore !== null) scores.push(m.quiz.bestScore)
  }
  return {
    modulesCompleted: completed,
    totalModules: slugs.length,
    percentComplete: slugs.length > 0 ? completed / slugs.length : 0,
    avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
  }
}
