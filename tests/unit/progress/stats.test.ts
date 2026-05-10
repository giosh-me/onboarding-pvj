import { describe, it, expect } from 'vitest'
import { isModuleCompleted, computeStats } from '@/lib/progress/stats'
import { emptyProgress, emptyModuleProgress, type Progress } from '@/lib/progress/types'

describe('isModuleCompleted', () => {
  it('returns false when lesson not read', () => {
    const m = emptyModuleProgress()
    m.quiz.bestScore = 0.8
    m.flashcards.completedAt = '2026-05-10T12:00:00Z'
    expect(isModuleCompleted(m)).toBe(false)
  })

  it('returns false when quiz score below threshold', () => {
    const m = emptyModuleProgress()
    m.lessonReadAt = '2026-05-10T11:00:00Z'
    m.quiz.bestScore = 0.5
    m.flashcards.completedAt = '2026-05-10T12:00:00Z'
    expect(isModuleCompleted(m)).toBe(false)
  })

  it('returns false when flashcards not completed', () => {
    const m = emptyModuleProgress()
    m.lessonReadAt = '2026-05-10T11:00:00Z'
    m.quiz.bestScore = 0.8
    expect(isModuleCompleted(m)).toBe(false)
  })

  it('returns true when all conditions met', () => {
    const m = emptyModuleProgress()
    m.lessonReadAt = '2026-05-10T11:00:00Z'
    m.quiz.bestScore = 0.6
    m.flashcards.completedAt = '2026-05-10T12:00:00Z'
    expect(isModuleCompleted(m)).toBe(true)
  })
})

describe('computeStats', () => {
  it('all zeros for empty progress', () => {
    const s = computeStats(emptyProgress(), ['welcome', 'mission'])
    expect(s.modulesCompleted).toBe(0)
    expect(s.percentComplete).toBe(0)
    expect(s.avgScore).toBe(null)
  })

  it('counts completed modules and averages quiz scores', () => {
    const p = emptyProgress()
    const w = emptyModuleProgress()
    w.lessonReadAt = '2026-05-10T11:00:00Z'
    w.quiz.bestScore = 0.8
    w.flashcards.completedAt = '2026-05-10T12:00:00Z'
    const m = emptyModuleProgress()
    m.lessonReadAt = '2026-05-10T11:00:00Z'
    m.quiz.bestScore = 0.6
    m.flashcards.completedAt = '2026-05-10T12:00:00Z'
    p.modules = { welcome: w, mission: m }
    const s = computeStats(p, ['welcome', 'mission'])
    expect(s.modulesCompleted).toBe(2)
    expect(s.percentComplete).toBe(1)
    expect(s.avgScore).toBeCloseTo(0.7, 5)
  })
})
