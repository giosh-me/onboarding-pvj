'use client'
import { useTranslations } from 'next-intl'
import type { Progress } from '@/lib/progress/types'
import type { ModuleFrontmatter } from '@/lib/content/schemas'

export function ModuleScoreTable({
  progress,
  metas,
}: {
  progress: Progress
  metas: ModuleFrontmatter[]
}) {
  const t = useTranslations('Summary')
  return (
    <section className="mb-12">
      <h2 className="display mb-4">{t('modulesTitle')}</h2>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wider text-pvj-navy/50 border-b border-pvj-cream-200">
          <tr>
            <th className="py-2">#</th>
            <th>{t('colModule')}</th>
            <th>{t('colScore')}</th>
            <th>{t('colAttempts')}</th>
          </tr>
        </thead>
        <tbody>
          {metas.map((m) => {
            const mp = progress.modules[m.slug]
            const best = mp?.quiz.bestScore
            return (
              <tr key={m.slug} className="border-b border-pvj-cream-200/50">
                <td className="py-3 text-pvj-gold">{String(m.order).padStart(2, '0')}</td>
                <td>{m.title}</td>
                <td>{best !== null && best !== undefined ? `${Math.round(best * 100)}%` : '—'}</td>
                <td>{mp?.quiz.attempts.length ?? 0}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}
