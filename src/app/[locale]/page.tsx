import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  return <ComingSoon />
}

function ComingSoon() {
  const t = useTranslations('Common')
  return (
    <section className="text-center py-16">
      <h1 className="display mb-4">{t('appName')}</h1>
      <p className="text-pvj-navy/60 text-lg">{t('comingSoon')}</p>
      <p className="text-pvj-navy/40 mt-2">{t('comingSoonBody')}</p>
    </section>
  )
}
