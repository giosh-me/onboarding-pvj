'use client'
import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

export function SummaryHeader({ percent, totalTimeMs }: { percent: number; totalTimeMs: number }) {
  const t = useTranslations('Summary')
  const [name, setName] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setName(window.localStorage.getItem('pvj-onboarding-username') ?? '')
    }
  }, [])

  function update(v: string) {
    setName(v)
    if (typeof window !== 'undefined') window.localStorage.setItem('pvj-onboarding-username', v)
  }

  const minutes = Math.floor(totalTimeMs / 60_000)
  const hours = Math.floor(minutes / 60)
  const remMin = minutes % 60
  const timeStr = hours > 0 ? `${hours}h ${remMin}m` : `${remMin}m`

  return (
    <header className="text-center space-y-3 mb-12">
      <p className="text-sm uppercase tracking-wider text-pvj-gold">PVJets</p>
      <h1 className="display">
        {t('completed')}
        {name ? ` — ${name}` : ''}
      </h1>
      <input
        placeholder={t('namePlaceholder')}
        value={name}
        onChange={(e) => update(e.target.value)}
        className="border-b border-pvj-cream-200 bg-transparent text-center px-2 py-1 text-pvj-navy/70 focus:outline-none focus:border-pvj-gold"
      />
      <p className="text-pvj-navy/60">
        {t('totalTime', { time: timeStr })} · {Math.round(percent * 100)}%
      </p>
    </header>
  )
}
