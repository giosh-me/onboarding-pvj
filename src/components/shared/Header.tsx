import { Link } from '@/lib/i18n/routing'
import { useTranslations } from 'next-intl'
import { LangSwitcher } from './LangSwitcher'

export function Header() {
  const t = useTranslations('Header')
  return (
    <header className="border-b border-pvj-cream-200 bg-pvj-cream/80 backdrop-blur sticky top-0 z-10">
      <div className="mx-auto max-w-[960px] flex items-center justify-between px-6 py-4">
        <Link href="/" className="display text-lg font-medium text-pvj-navy">
          PVJets · SDR
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/glossary" className="text-pvj-navy/70 hover:text-pvj-navy">{t('glossaryLink')}</Link>
          <Link href="/summary" className="text-pvj-navy/70 hover:text-pvj-navy">{t('summaryLink')}</Link>
          <LangSwitcher />
        </nav>
      </div>
    </header>
  )
}
