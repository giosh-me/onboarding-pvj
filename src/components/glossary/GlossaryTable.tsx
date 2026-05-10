'use client'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/routing'
import type { Flashcard } from '@/lib/content/schemas'
import type { ModuleSlug } from '@/lib/content/module-order'

type Entry = Flashcard & { module: ModuleSlug }

export function GlossaryTable({ entries }: { entries: Entry[] }) {
  const t = useTranslations('Glossary')
  const [q, setQ] = useState('')
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return entries
    return entries.filter(
      (e) =>
        e.front.toLowerCase().includes(needle) ||
        e.back.toLowerCase().includes(needle) ||
        e.tags.some((tg) => tg.toLowerCase().includes(needle)),
    )
  }, [entries, q])

  return (
    <div>
      <input
        type="search"
        placeholder={t('searchPlaceholder')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded-md border border-pvj-cream-200 bg-white px-4 py-2 mb-6"
      />
      <p className="text-sm text-pvj-navy/50 mb-4">{t('count', { n: filtered.length })}</p>
      <ul className="space-y-3">
        {filtered.map((e) => (
          <li key={e.id} className="rounded-md border border-pvj-cream-200 bg-white p-4">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="display text-lg">{e.front}</h3>
              <Link href={`/m/${e.module}`} className="text-xs text-pvj-gold whitespace-nowrap">
                {e.module} →
              </Link>
            </div>
            <p className="mt-1 text-pvj-navy/80 text-sm">{e.back}</p>
            {e.tags.length > 0 && <p className="mt-2 text-xs text-pvj-navy/40">{e.tags.join(' · ')}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
