'use client'
import { useCallback, useSyncExternalStore } from 'react'
import { readProgress, writeProgress, clearProgress, STORAGE_KEY } from './store'
import { emptyModuleProgress, emptyProgress, type Progress } from './types'
import { computeStats, type Stats } from './stats'

const listeners = new Set<() => void>()
let cachedSnapshot: Progress | null = null
let cachedRaw: string | null = null
const emptyServerSnapshot: Progress = emptyProgress()

function invalidate() {
  cachedSnapshot = null
  cachedRaw = null
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      invalidate()
      cb()
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handler)
  }
  return () => {
    listeners.delete(cb)
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handler)
    }
  }
}

function notify() {
  invalidate()
  listeners.forEach((cb) => cb())
}

function getSnapshot(): Progress {
  if (typeof window === 'undefined') return emptyServerSnapshot
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? ''
  if (cachedRaw === raw && cachedSnapshot) return cachedSnapshot
  cachedRaw = raw
  cachedSnapshot = readProgress()
  return cachedSnapshot
}

function getServerSnapshot(): Progress {
  return emptyServerSnapshot
}

function update(mutator: (p: Progress) => Progress) {
  const next = mutator(readProgress())
  next.lastActivityAt = new Date().toISOString()
  if (!next.startedAt) next.startedAt = next.lastActivityAt
  writeProgress(next)
  notify()
}

function ensureModule(p: Progress, slug: string): Progress {
  if (p.modules[slug]) return p
  return { ...p, modules: { ...p.modules, [slug]: emptyModuleProgress() } }
}

export interface UseProgressApi {
  progress: Progress
  stats: Stats
  markLessonRead: (slug: string) => void
  recordQuizAttempt: (slug: string, correct: number, total: number) => void
  markFlashcardKnown: (slug: string, cardId: string) => void
  markFlashcardUnknown: (slug: string, cardId: string) => void
  resetFlashcardDeck: (slug: string) => void
  resetAll: () => void
}

export function useProgress(allSlugs: readonly string[]): UseProgressApi {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const stats = computeStats(progress, allSlugs)

  const markLessonRead = useCallback((slug: string) => {
    update((p) => {
      const next = ensureModule(p, slug)
      next.modules[slug] = {
        ...next.modules[slug],
        lessonReadAt: next.modules[slug].lessonReadAt ?? new Date().toISOString(),
      }
      return next
    })
  }, [])

  const recordQuizAttempt = useCallback((slug: string, correct: number, total: number) => {
    update((p) => {
      const next = ensureModule(p, slug)
      const score = total > 0 ? correct / total : 0
      const m = next.modules[slug]
      const attempts = [...m.quiz.attempts, { at: new Date().toISOString(), correct, total }]
      const bestScore = m.quiz.bestScore === null ? score : Math.max(m.quiz.bestScore, score)
      next.modules[slug] = { ...m, quiz: { attempts, bestScore } }
      return next
    })
  }, [])

  const markFlashcardKnown = useCallback((slug: string, cardId: string) => {
    update((p) => {
      const next = ensureModule(p, slug)
      const m = next.modules[slug]
      const known = m.flashcards.known.includes(cardId) ? m.flashcards.known : [...m.flashcards.known, cardId]
      const unknown = m.flashcards.unknown.filter((id) => id !== cardId)
      const completedAt =
        unknown.length === 0 && (known.length > 0 || m.flashcards.completedAt)
          ? m.flashcards.completedAt ?? new Date().toISOString()
          : m.flashcards.completedAt
      next.modules[slug] = { ...m, flashcards: { known, unknown, completedAt } }
      return next
    })
  }, [])

  const markFlashcardUnknown = useCallback((slug: string, cardId: string) => {
    update((p) => {
      const next = ensureModule(p, slug)
      const m = next.modules[slug]
      const unknown = m.flashcards.unknown.includes(cardId)
        ? m.flashcards.unknown
        : [...m.flashcards.unknown, cardId]
      const known = m.flashcards.known.filter((id) => id !== cardId)
      next.modules[slug] = { ...m, flashcards: { known, unknown, completedAt: null } }
      return next
    })
  }, [])

  const resetFlashcardDeck = useCallback((slug: string) => {
    update((p) => {
      const next = ensureModule(p, slug)
      const m = next.modules[slug]
      next.modules[slug] = { ...m, flashcards: { known: [], unknown: [], completedAt: null } }
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    clearProgress()
    notify()
  }, [])

  return {
    progress,
    stats,
    markLessonRead,
    recordQuizAttempt,
    markFlashcardKnown,
    markFlashcardUnknown,
    resetFlashcardDeck,
    resetAll,
  }
}
