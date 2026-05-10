import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('Footer')
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-pvj-cream-200 mt-16">
      <div className="mx-auto max-w-[960px] px-6 py-6 text-xs text-pvj-navy/50">
        © {year} {t('copyright')}
      </div>
    </footer>
  )
}
