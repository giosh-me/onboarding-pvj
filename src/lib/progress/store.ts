import { type Progress, emptyProgress, PROGRESS_VERSION } from './types'

export const STORAGE_KEY = 'pvj-onboarding-progress-v1'

export function readProgress(): Progress {
  if (typeof window === 'undefined') return emptyProgress()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw)
    if (parsed?.version !== PROGRESS_VERSION) return emptyProgress()
    return parsed as Progress
  } catch {
    return emptyProgress()
  }
}

export function writeProgress(p: Progress): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    // localStorage may be full or disabled — silently ignore
  }
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
