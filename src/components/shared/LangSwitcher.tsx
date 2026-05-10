'use client'
import { usePathname, useRouter } from '@/lib/i18n/routing'
import { useLocale } from 'next-intl'
import { clsx } from 'clsx'

export function LangSwitcher() {
  const locale = useLocale() as 'it' | 'en'
  const pathname = usePathname()
  const router = useRouter()

  const switchTo = (target: 'it' | 'en') => {
    if (target === locale) return
    router.replace(pathname, { locale: target })
  }

  return (
    <div className="flex gap-1 text-sm">
      {(['it', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          className={clsx(
            'px-2 py-1 uppercase tracking-wider transition-colors',
            l === locale ? 'text-pvj-navy font-semibold' : 'text-pvj-navy/50 hover:text-pvj-navy',
          )}
          aria-current={l === locale ? 'true' : undefined}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
