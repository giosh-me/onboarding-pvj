import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProgress } from '@/lib/progress/use-progress'
import { STORAGE_KEY } from '@/lib/progress/store'

describe('useProgress', () => {
  beforeEach(() => localStorage.clear())

  it('starts empty', () => {
    const { result } = renderHook(() => useProgress(['welcome']))
    expect(result.current.progress.modules).toEqual({})
    expect(result.current.stats.modulesCompleted).toBe(0)
  })

  it('markLessonRead sets lessonReadAt', () => {
    const { result } = renderHook(() => useProgress(['welcome']))
    act(() => result.current.markLessonRead('welcome'))
    expect(result.current.progress.modules.welcome?.lessonReadAt).not.toBeNull()
  })

  it('recordQuizAttempt updates bestScore (only improvements)', () => {
    const { result } = renderHook(() => useProgress(['welcome']))
    act(() => result.current.recordQuizAttempt('welcome', 4, 5))
    expect(result.current.progress.modules.welcome?.quiz.bestScore).toBeCloseTo(0.8)
    act(() => result.current.recordQuizAttempt('welcome', 3, 5))
    expect(result.current.progress.modules.welcome?.quiz.bestScore).toBeCloseTo(0.8)
    act(() => result.current.recordQuizAttempt('welcome', 5, 5))
    expect(result.current.progress.modules.welcome?.quiz.bestScore).toBeCloseTo(1.0)
  })

  it('markFlashcardKnown moves card from unknown to known', () => {
    const { result } = renderHook(() => useProgress(['welcome']))
    act(() => result.current.markFlashcardUnknown('welcome', 'f-w-001'))
    act(() => result.current.markFlashcardKnown('welcome', 'f-w-001'))
    expect(result.current.progress.modules.welcome?.flashcards.known).toContain('f-w-001')
    expect(result.current.progress.modules.welcome?.flashcards.unknown).not.toContain('f-w-001')
  })

  it('resetAll clears localStorage and progress', () => {
    const { result } = renderHook(() => useProgress(['welcome']))
    act(() => result.current.markLessonRead('welcome'))
    act(() => result.current.resetAll())
    expect(result.current.progress.modules).toEqual({})
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
