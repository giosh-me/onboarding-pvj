export const PROGRESS_VERSION = 1 as const

export interface QuizAttempt {
  at: string
  correct: number
  total: number
}

export interface ModuleProgress {
  lessonReadAt: string | null
  quiz: { attempts: QuizAttempt[]; bestScore: number | null }
  flashcards: { known: string[]; unknown: string[]; completedAt: string | null }
}

export interface Progress {
  version: typeof PROGRESS_VERSION
  startedAt: string | null
  lastActivityAt: string | null
  totalTimeMs: number
  locale: 'it' | 'en' | null
  modules: Record<string, ModuleProgress>
}

export function emptyModuleProgress(): ModuleProgress {
  return {
    lessonReadAt: null,
    quiz: { attempts: [], bestScore: null },
    flashcards: { known: [], unknown: [], completedAt: null },
  }
}

export function emptyProgress(): Progress {
  return {
    version: PROGRESS_VERSION,
    startedAt: null,
    lastActivityAt: null,
    totalTimeMs: 0,
    locale: null,
    modules: {},
  }
}
