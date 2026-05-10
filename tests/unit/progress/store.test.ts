import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readProgress, writeProgress, STORAGE_KEY } from '@/lib/progress/store'
import { emptyProgress } from '@/lib/progress/types'

describe('progress store', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-10T12:00:00Z'))
  })

  it('returns empty progress when localStorage is empty', () => {
    expect(readProgress()).toEqual(emptyProgress())
  })

  it('round-trips a written value', () => {
    const p = emptyProgress()
    p.startedAt = new Date().toISOString()
    p.locale = 'it'
    writeProgress(p)
    expect(readProgress()).toEqual(p)
  })

  it('returns empty when stored data has wrong version', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999 }))
    expect(readProgress()).toEqual(emptyProgress())
  })

  it('returns empty when stored data is malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not json')
    expect(readProgress()).toEqual(emptyProgress())
  })
})
