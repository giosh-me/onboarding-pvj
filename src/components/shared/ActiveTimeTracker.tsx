'use client'
import { useEffect } from 'react'
import { readProgress, writeProgress } from '@/lib/progress/store'

const TICK_MS = 5_000

export function ActiveTimeTracker() {
  useEffect(() => {
    let last = Date.now()
    let id: number | null = null

    function tick() {
      if (document.visibilityState !== 'visible') return
      const now = Date.now()
      const delta = now - last
      last = now
      const p = readProgress()
      writeProgress({
        ...p,
        totalTimeMs: p.totalTimeMs + delta,
        lastActivityAt: new Date().toISOString(),
      })
    }

    function start() {
      last = Date.now()
      id = window.setInterval(tick, TICK_MS)
    }
    function stop() {
      if (id !== null) {
        window.clearInterval(id)
        id = null
      }
    }
    function onVis() {
      if (document.visibilityState === 'visible') start()
      else stop()
    }

    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])
  return null
}
