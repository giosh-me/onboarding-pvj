import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { routing } from '@/lib/i18n/routing'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  return (
    <NextIntlClientProvider>
      <Header />
      <main className="mx-auto max-w-[960px] px-6 py-12 min-h-[60vh]">
        {children}
      </main>
      <Footer />
    </NextIntlClientProvider>
  )
}
