import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAllModuleMeta } from '@/lib/content/load-module-meta'
import { Dashboard } from './_dashboard'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const metas = await getAllModuleMeta(locale as 'it' | 'en')
  const t = await getTranslations('Dashboard')
  return <Dashboard metas={metas} title={t('title')} subtitle={t('subtitle')} />
}
