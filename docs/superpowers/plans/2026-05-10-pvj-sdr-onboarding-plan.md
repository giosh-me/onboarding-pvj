# PVJets SDR Onboarding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive bilingual (IT/EN) onboarding micro-site for new PVJets SDRs — 11 modules of short lessons + mini-quizzes + flashcards, fully static (Next.js + MDX + localStorage), deployed on Vercel from `main`.

**Architecture:** Next.js 15 App Router with `next-intl` for `/it` and `/en` locale prefixes. Lessons in MDX, quiz/flashcard data in JSON validated by zod at build. Progress lives only in `localStorage` via `useSyncExternalStore`. No backend, no DB, no auth.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind v4, next-intl, @next/mdx, zod, vitest, @playwright/test, pnpm.

**Reference spec:** [`docs/superpowers/specs/2026-05-10-pvj-sdr-onboarding-design.md`](../specs/2026-05-10-pvj-sdr-onboarding-design.md).

**Repo:** working directory `/Users/giorgiopluchino/Desktop/Claud/Clienti/RG-PVJ/PVJ/Onboarding/` is the root of `https://github.com/giosh-me/onboarding-pvj` (branch `main`). The Next.js project lives directly at the repo root, not in a sub-folder.

---

## File Structure (target end state)

```
Onboarding/                           ← repo root
├── .gitignore                        ← exists
├── README.md                         ← exists
├── package.json
├── pnpm-lock.yaml
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
├── playwright.config.ts
├── vitest.config.ts
├── vitest.setup.ts
├── docs/superpowers/
│   ├── specs/2026-05-10-pvj-sdr-onboarding-design.md     ← exists
│   └── plans/2026-05-10-pvj-sdr-onboarding-plan.md       ← this file
├── content/
│   ├── it/
│   │   ├── modules/
│   │   │   ├── 01-welcome.mdx
│   │   │   ├── 02-mission.mdx
│   │   │   ├── 03-global-reach.mdx
│   │   │   ├── 04-charter-membership.mdx
│   │   │   ├── 05-fleet.mdx
│   │   │   ├── 06-sustainability.mdx
│   │   │   ├── 07-private-aviation-market.mdx
│   │   │   ├── 08-aircraft-types.mdx
│   │   │   ├── 09-lead-qualification.mdx
│   │   │   ├── 10-whatsapp-communication.mdx
│   │   │   └── 11-scenarios.mdx
│   │   ├── quizzes.json
│   │   └── flashcards.json
│   └── en/                                ← mirror of it/, same slugs/ids/order
├── extracted/raw/                          ← gitignored
├── public/
│   ├── favicon.ico
│   └── images/                              ← logo + hero + maps + jets
├── scripts/
│   ├── extract-sources.ts                  ← pdftotext + pandoc + cheerio → extracted/raw
│   ├── validate-content.ts                 ← zod check, runs in prebuild
│   └── generate-glossary.ts                ← aggregates flashcards
├── src/
│   ├── app/
│   │   ├── layout.tsx                       ← root layout with fonts only
│   │   ├── globals.css                      ← Tailwind v4 import + brand tokens
│   │   ├── not-found.tsx
│   │   └── [locale]/
│   │       ├── layout.tsx                   ← header + main + footer
│   │       ├── page.tsx                      ← dashboard
│   │       ├── m/[slug]/page.tsx             ← lesson
│   │       ├── m/[slug]/quiz/page.tsx
│   │       ├── m/[slug]/flashcards/page.tsx
│   │       ├── glossary/page.tsx
│   │       └── summary/page.tsx
│   ├── components/
│   │   ├── lesson/
│   │   │   ├── Callout.tsx
│   │   │   ├── KeyFact.tsx
│   │   │   ├── Comparison.tsx
│   │   │   ├── ImageFigure.tsx
│   │   │   ├── Aside.tsx
│   │   │   ├── FleetSpecCard.tsx
│   │   │   └── mdx-components.ts            ← export object for MDX
│   │   ├── quiz/
│   │   │   ├── QuizPlayer.tsx
│   │   │   ├── QuestionCard.tsx
│   │   │   └── ResultBar.tsx
│   │   ├── flashcards/
│   │   │   ├── FlashcardDeck.tsx
│   │   │   └── FlipCard.tsx
│   │   ├── dashboard/
│   │   │   ├── ModuleCard.tsx
│   │   │   └── ProgressRing.tsx
│   │   ├── glossary/
│   │   │   └── GlossaryTable.tsx
│   │   ├── summary/
│   │   │   ├── SummaryHeader.tsx
│   │   │   ├── ModuleScoreTable.tsx
│   │   │   └── FlashcardReviewList.tsx
│   │   └── shared/
│   │       ├── Header.tsx
│   │       ├── LangSwitcher.tsx
│   │       ├── Footer.tsx
│   │       └── ResetDialog.tsx
│   ├── lib/
│   │   ├── progress/
│   │   │   ├── types.ts
│   │   │   ├── store.ts                     ← localStorage adapter
│   │   │   ├── use-progress.ts              ← React hook
│   │   │   └── stats.ts                      ← derived stats helpers
│   │   ├── content/
│   │   │   ├── schemas.ts                   ← zod schemas for quiz + flashcard
│   │   │   ├── load-quiz.ts
│   │   │   ├── load-flashcards.ts
│   │   │   ├── load-module-meta.ts          ← reads MDX frontmatter via gray-matter
│   │   │   └── module-order.ts              ← canonical order constant
│   │   ├── i18n/
│   │   │   ├── routing.ts                   ← next-intl routing config
│   │   │   └── request.ts
│   │   └── config.ts                         ← QUIZ_PASS_THRESHOLD = 0.6 etc.
│   ├── messages/
│   │   ├── it.json
│   │   └── en.json
│   └── middleware.ts                         ← next-intl middleware
└── tests/
    ├── unit/                                 ← vitest
    │   ├── progress/
    │   │   ├── store.test.ts
    │   │   ├── use-progress.test.tsx
    │   │   └── stats.test.ts
    │   ├── content/
    │   │   └── schemas.test.ts
    │   └── quiz/
    │       └── scoring.test.ts
    └── e2e/                                  ← playwright
        ├── dashboard.spec.ts
        ├── module-flow.spec.ts
        ├── lang-switch.spec.ts
        ├── reset.spec.ts
        └── summary.spec.ts
```

---

## Phases overview

| Phase | Goal | Output |
|---|---|---|
| 0 | Scaffolding + Vercel "coming soon" deploy | Empty Next.js app live at `*.vercel.app` |
| 1 | Core engine: schemas, loaders, progress hook, players, dashboard | First module placeholder fully wired |
| 2 | Modules 1–3 IT (Welcome, Mission, Global Reach) | 3 lessons + quizzes + flashcards in IT |
| 3 | Modules 4–6 IT (Charter, Fleet, Sustainability) | 3 more |
| 4 | Modules 7–8 IT (Market, Aircraft) | 2 more |
| 5 | Modules 9–11 IT (Lead qual, WhatsApp, Scenarios) | 3 more, 11 total |
| 6 | Glossary + Summary + Reset | Final UX surfaces |
| 7 | EN translation of all 11 modules | Bilingual content |
| 8 | Polish, smoke E2E, production cutover | Production deploy |

Each phase ends with a green CI build, a Vercel preview verified, and a merged PR.

---

# Phase 0 — Scaffolding + Vercel "coming soon" deploy

**Goal:** an empty but bilingual Next.js app live on Vercel, with brand tokens, fonts, and CI passing.

## Task 0.1: Initialize Next.js project at repo root

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`

- [ ] **Step 1: Confirm repo state**

```bash
git status
git log --oneline -5
```

Expected: clean tree on `main`, one commit (`docs: add PVJets SDR onboarding design spec`).

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "pvj-sdr-onboarding",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "validate-content": "tsx scripts/validate-content.ts",
    "extract-sources": "tsx scripts/extract-sources.ts",
    "generate-glossary": "tsx scripts/generate-glossary.ts",
    "prebuild": "pnpm validate-content"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-intl": "^3.20.0",
    "@next/mdx": "^15.0.0",
    "@mdx-js/react": "^3.0.0",
    "@mdx-js/loader": "^3.0.0",
    "gray-matter": "^4.0.3",
    "zod": "^3.23.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.460.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/mdx": "^2.0.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "vitest": "^2.1.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "jsdom": "^25.0.0",
    "@playwright/test": "^1.48.0",
    "tsx": "^4.19.0",
    "mammoth": "^1.8.0",
    "pdf-parse": "^1.1.1",
    "cheerio": "^1.0.0"
  },
  "packageManager": "pnpm@9.12.0"
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@/content/*": ["./content/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create `next.config.ts`**

```ts
import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
import createNextIntlPlugin from 'next-intl/plugin'

const withMDX = createMDX({
  extension: /\.mdx?$/,
})

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts')

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  experimental: {
    mdxRs: false, // we use MDX components, not the Rust-only mode
  },
}

export default withNextIntl(withMDX(nextConfig))
```

- [ ] **Step 5: Create `postcss.config.mjs`**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

- [ ] **Step 6: Create `eslint.config.mjs`**

```js
import nextPlugin from 'eslint-config-next'

export default [
  ...nextPlugin,
  {
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]
```

- [ ] **Step 7: Install dependencies**

```bash
pnpm install
```

Expected: lockfile created, no errors. `pnpm-lock.yaml` appears.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs
git commit -m "chore: initialize Next.js 15 + Tailwind v4 + next-intl scaffold"
```

---

## Task 0.2: Brand tokens, fonts, root layout

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `public/favicon.ico` (placeholder, single transparent pixel)

- [ ] **Step 1: Create `src/app/globals.css`**

```css
@import 'tailwindcss';

@theme {
  --color-pvj-navy: oklch(20% 0.04 260);
  --color-pvj-navy-700: oklch(28% 0.04 260);
  --color-pvj-navy-50: oklch(96% 0.005 260);
  --color-pvj-cream: oklch(97% 0.012 80);
  --color-pvj-cream-200: oklch(92% 0.018 80);
  --color-pvj-gold: oklch(72% 0.13 80);
  --color-pvj-gold-soft: oklch(85% 0.07 80);
  --color-success: oklch(58% 0.13 145);
  --color-error: oklch(55% 0.16 25);

  --font-display: var(--font-fraunces);
  --font-sans: var(--font-inter);
}

:root {
  --text-display: clamp(2.5rem, 1.5rem + 3vw, 4rem);
  --text-h1: clamp(1.8rem, 1.3rem + 1.6vw, 2.6rem);
  --text-h2: clamp(1.4rem, 1.1rem + 1vw, 1.9rem);
  --text-body: 1.0625rem;
  --text-small: 0.875rem;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}

html, body {
  background: var(--color-pvj-cream);
  color: var(--color-pvj-navy);
  font-family: var(--font-sans), system-ui, sans-serif;
  font-size: var(--text-body);
  line-height: 1.6;
}

h1, h2, h3, .display {
  font-family: var(--font-display), Georgia, serif;
  font-weight: 500;
  letter-spacing: -0.01em;
}

h1 { font-size: var(--text-h1); }
h2 { font-size: var(--text-h2); }

@media print {
  header, footer, nav, .no-print { display: none !important; }
  body { background: white; color: black; }
}
```

- [ ] **Step 2: Create `src/app/layout.tsx`**

```tsx
import { Fraunces, Inter } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PVJets — SDR Onboarding',
  description: 'Internal onboarding for PVJets SDRs',
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Place a 1×1 transparent favicon**

```bash
# Create a minimal 1x1 PNG and treat it as ico fallback
node -e "require('fs').writeFileSync('public/favicon.ico', Buffer.from('AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAA' + 'A'.repeat(1400), 'base64'))"
```

(A real branded favicon will be added in Phase 8.)

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css public/favicon.ico
git commit -m "feat(scaffold): add brand tokens, Fraunces+Inter fonts, root layout"
```

---

## Task 0.3: next-intl routing — `/it` and `/en`

**Files:**
- Create: `src/lib/i18n/routing.ts`
- Create: `src/lib/i18n/request.ts`
- Create: `src/middleware.ts`
- Create: `src/messages/it.json`
- Create: `src/messages/en.json`

- [ ] **Step 1: Create `src/lib/i18n/routing.ts`**

```ts
import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const routing = defineRouting({
  locales: ['it', 'en'],
  defaultLocale: 'it',
  localePrefix: 'always',
})

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)
```

- [ ] **Step 2: Create `src/lib/i18n/request.ts`**

```ts
import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!locale || !routing.locales.includes(locale as 'it' | 'en')) {
    locale = routing.defaultLocale
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
```

- [ ] **Step 3: Create `src/middleware.ts`**

```ts
import createMiddleware from 'next-intl/middleware'
import { routing } from './lib/i18n/routing'

export default createMiddleware(routing)

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
```

- [ ] **Step 4: Create `src/messages/it.json`**

```json
{
  "Common": {
    "appName": "PVJets — Onboarding SDR",
    "comingSoon": "In costruzione",
    "comingSoonBody": "Il percorso di onboarding sarà disponibile a breve."
  },
  "Header": {
    "dashboardLink": "Dashboard",
    "glossaryLink": "Glossario",
    "summaryLink": "Sintesi"
  },
  "Footer": {
    "copyright": "PVJets — uso interno"
  }
}
```

- [ ] **Step 5: Create `src/messages/en.json`**

```json
{
  "Common": {
    "appName": "PVJets — SDR Onboarding",
    "comingSoon": "Coming soon",
    "comingSoonBody": "The onboarding journey will be available shortly."
  },
  "Header": {
    "dashboardLink": "Dashboard",
    "glossaryLink": "Glossary",
    "summaryLink": "Summary"
  },
  "Footer": {
    "copyright": "PVJets — internal use"
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/i18n src/middleware.ts src/messages
git commit -m "feat(i18n): add next-intl routing with /it and /en locales"
```

---

## Task 0.4: Locale layout, header, footer, lang switcher, "coming soon" page

**Files:**
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/app/[locale]/page.tsx`
- Create: `src/components/shared/Header.tsx`
- Create: `src/components/shared/Footer.tsx`
- Create: `src/components/shared/LangSwitcher.tsx`

- [ ] **Step 1: Create `src/components/shared/LangSwitcher.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `src/components/shared/Header.tsx`**

```tsx
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
```

- [ ] **Step 3: Create `src/components/shared/Footer.tsx`**

```tsx
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
```

- [ ] **Step 4: Create `src/app/[locale]/layout.tsx`**

```tsx
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
```

- [ ] **Step 5: Create `src/app/[locale]/page.tsx`**

```tsx
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
```

- [ ] **Step 6: Test locally**

```bash
pnpm dev
```

Expected: open `http://localhost:3000` → redirect to `/it` → "Coming soon" page in IT. Click `EN` → URL becomes `/en` → text in English.

- [ ] **Step 7: Commit**

```bash
git add src/app/[locale] src/components/shared
git commit -m "feat(scaffold): add locale layout, header/footer, lang switcher, coming soon page"
```

---

## Task 0.5: Vitest + Playwright config (no tests yet, just plumbing)

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`
- Create: `tests/unit/.gitkeep`
- Create: `tests/e2e/.gitkeep`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['tests/unit/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/content': path.resolve(__dirname, './content'),
    },
  },
})
```

- [ ] **Step 2: Create `vitest.setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : { command: 'pnpm dev', url: 'http://localhost:3000', reuseExistingServer: true, timeout: 120_000 },
})
```

- [ ] **Step 4: Empty test directories**

```bash
mkdir -p tests/unit tests/e2e
touch tests/unit/.gitkeep tests/e2e/.gitkeep
```

- [ ] **Step 5: Verify both runners**

```bash
pnpm test
pnpm test:e2e --list
```

Expected: vitest "no tests collected" (exit 0 ok with `--passWithNoTests`? if it fails because no tests, pass `--passWithNoTests` in script, or accept that and revisit). Playwright `--list` shows "No tests found".

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts vitest.setup.ts playwright.config.ts tests
git commit -m "chore(test): add vitest + playwright configuration"
```

---

## Task 0.6: First Vercel deploy

**Files:**
- (none new) — uses Vercel auto-detect

- [ ] **Step 1: Push branch and import on Vercel**

```bash
git push origin main
```

Then in Vercel dashboard (manual):
- Import `giosh-me/onboarding-pvj`
- Framework preset: Next.js (auto-detected)
- Build command: `pnpm build` (default)
- Output: `.next` (default)
- Env vars: none

- [ ] **Step 2: Wait for first deploy and verify**

```bash
gh repo view giosh-me/onboarding-pvj --json url
# After Vercel finishes:
curl -sI https://onboarding-pvj.vercel.app | head -1
```

Expected: `HTTP/2 200`. Open `/it` in browser → "Coming soon".

- [ ] **Step 3: Tag the milestone**

```bash
git tag -a phase-0-scaffolding -m "Phase 0 complete: scaffolding + Vercel deploy"
git push origin phase-0-scaffolding
```

---

# Phase 1 — Core engine

**Goal:** all infrastructure for lessons / quizzes / flashcards / progress, with a single placeholder module wired end-to-end so we can prove the loop works before producing real content.

## Task 1.1: zod schemas for content

**Files:**
- Create: `src/lib/content/schemas.ts`
- Create: `tests/unit/content/schemas.test.ts`

- [ ] **Step 1: Write the failing test `tests/unit/content/schemas.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { quizFileSchema, flashcardFileSchema } from '@/lib/content/schemas'

describe('quizFileSchema', () => {
  it('accepts a valid quiz file', () => {
    const valid = {
      welcome: [
        { id: 'q-w-001', type: 'mcq', question: 'X?', options: ['a','b','c','d'], correct_index: 1, explanation: '...' }
      ]
    }
    expect(() => quizFileSchema.parse(valid)).not.toThrow()
  })

  it('rejects correct_index out of range', () => {
    const bad = {
      welcome: [
        { id: 'q-w-002', type: 'mcq', question: 'X?', options: ['a','b'], correct_index: 5, explanation: '...' }
      ]
    }
    expect(() => quizFileSchema.parse(bad)).toThrow()
  })

  it('rejects fewer than 2 options', () => {
    const bad = {
      welcome: [
        { id: 'q-w-003', type: 'mcq', question: 'X?', options: ['a'], correct_index: 0, explanation: '...' }
      ]
    }
    expect(() => quizFileSchema.parse(bad)).toThrow()
  })
})

describe('flashcardFileSchema', () => {
  it('accepts a valid flashcards file', () => {
    const valid = {
      welcome: [
        { id: 'f-w-001', front: 'X', back: 'Y', tags: ['t1'] }
      ]
    }
    expect(() => flashcardFileSchema.parse(valid)).not.toThrow()
  })

  it('rejects missing back', () => {
    const bad = { welcome: [{ id: 'f-w-002', front: 'X' }] }
    expect(() => flashcardFileSchema.parse(bad)).toThrow()
  })
})
```

- [ ] **Step 2: Run test (expect fail)**

```bash
pnpm test tests/unit/content/schemas.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/content/schemas.ts`**

```ts
import { z } from 'zod'

export const quizQuestionSchema = z
  .object({
    id: z.string().min(1),
    type: z.literal('mcq'),
    question: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(6),
    correct_index: z.number().int().min(0),
    explanation: z.string().min(1),
    source: z.string().optional(),
  })
  .refine((q) => q.correct_index < q.options.length, {
    message: 'correct_index must be a valid index of options',
    path: ['correct_index'],
  })

export const quizFileSchema = z.record(z.string(), z.array(quizQuestionSchema))

export const flashcardSchema = z.object({
  id: z.string().min(1),
  front: z.string().min(1),
  back: z.string().min(1),
  tags: z.array(z.string()).default([]),
})

export const flashcardFileSchema = z.record(z.string(), z.array(flashcardSchema))

export const moduleFrontmatterSchema = z.object({
  slug: z.string().min(1),
  order: z.number().int().min(1),
  title: z.string().min(1),
  estimated_minutes: z.number().int().min(1),
  sources: z.array(z.string()).default([]),
})

export type QuizQuestion = z.infer<typeof quizQuestionSchema>
export type Flashcard = z.infer<typeof flashcardSchema>
export type ModuleFrontmatter = z.infer<typeof moduleFrontmatterSchema>
```

- [ ] **Step 4: Run test (expect pass)**

```bash
pnpm test tests/unit/content/schemas.test.ts
```

Expected: 5 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/schemas.ts tests/unit/content/schemas.test.ts
git commit -m "feat(content): add zod schemas for quizzes, flashcards, module frontmatter"
```

---

## Task 1.2: Module order constant + content loaders

**Files:**
- Create: `src/lib/content/module-order.ts`
- Create: `src/lib/content/load-quiz.ts`
- Create: `src/lib/content/load-flashcards.ts`
- Create: `src/lib/content/load-module-meta.ts`

- [ ] **Step 1: Create `src/lib/content/module-order.ts`**

```ts
export const MODULE_ORDER = [
  'welcome',
  'mission',
  'global-reach',
  'charter-membership',
  'fleet',
  'sustainability',
  'private-aviation-market',
  'aircraft-types',
  'lead-qualification',
  'whatsapp-communication',
  'scenarios',
] as const

export type ModuleSlug = typeof MODULE_ORDER[number]

export function isModuleSlug(s: string): s is ModuleSlug {
  return (MODULE_ORDER as readonly string[]).includes(s)
}

export function nextModuleSlug(current: ModuleSlug): ModuleSlug | null {
  const idx = MODULE_ORDER.indexOf(current)
  return idx >= 0 && idx < MODULE_ORDER.length - 1 ? MODULE_ORDER[idx + 1] : null
}
```

- [ ] **Step 2: Create `src/lib/content/load-quiz.ts`**

```ts
import 'server-only'
import { quizFileSchema, type QuizQuestion } from './schemas'
import type { ModuleSlug } from './module-order'

type Locale = 'it' | 'en'

const cache = new Map<Locale, ReturnType<typeof quizFileSchema.parse>>()

async function loadQuizFile(locale: Locale) {
  if (cache.has(locale)) return cache.get(locale)!
  const data = (await import(`@/content/${locale}/quizzes.json`)).default
  const parsed = quizFileSchema.parse(data)
  cache.set(locale, parsed)
  return parsed
}

export async function getQuiz(locale: Locale, slug: ModuleSlug): Promise<QuizQuestion[]> {
  const file = await loadQuizFile(locale)
  return file[slug] ?? []
}
```

- [ ] **Step 3: Create `src/lib/content/load-flashcards.ts`**

```ts
import 'server-only'
import { flashcardFileSchema, type Flashcard } from './schemas'
import type { ModuleSlug } from './module-order'

type Locale = 'it' | 'en'

const cache = new Map<Locale, ReturnType<typeof flashcardFileSchema.parse>>()

async function loadFlashcardFile(locale: Locale) {
  if (cache.has(locale)) return cache.get(locale)!
  const data = (await import(`@/content/${locale}/flashcards.json`)).default
  const parsed = flashcardFileSchema.parse(data)
  cache.set(locale, parsed)
  return parsed
}

export async function getFlashcards(locale: Locale, slug: ModuleSlug): Promise<Flashcard[]> {
  const file = await loadFlashcardFile(locale)
  return file[slug] ?? []
}

export async function getAllFlashcards(locale: Locale): Promise<Array<Flashcard & { module: ModuleSlug }>> {
  const file = await loadFlashcardFile(locale)
  const out: Array<Flashcard & { module: ModuleSlug }> = []
  for (const [module, cards] of Object.entries(file)) {
    for (const c of cards) out.push({ ...c, module: module as ModuleSlug })
  }
  return out
}
```

- [ ] **Step 4: Create `src/lib/content/load-module-meta.ts`**

```ts
import 'server-only'
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { moduleFrontmatterSchema, type ModuleFrontmatter } from './schemas'
import { MODULE_ORDER, type ModuleSlug } from './module-order'

type Locale = 'it' | 'en'

const cache = new Map<string, ModuleFrontmatter>()

function fileNameFor(slug: ModuleSlug, order: number): string {
  const padded = String(order).padStart(2, '0')
  return `${padded}-${slug}.mdx`
}

export async function getModuleMeta(locale: Locale, slug: ModuleSlug): Promise<ModuleFrontmatter> {
  const key = `${locale}:${slug}`
  if (cache.has(key)) return cache.get(key)!
  const order = MODULE_ORDER.indexOf(slug) + 1
  const filePath = path.resolve(process.cwd(), 'content', locale, 'modules', fileNameFor(slug, order))
  const raw = await fs.readFile(filePath, 'utf8')
  const { data } = matter(raw)
  const parsed = moduleFrontmatterSchema.parse(data)
  cache.set(key, parsed)
  return parsed
}

export async function getAllModuleMeta(locale: Locale): Promise<ModuleFrontmatter[]> {
  return Promise.all(MODULE_ORDER.map((s) => getModuleMeta(locale, s)))
}
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/module-order.ts src/lib/content/load-quiz.ts src/lib/content/load-flashcards.ts src/lib/content/load-module-meta.ts
git commit -m "feat(content): add module order constant and content loaders"
```

---

## Task 1.3: Progress store (TDD)

**Files:**
- Create: `src/lib/progress/types.ts`
- Create: `src/lib/progress/store.ts`
- Create: `tests/unit/progress/store.test.ts`

- [ ] **Step 1: Create `src/lib/progress/types.ts`**

```ts
export const PROGRESS_VERSION = 1 as const

export interface QuizAttempt {
  at: string
  correct: number
  total: number
}

export interface ModuleProgress {
  lessonReadAt: string | null
  quiz: { attempts: QuizAttempt[]; bestScore: number | null }
  flashcards: { known: string[]; unknown: string[]; completedAt: string | null }
}

export interface Progress {
  version: typeof PROGRESS_VERSION
  startedAt: string | null
  lastActivityAt: string | null
  totalTimeMs: number
  locale: 'it' | 'en' | null
  modules: Record<string, ModuleProgress>
}

export function emptyModuleProgress(): ModuleProgress {
  return {
    lessonReadAt: null,
    quiz: { attempts: [], bestScore: null },
    flashcards: { known: [], unknown: [], completedAt: null },
  }
}

export function emptyProgress(): Progress {
  return {
    version: PROGRESS_VERSION,
    startedAt: null,
    lastActivityAt: null,
    totalTimeMs: 0,
    locale: null,
    modules: {},
  }
}
```

- [ ] **Step 2: Write failing test `tests/unit/progress/store.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readProgress, writeProgress, STORAGE_KEY } from '@/lib/progress/store'
import { emptyProgress } from '@/lib/progress/types'

describe('progress store', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-10T12:00:00Z'))
  })

  it('returns empty progress when localStorage is empty', () => {
    expect(readProgress()).toEqual(emptyProgress())
  })

  it('round-trips a written value', () => {
    const p = emptyProgress()
    p.startedAt = new Date().toISOString()
    p.locale = 'it'
    writeProgress(p)
    expect(readProgress()).toEqual(p)
  })

  it('returns empty when stored data has wrong version', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 999 }))
    expect(readProgress()).toEqual(emptyProgress())
  })

  it('returns empty when stored data is malformed JSON', () => {
    localStorage.setItem(STORAGE_KEY, 'not json')
    expect(readProgress()).toEqual(emptyProgress())
  })
})
```

- [ ] **Step 3: Run test (expect fail)**

```bash
pnpm test tests/unit/progress/store.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 4: Implement `src/lib/progress/store.ts`**

```ts
import { type Progress, emptyProgress, PROGRESS_VERSION } from './types'

export const STORAGE_KEY = 'pvj-onboarding-progress-v1'

export function readProgress(): Progress {
  if (typeof window === 'undefined') return emptyProgress()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw)
    if (parsed?.version !== PROGRESS_VERSION) return emptyProgress()
    return parsed as Progress
  } catch {
    return emptyProgress()
  }
}

export function writeProgress(p: Progress): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    // localStorage may be full or disabled — silently ignore
  }
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
```

- [ ] **Step 5: Run tests (expect pass)**

```bash
pnpm test tests/unit/progress/store.test.ts
```

Expected: 4 PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/progress/types.ts src/lib/progress/store.ts tests/unit/progress/store.test.ts
git commit -m "feat(progress): add progress types and localStorage-backed store"
```

---

## Task 1.4: Progress stats helpers (TDD)

**Files:**
- Create: `src/lib/progress/stats.ts`
- Create: `src/lib/config.ts`
- Create: `tests/unit/progress/stats.test.ts`

- [ ] **Step 1: Create `src/lib/config.ts`**

```ts
export const QUIZ_PASS_THRESHOLD = 0.6
export const FLASHCARD_KNOWN_THRESHOLD = 1.0 // deck completed when no "unknown" left
```

- [ ] **Step 2: Write failing test `tests/unit/progress/stats.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { isModuleCompleted, computeStats } from '@/lib/progress/stats'
import { emptyProgress, emptyModuleProgress, type Progress } from '@/lib/progress/types'

function buildProgress(modulesPatch: Record<string, ReturnType<typeof emptyModuleProgress>>): Progress {
  const p = emptyProgress()
  p.modules = modulesPatch
  return p
}

describe('isModuleCompleted', () => {
  it('returns false when lesson not read', () => {
    const m = emptyModuleProgress()
    m.quiz.bestScore = 0.8
    m.flashcards.completedAt = '2026-05-10T12:00:00Z'
    expect(isModuleCompleted(m)).toBe(false)
  })

  it('returns false when quiz score below threshold', () => {
    const m = emptyModuleProgress()
    m.lessonReadAt = '2026-05-10T11:00:00Z'
    m.quiz.bestScore = 0.5
    m.flashcards.completedAt = '2026-05-10T12:00:00Z'
    expect(isModuleCompleted(m)).toBe(false)
  })

  it('returns false when flashcards not completed', () => {
    const m = emptyModuleProgress()
    m.lessonReadAt = '2026-05-10T11:00:00Z'
    m.quiz.bestScore = 0.8
    expect(isModuleCompleted(m)).toBe(false)
  })

  it('returns true when all conditions met', () => {
    const m = emptyModuleProgress()
    m.lessonReadAt = '2026-05-10T11:00:00Z'
    m.quiz.bestScore = 0.6
    m.flashcards.completedAt = '2026-05-10T12:00:00Z'
    expect(isModuleCompleted(m)).toBe(true)
  })
})

describe('computeStats', () => {
  it('all zeros for empty progress', () => {
    const s = computeStats(emptyProgress(), ['welcome', 'mission'])
    expect(s.modulesCompleted).toBe(0)
    expect(s.percentComplete).toBe(0)
    expect(s.avgScore).toBe(null)
  })

  it('counts completed modules and averages quiz scores', () => {
    const p = emptyProgress()
    const w = emptyModuleProgress()
    w.lessonReadAt = '2026-05-10T11:00:00Z'
    w.quiz.bestScore = 0.8
    w.flashcards.completedAt = '2026-05-10T12:00:00Z'
    const m = emptyModuleProgress()
    m.lessonReadAt = '2026-05-10T11:00:00Z'
    m.quiz.bestScore = 0.6
    m.flashcards.completedAt = '2026-05-10T12:00:00Z'
    p.modules = { welcome: w, mission: m }
    const s = computeStats(p, ['welcome', 'mission'])
    expect(s.modulesCompleted).toBe(2)
    expect(s.percentComplete).toBe(1)
    expect(s.avgScore).toBeCloseTo(0.7, 5)
  })
})
```

- [ ] **Step 3: Run test (expect fail)**

```bash
pnpm test tests/unit/progress/stats.test.ts
```

Expected: FAIL.

- [ ] **Step 4: Implement `src/lib/progress/stats.ts`**

```ts
import { QUIZ_PASS_THRESHOLD } from '@/lib/config'
import type { ModuleProgress, Progress } from './types'

export function isModuleCompleted(m: ModuleProgress): boolean {
  if (!m.lessonReadAt) return false
  if (m.quiz.bestScore === null || m.quiz.bestScore < QUIZ_PASS_THRESHOLD) return false
  if (!m.flashcards.completedAt) return false
  return true
}

export interface Stats {
  modulesCompleted: number
  totalModules: number
  percentComplete: number
  avgScore: number | null
}

export function computeStats(p: Progress, slugs: readonly string[]): Stats {
  let completed = 0
  const scores: number[] = []
  for (const slug of slugs) {
    const m = p.modules[slug]
    if (!m) continue
    if (isModuleCompleted(m)) completed += 1
    if (m.quiz.bestScore !== null) scores.push(m.quiz.bestScore)
  }
  return {
    modulesCompleted: completed,
    totalModules: slugs.length,
    percentComplete: slugs.length > 0 ? completed / slugs.length : 0,
    avgScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null,
  }
}
```

- [ ] **Step 5: Run tests (expect pass)**

```bash
pnpm test tests/unit/progress
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/config.ts src/lib/progress/stats.ts tests/unit/progress/stats.test.ts
git commit -m "feat(progress): add module completion logic and aggregate stats"
```

---

## Task 1.5: useProgress hook (TDD)

**Files:**
- Create: `src/lib/progress/use-progress.ts`
- Create: `tests/unit/progress/use-progress.test.tsx`

- [ ] **Step 1: Write failing test `tests/unit/progress/use-progress.test.tsx`**

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProgress } from '@/lib/progress/use-progress'
import { STORAGE_KEY } from '@/lib/progress/store'

describe('useProgress', () => {
  beforeEach(() => localStorage.clear())

  it('starts empty', () => {
    const { result } = renderHook(() => useProgress(['welcome']))
    expect(result.current.progress.modules).toEqual({})
    expect(result.current.stats.modulesCompleted).toBe(0)
  })

  it('markLessonRead sets lessonReadAt', () => {
    const { result } = renderHook(() => useProgress(['welcome']))
    act(() => result.current.markLessonRead('welcome'))
    expect(result.current.progress.modules.welcome?.lessonReadAt).not.toBeNull()
  })

  it('recordQuizAttempt updates bestScore (only improvements)', () => {
    const { result } = renderHook(() => useProgress(['welcome']))
    act(() => result.current.recordQuizAttempt('welcome', 4, 5))
    expect(result.current.progress.modules.welcome?.quiz.bestScore).toBeCloseTo(0.8)
    act(() => result.current.recordQuizAttempt('welcome', 3, 5))
    expect(result.current.progress.modules.welcome?.quiz.bestScore).toBeCloseTo(0.8) // unchanged
    act(() => result.current.recordQuizAttempt('welcome', 5, 5))
    expect(result.current.progress.modules.welcome?.quiz.bestScore).toBeCloseTo(1.0)
  })

  it('markFlashcardKnown moves card from unknown to known', () => {
    const { result } = renderHook(() => useProgress(['welcome']))
    act(() => result.current.markFlashcardUnknown('welcome', 'f-w-001'))
    act(() => result.current.markFlashcardKnown('welcome', 'f-w-001'))
    expect(result.current.progress.modules.welcome?.flashcards.known).toContain('f-w-001')
    expect(result.current.progress.modules.welcome?.flashcards.unknown).not.toContain('f-w-001')
  })

  it('resetAll clears localStorage and progress', () => {
    const { result } = renderHook(() => useProgress(['welcome']))
    act(() => result.current.markLessonRead('welcome'))
    act(() => result.current.resetAll())
    expect(result.current.progress.modules).toEqual({})
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
```

- [ ] **Step 2: Run test (expect fail)**

```bash
pnpm test tests/unit/progress/use-progress.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/progress/use-progress.ts`**

```ts
'use client'
import { useCallback, useSyncExternalStore } from 'react'
import { readProgress, writeProgress, clearProgress, STORAGE_KEY } from './store'
import { emptyModuleProgress, emptyProgress, type Progress } from './types'
import { computeStats, type Stats } from './stats'

const listeners = new Set<() => void>()

function subscribe(cb: () => void) {
  listeners.add(cb)
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) cb()
  }
  window.addEventListener('storage', handler)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', handler)
  }
}

function notify() {
  listeners.forEach((cb) => cb())
}

function getSnapshot(): Progress {
  return readProgress()
}

function getServerSnapshot(): Progress {
  return emptyProgress()
}

function update(mutator: (p: Progress) => Progress) {
  const next = mutator(readProgress())
  next.lastActivityAt = new Date().toISOString()
  if (!next.startedAt) next.startedAt = next.lastActivityAt
  writeProgress(next)
  notify()
}

function ensureModule(p: Progress, slug: string): Progress {
  if (p.modules[slug]) return p
  return { ...p, modules: { ...p.modules, [slug]: emptyModuleProgress() } }
}

export interface UseProgressApi {
  progress: Progress
  stats: Stats
  markLessonRead: (slug: string) => void
  recordQuizAttempt: (slug: string, correct: number, total: number) => void
  markFlashcardKnown: (slug: string, cardId: string) => void
  markFlashcardUnknown: (slug: string, cardId: string) => void
  resetFlashcardDeck: (slug: string) => void
  resetAll: () => void
}

export function useProgress(allSlugs: readonly string[]): UseProgressApi {
  const progress = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const stats = computeStats(progress, allSlugs)

  const markLessonRead = useCallback((slug: string) => {
    update((p) => {
      const next = ensureModule(p, slug)
      next.modules[slug] = {
        ...next.modules[slug],
        lessonReadAt: next.modules[slug].lessonReadAt ?? new Date().toISOString(),
      }
      return next
    })
  }, [])

  const recordQuizAttempt = useCallback((slug: string, correct: number, total: number) => {
    update((p) => {
      const next = ensureModule(p, slug)
      const score = total > 0 ? correct / total : 0
      const m = next.modules[slug]
      const attempts = [...m.quiz.attempts, { at: new Date().toISOString(), correct, total }]
      const bestScore = m.quiz.bestScore === null ? score : Math.max(m.quiz.bestScore, score)
      next.modules[slug] = { ...m, quiz: { attempts, bestScore } }
      return next
    })
  }, [])

  const markFlashcardKnown = useCallback((slug: string, cardId: string) => {
    update((p) => {
      const next = ensureModule(p, slug)
      const m = next.modules[slug]
      const known = m.flashcards.known.includes(cardId) ? m.flashcards.known : [...m.flashcards.known, cardId]
      const unknown = m.flashcards.unknown.filter((id) => id !== cardId)
      const completedAt = unknown.length === 0 && (known.length > 0 || m.flashcards.completedAt)
        ? (m.flashcards.completedAt ?? new Date().toISOString())
        : m.flashcards.completedAt
      next.modules[slug] = { ...m, flashcards: { known, unknown, completedAt } }
      return next
    })
  }, [])

  const markFlashcardUnknown = useCallback((slug: string, cardId: string) => {
    update((p) => {
      const next = ensureModule(p, slug)
      const m = next.modules[slug]
      const unknown = m.flashcards.unknown.includes(cardId) ? m.flashcards.unknown : [...m.flashcards.unknown, cardId]
      const known = m.flashcards.known.filter((id) => id !== cardId)
      next.modules[slug] = { ...m, flashcards: { known, unknown, completedAt: null } }
      return next
    })
  }, [])

  const resetFlashcardDeck = useCallback((slug: string) => {
    update((p) => {
      const next = ensureModule(p, slug)
      const m = next.modules[slug]
      next.modules[slug] = { ...m, flashcards: { known: [], unknown: [], completedAt: null } }
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    clearProgress()
    notify()
  }, [])

  return { progress, stats, markLessonRead, recordQuizAttempt, markFlashcardKnown, markFlashcardUnknown, resetFlashcardDeck, resetAll }
}
```

- [ ] **Step 4: Run tests (expect pass)**

```bash
pnpm test tests/unit/progress
```

Expected: 13 PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/progress/use-progress.ts tests/unit/progress/use-progress.test.tsx
git commit -m "feat(progress): add useProgress hook with useSyncExternalStore"
```

---

## Task 1.6: Lesson MDX components

**Files:**
- Create: `src/components/lesson/Callout.tsx`
- Create: `src/components/lesson/KeyFact.tsx`
- Create: `src/components/lesson/Comparison.tsx`
- Create: `src/components/lesson/ImageFigure.tsx`
- Create: `src/components/lesson/Aside.tsx`
- Create: `src/components/lesson/FleetSpecCard.tsx`
- Create: `src/components/lesson/mdx-components.ts`
- Create: `mdx-components.tsx` (Next.js convention, at repo root)

- [ ] **Step 1: Implement components**

`src/components/lesson/Callout.tsx`:
```tsx
import { clsx } from 'clsx'
import { Info, AlertTriangle, BookOpen } from 'lucide-react'

type Type = 'info' | 'warning' | 'note'

const map: Record<Type, { icon: React.ElementType; cls: string }> = {
  info:    { icon: Info,           cls: 'border-pvj-navy/20 bg-pvj-navy-50' },
  warning: { icon: AlertTriangle,  cls: 'border-error/30 bg-error/5' },
  note:    { icon: BookOpen,       cls: 'border-pvj-gold-soft bg-pvj-gold-soft/20' },
}

export function Callout({ type = 'info', children }: { type?: Type; children: React.ReactNode }) {
  const { icon: Icon, cls } = map[type]
  return (
    <aside className={clsx('my-6 flex gap-3 rounded-md border-l-4 p-4', cls)}>
      <Icon className="mt-1 h-5 w-5 shrink-0 text-pvj-navy" />
      <div className="text-pvj-navy/80">{children}</div>
    </aside>
  )
}
```

`src/components/lesson/KeyFact.tsx`:
```tsx
export function KeyFact({ children }: { children: React.ReactNode }) {
  return (
    <p className="display my-8 border-y border-pvj-gold-soft py-6 text-center text-2xl text-pvj-navy">
      {children}
    </p>
  )
}
```

`src/components/lesson/Comparison.tsx`:
```tsx
interface Item { name: string; when?: string; pros?: string[]; cons?: string[] }

export function Comparison({ items }: { items: Item[] }) {
  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.name} className="rounded-md border border-pvj-cream-200 bg-white p-5">
          <h3 className="display text-xl mb-2">{it.name}</h3>
          {it.when && <p className="text-sm text-pvj-navy/60 mb-3">{it.when}</p>}
          {it.pros && (
            <>
              <p className="text-xs uppercase tracking-wider text-success mt-2 mb-1">Pro</p>
              <ul className="list-disc pl-5 text-sm">{it.pros.map((p) => <li key={p}>{p}</li>)}</ul>
            </>
          )}
          {it.cons && (
            <>
              <p className="text-xs uppercase tracking-wider text-error mt-3 mb-1">Contro</p>
              <ul className="list-disc pl-5 text-sm">{it.cons.map((c) => <li key={c}>{c}</li>)}</ul>
            </>
          )}
        </div>
      ))}
    </div>
  )
}
```

`src/components/lesson/ImageFigure.tsx`:
```tsx
import Image from 'next/image'

export function ImageFigure({ src, alt, caption, width = 1200, height = 700 }: { src: string; alt: string; caption?: string; width?: number; height?: number }) {
  return (
    <figure className="my-8">
      <Image src={src} alt={alt} width={width} height={height} className="rounded-md" />
      {caption && <figcaption className="mt-2 text-center text-sm text-pvj-navy/60">{caption}</figcaption>}
    </figure>
  )
}
```

`src/components/lesson/Aside.tsx`:
```tsx
export function Aside({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 border-l-2 border-pvj-gold-soft pl-4 text-sm text-pvj-navy/70 italic">
      {children}
    </div>
  )
}
```

`src/components/lesson/FleetSpecCard.tsx`:
```tsx
export function FleetSpecCard({ model, pax, range, examples }: { model: string; pax: string; range: string; examples?: string[] }) {
  return (
    <div className="my-4 rounded-md border border-pvj-cream-200 bg-white p-4">
      <h4 className="display text-lg">{model}</h4>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-pvj-navy/60">Pax</dt><dd>{pax}</dd>
        <dt className="text-pvj-navy/60">Range</dt><dd>{range}</dd>
        {examples && (<><dt className="text-pvj-navy/60">Esempi</dt><dd>{examples.join(', ')}</dd></>)}
      </dl>
    </div>
  )
}
```

`src/components/lesson/mdx-components.ts`:
```ts
import { Callout } from './Callout'
import { KeyFact } from './KeyFact'
import { Comparison } from './Comparison'
import { ImageFigure } from './ImageFigure'
import { Aside } from './Aside'
import { FleetSpecCard } from './FleetSpecCard'

export const lessonComponents = {
  Callout, KeyFact, Comparison, ImageFigure, Aside, FleetSpecCard,
}
```

`mdx-components.tsx` (root convention for Next.js MDX):
```tsx
import type { MDXComponents } from 'mdx/types'
import { lessonComponents } from '@/components/lesson/mdx-components'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...lessonComponents,
    h1: (props) => <h1 className="mb-6" {...props} />,
    h2: (props) => <h2 className="mt-10 mb-4" {...props} />,
    p: (props) => <p className="my-4 leading-7" {...props} />,
    a: (props) => <a className="underline decoration-pvj-gold-soft underline-offset-4 hover:text-pvj-gold" {...props} />,
    ul: (props) => <ul className="my-4 list-disc pl-6 space-y-1" {...props} />,
    ol: (props) => <ol className="my-4 list-decimal pl-6 space-y-1" {...props} />,
    blockquote: (props) => <blockquote className="my-6 border-l-2 border-pvj-gold pl-4 italic text-pvj-navy/80" {...props} />,
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/lesson mdx-components.tsx
git commit -m "feat(lesson): add MDX components (Callout, KeyFact, Comparison, ImageFigure, Aside, FleetSpecCard)"
```

---

## Task 1.7: QuizPlayer (TDD on scoring, then UI wrap)

**Files:**
- Create: `src/lib/quiz/scoring.ts`
- Create: `tests/unit/quiz/scoring.test.ts`
- Create: `src/components/quiz/QuizPlayer.tsx`
- Create: `src/components/quiz/QuestionCard.tsx`
- Create: `src/components/quiz/ResultBar.tsx`

- [ ] **Step 1: Write failing test `tests/unit/quiz/scoring.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { scoreAnswers } from '@/lib/quiz/scoring'
import type { QuizQuestion } from '@/lib/content/schemas'

const questions: QuizQuestion[] = [
  { id: 'q1', type: 'mcq', question: 'a', options: ['x','y','z'], correct_index: 0, explanation: '' },
  { id: 'q2', type: 'mcq', question: 'b', options: ['x','y','z'], correct_index: 2, explanation: '' },
  { id: 'q3', type: 'mcq', question: 'c', options: ['x','y','z'], correct_index: 1, explanation: '' },
]

describe('scoreAnswers', () => {
  it('counts correct answers', () => {
    expect(scoreAnswers(questions, { q1: 0, q2: 2, q3: 0 })).toEqual({ correct: 2, total: 3, wrongIds: ['q3'] })
  })
  it('handles missing answers as wrong', () => {
    expect(scoreAnswers(questions, { q1: 0 })).toEqual({ correct: 1, total: 3, wrongIds: ['q2', 'q3'] })
  })
  it('all correct', () => {
    expect(scoreAnswers(questions, { q1: 0, q2: 2, q3: 1 })).toEqual({ correct: 3, total: 3, wrongIds: [] })
  })
})
```

- [ ] **Step 2: Run (expect fail)**

```bash
pnpm test tests/unit/quiz/scoring.test.ts
```

- [ ] **Step 3: Implement `src/lib/quiz/scoring.ts`**

```ts
import type { QuizQuestion } from '@/lib/content/schemas'

export interface ScoreResult {
  correct: number
  total: number
  wrongIds: string[]
}

export function scoreAnswers(questions: QuizQuestion[], answers: Record<string, number | undefined>): ScoreResult {
  let correct = 0
  const wrongIds: string[] = []
  for (const q of questions) {
    const a = answers[q.id]
    if (a === q.correct_index) correct += 1
    else wrongIds.push(q.id)
  }
  return { correct, total: questions.length, wrongIds }
}
```

- [ ] **Step 4: Run (expect pass)**

```bash
pnpm test tests/unit/quiz/scoring.test.ts
```

- [ ] **Step 5: Implement UI components**

`src/components/quiz/QuestionCard.tsx`:
```tsx
'use client'
import { clsx } from 'clsx'
import { Check, X } from 'lucide-react'
import type { QuizQuestion } from '@/lib/content/schemas'

export function QuestionCard({
  question,
  index,
  total,
  selected,
  revealed,
  onSelect,
}: {
  question: QuizQuestion
  index: number
  total: number
  selected: number | null
  revealed: boolean
  onSelect: (i: number) => void
}) {
  return (
    <div className="rounded-md border border-pvj-cream-200 bg-white p-6">
      <p className="text-xs uppercase tracking-wider text-pvj-navy/50 mb-2">
        Domanda {index + 1} / {total}
      </p>
      <h2 className="display text-xl mb-6">{question.question}</h2>
      <ul className="space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i
          const isCorrect = revealed && i === question.correct_index
          const isWrong = revealed && isSelected && i !== question.correct_index
          return (
            <li key={i}>
              <button
                disabled={revealed}
                onClick={() => onSelect(i)}
                className={clsx(
                  'w-full text-left flex items-center gap-3 rounded-md border-2 px-4 py-3 transition',
                  !revealed && 'border-pvj-cream-200 hover:bg-pvj-navy-50',
                  isCorrect && 'border-success bg-success/5',
                  isWrong && 'border-error bg-error/5',
                  revealed && !isSelected && i !== question.correct_index && 'border-pvj-cream-200 opacity-60',
                )}
              >
                <span className="flex-1">{opt}</span>
                {isCorrect && <Check className="h-5 w-5 text-success" />}
                {isWrong && <X className="h-5 w-5 text-error" />}
              </button>
            </li>
          )
        })}
      </ul>
      {revealed && (
        <p className="mt-4 text-sm text-pvj-navy/70">{question.explanation}</p>
      )}
    </div>
  )
}
```

`src/components/quiz/ResultBar.tsx`:
```tsx
export function ResultBar({ correct, total }: { correct: number; total: number }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0
  return (
    <div className="rounded-md border border-pvj-cream-200 bg-white p-6 text-center">
      <p className="text-xs uppercase tracking-wider text-pvj-navy/50">Risultato</p>
      <p className="display mt-2 text-4xl">{correct}/{total}</p>
      <p className="mt-1 text-pvj-navy/60">{pct}%</p>
    </div>
  )
}
```

`src/components/quiz/QuizPlayer.tsx`:
```tsx
'use client'
import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import type { QuizQuestion } from '@/lib/content/schemas'
import { scoreAnswers } from '@/lib/quiz/scoring'
import { useProgress } from '@/lib/progress/use-progress'
import { MODULE_ORDER, type ModuleSlug } from '@/lib/content/module-order'
import { QuestionCard } from './QuestionCard'
import { ResultBar } from './ResultBar'

export function QuizPlayer({ slug, questions }: { slug: ModuleSlug; questions: QuizQuestion[] }) {
  const t = useTranslations('Quiz')
  const { recordQuizAttempt } = useProgress(MODULE_ORDER)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [revealedFor, setRevealedFor] = useState<Record<string, boolean>>({})
  const [done, setDone] = useState(false)

  const q = questions[index]
  const result = useMemo(() => done ? scoreAnswers(questions, answers) : null, [done, questions, answers])

  function select(i: number) {
    if (revealedFor[q.id]) return
    setAnswers((a) => ({ ...a, [q.id]: i }))
    setRevealedFor((r) => ({ ...r, [q.id]: true }))
  }

  function next() {
    if (index < questions.length - 1) setIndex(index + 1)
    else {
      const r = scoreAnswers(questions, answers)
      recordQuizAttempt(slug, r.correct, r.total)
      setDone(true)
    }
  }

  function retryWrong() {
    if (!result) return
    const wrongQs = questions.filter((qq) => result.wrongIds.includes(qq.id))
    if (wrongQs.length === 0) return
    setAnswers({})
    setRevealedFor({})
    setIndex(0)
    setDone(false)
    // hot-swap questions list via key prop in parent if needed; here we keep full list
  }

  if (questions.length === 0) {
    return <p className="text-pvj-navy/60">{t('emptyQuiz')}</p>
  }

  if (done && result) {
    return (
      <div className="space-y-6">
        <ResultBar correct={result.correct} total={result.total} />
        {result.wrongIds.length > 0 && (
          <button onClick={retryWrong} className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700">
            {t('retryWrong')}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <QuestionCard
        question={q}
        index={index}
        total={questions.length}
        selected={answers[q.id] ?? null}
        revealed={!!revealedFor[q.id]}
        onSelect={select}
      />
      {revealedFor[q.id] && (
        <div className="text-right">
          <button onClick={next} className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700">
            {index < questions.length - 1 ? t('next') : t('finish')}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Add `Quiz` translations**

Edit `src/messages/it.json` — add inside the root object:
```json
"Quiz": {
  "next": "Successiva",
  "finish": "Vedi risultato",
  "retryWrong": "Riprova le sbagliate",
  "emptyQuiz": "Quiz non ancora disponibile per questo modulo."
}
```

Edit `src/messages/en.json` — add:
```json
"Quiz": {
  "next": "Next",
  "finish": "See result",
  "retryWrong": "Retry the wrong ones",
  "emptyQuiz": "Quiz not available yet for this module."
}
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/quiz src/components/quiz tests/unit/quiz src/messages
git commit -m "feat(quiz): add scoring logic and QuizPlayer component"
```

---

## Task 1.8: FlashcardDeck

**Files:**
- Create: `src/components/flashcards/FlipCard.tsx`
- Create: `src/components/flashcards/FlashcardDeck.tsx`

- [ ] **Step 1: Implement `src/components/flashcards/FlipCard.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { clsx } from 'clsx'

export function FlipCard({ front, back }: { front: string; back: string }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      className="relative mx-auto block h-[280px] w-full max-w-[480px] [perspective:1000px]"
      aria-label="Flip card"
    >
      <div
        className={clsx(
          'relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]',
          flipped && '[transform:rotateY(180deg)]',
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-pvj-cream-200 bg-white p-6 [backface-visibility:hidden]">
          <p className="display text-2xl text-center">{front}</p>
        </div>
        <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-pvj-gold-soft bg-pvj-cream p-6 [transform:rotateY(180deg)] [backface-visibility:hidden]">
          <p className="text-pvj-navy/80 text-center leading-relaxed">{back}</p>
        </div>
      </div>
    </button>
  )
}
```

- [ ] **Step 2: Implement `src/components/flashcards/FlashcardDeck.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useProgress } from '@/lib/progress/use-progress'
import { MODULE_ORDER, type ModuleSlug } from '@/lib/content/module-order'
import type { Flashcard } from '@/lib/content/schemas'
import { FlipCard } from './FlipCard'

export function FlashcardDeck({ slug, cards }: { slug: ModuleSlug; cards: Flashcard[] }) {
  const t = useTranslations('Flashcards')
  const { markFlashcardKnown, markFlashcardUnknown, resetFlashcardDeck } = useProgress(MODULE_ORDER)
  const [queue, setQueue] = useState<Flashcard[]>(cards)
  const [revealed, setRevealed] = useState(false)

  const card = queue[0]

  if (!card) {
    return (
      <div className="space-y-4 text-center">
        <p className="display text-2xl">{t('done')}</p>
        <button
          onClick={() => { resetFlashcardDeck(slug); setQueue(cards) }}
          className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700"
        >
          {t('reshuffle')}
        </button>
      </div>
    )
  }

  function answer(known: boolean) {
    if (known) markFlashcardKnown(slug, card.id)
    else { markFlashcardUnknown(slug, card.id); setQueue((q) => [...q.slice(1), q[0]]); setRevealed(false); return }
    setQueue((q) => q.slice(1))
    setRevealed(false)
  }

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-pvj-navy/50">{t('remaining', { n: queue.length })}</p>
      <div onClick={() => setRevealed(true)}>
        <FlipCard front={card.front} back={card.back} />
      </div>
      {revealed && (
        <div className="flex justify-center gap-3">
          <button
            onClick={() => answer(false)}
            className="rounded-md border-2 border-error/50 px-4 py-2 text-error hover:bg-error/5"
          >
            {t('didntKnow')}
          </button>
          <button
            onClick={() => answer(true)}
            className="rounded-md border-2 border-success/50 px-4 py-2 text-success hover:bg-success/5"
          >
            {t('knew')}
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Add `Flashcards` translations**

`src/messages/it.json` — add:
```json
"Flashcards": {
  "knew": "Sapevo",
  "didntKnow": "Non sapevo",
  "remaining": "Rimaste: {n}",
  "done": "Mazzo completato",
  "reshuffle": "Rimescola e riprova"
}
```

`src/messages/en.json` — add:
```json
"Flashcards": {
  "knew": "Knew it",
  "didntKnow": "Didn't know",
  "remaining": "Remaining: {n}",
  "done": "Deck completed",
  "reshuffle": "Reshuffle and retry"
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/flashcards src/messages
git commit -m "feat(flashcards): add FlipCard and FlashcardDeck with Leitner 2-box logic"
```

---

## Task 1.9: Dashboard (ModuleCard, ProgressRing, page)

**Files:**
- Create: `src/components/dashboard/ProgressRing.tsx`
- Create: `src/components/dashboard/ModuleCard.tsx`
- Modify: `src/app/[locale]/page.tsx` (replace coming-soon with dashboard)

- [ ] **Step 1: Implement `src/components/dashboard/ProgressRing.tsx`**

```tsx
export function ProgressRing({ value, size = 80 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2
  const circ = 2 * Math.PI * radius
  const offset = circ * (1 - value)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Progresso ${Math.round(value * 100)}%`}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-pvj-cream-200)" strokeWidth="4" />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke="var(--color-pvj-gold)" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="52%" textAnchor="middle" className="fill-pvj-navy" style={{ fontSize: size * 0.28, fontFamily: 'var(--font-display)' }}>
        {Math.round(value * 100)}%
      </text>
    </svg>
  )
}
```

- [ ] **Step 2: Implement `src/components/dashboard/ModuleCard.tsx`**

```tsx
'use client'
import { Link } from '@/lib/i18n/routing'
import { Check } from 'lucide-react'
import { clsx } from 'clsx'
import type { ModuleFrontmatter } from '@/lib/content/schemas'
import { isModuleCompleted } from '@/lib/progress/stats'
import type { ModuleProgress } from '@/lib/progress/types'

export function ModuleCard({ meta, progress }: { meta: ModuleFrontmatter; progress: ModuleProgress | undefined }) {
  const m = progress
  const complete = m ? isModuleCompleted(m) : false
  return (
    <Link
      href={`/m/${meta.slug}`}
      className={clsx(
        'group block rounded-md border bg-white p-5 transition hover:-translate-y-0.5',
        complete ? 'border-pvj-gold-soft' : 'border-pvj-cream-200 hover:border-pvj-gold-soft',
      )}
    >
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-pvj-gold display text-sm">{String(meta.order).padStart(2, '0')}</span>
        {complete && (
          <span className="flex items-center gap-1 text-success text-xs">
            <Check className="h-3.5 w-3.5" /> Completato
          </span>
        )}
      </div>
      <h3 className="display text-xl mb-2 group-hover:text-pvj-gold transition-colors">{meta.title}</h3>
      <p className="text-sm text-pvj-navy/60">{meta.estimated_minutes} min · lezione + quiz + flashcard</p>
      {m?.quiz.bestScore !== null && m?.quiz.bestScore !== undefined && (
        <p className="mt-2 text-xs text-pvj-navy/50">Score: {Math.round(m.quiz.bestScore * 100)}%</p>
      )}
    </Link>
  )
}
```

- [ ] **Step 3: Replace `src/app/[locale]/page.tsx` with dashboard**

```tsx
import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { getAllModuleMeta } from '@/lib/content/load-module-meta'
import { MODULE_ORDER } from '@/lib/content/module-order'
import { Dashboard } from './_dashboard'

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const metas = await getAllModuleMeta(locale as 'it' | 'en')
  const t = await getTranslations('Dashboard')
  return <Dashboard metas={metas} title={t('title')} subtitle={t('subtitle')} />
}
```

`src/app/[locale]/_dashboard.tsx` (new client component):
```tsx
'use client'
import { useProgress } from '@/lib/progress/use-progress'
import { MODULE_ORDER } from '@/lib/content/module-order'
import { ModuleCard } from '@/components/dashboard/ModuleCard'
import { ProgressRing } from '@/components/dashboard/ProgressRing'
import type { ModuleFrontmatter } from '@/lib/content/schemas'

export function Dashboard({ metas, title, subtitle }: { metas: ModuleFrontmatter[]; title: string; subtitle: string }) {
  const { progress, stats } = useProgress(MODULE_ORDER)
  return (
    <section>
      <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between mb-12">
        <div>
          <h1 className="display">{title}</h1>
          <p className="mt-2 text-pvj-navy/60">{subtitle}</p>
        </div>
        <ProgressRing value={stats.percentComplete} />
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metas.map((meta) => (
          <ModuleCard key={meta.slug} meta={meta} progress={progress.modules[meta.slug]} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Update messages**

`src/messages/it.json` — add:
```json
"Dashboard": {
  "title": "Onboarding SDR",
  "subtitle": "11 moduli, ~1 giornata. Inizia dal modulo 1 o riprendi da dove hai lasciato."
}
```

`src/messages/en.json` — add:
```json
"Dashboard": {
  "title": "SDR Onboarding",
  "subtitle": "11 modules, ~1 day. Start from module 1 or resume where you left off."
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard src/app/[locale]/page.tsx src/app/[locale]/_dashboard.tsx src/messages
git commit -m "feat(dashboard): add module cards, progress ring, dashboard page"
```

---

## Task 1.10: Module routes (lesson / quiz / flashcards)

**Files:**
- Create: `src/app/[locale]/m/[slug]/page.tsx`
- Create: `src/app/[locale]/m/[slug]/quiz/page.tsx`
- Create: `src/app/[locale]/m/[slug]/flashcards/page.tsx`
- Create: `src/app/[locale]/m/[slug]/_lesson-mark-read.tsx` (client side-effect)

- [ ] **Step 1: Create lesson page `src/app/[locale]/m/[slug]/page.tsx`**

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/lib/i18n/routing'
import { isModuleSlug, MODULE_ORDER, nextModuleSlug } from '@/lib/content/module-order'
import { getModuleMeta } from '@/lib/content/load-module-meta'
import { LessonMarkRead } from './_lesson-mark-read'

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of ['it', 'en']) for (const slug of MODULE_ORDER) params.push({ locale, slug })
  return params
}

export default async function LessonPage({
  params,
}: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!isModuleSlug(slug)) notFound()
  setRequestLocale(locale)
  const meta = await getModuleMeta(locale as 'it' | 'en', slug)
  const t = await getTranslations('Lesson')

  // Dynamic import the MDX file
  const order = String(meta.order).padStart(2, '0')
  const Mdx = (await import(`@/content/${locale}/modules/${order}-${slug}.mdx`)).default

  return (
    <article className="mx-auto max-w-[680px]">
      <p className="text-pvj-gold display text-sm mb-2">{t('moduleNumber', { n: meta.order })}</p>
      <h1 className="display mb-4">{meta.title}</h1>
      <p className="text-pvj-navy/50 text-sm mb-10">{t('estimated', { n: meta.estimated_minutes })}</p>
      <Mdx />
      <LessonMarkRead slug={slug} />
      <div className="mt-12 flex items-center justify-between border-t border-pvj-cream-200 pt-6">
        <Link href="/" className="text-pvj-navy/60 hover:text-pvj-navy">{t('back')}</Link>
        <Link
          href={`/m/${slug}/quiz`}
          className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700"
        >
          {t('toQuiz')}
        </Link>
      </div>
    </article>
  )
}
```

- [ ] **Step 2: Create `src/app/[locale]/m/[slug]/_lesson-mark-read.tsx`**

```tsx
'use client'
import { useEffect } from 'react'
import { useProgress } from '@/lib/progress/use-progress'
import { MODULE_ORDER, type ModuleSlug } from '@/lib/content/module-order'

export function LessonMarkRead({ slug }: { slug: ModuleSlug }) {
  const { markLessonRead } = useProgress(MODULE_ORDER)
  useEffect(() => { markLessonRead(slug) }, [slug, markLessonRead])
  return null
}
```

- [ ] **Step 3: Create quiz page `src/app/[locale]/m/[slug]/quiz/page.tsx`**

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/lib/i18n/routing'
import { isModuleSlug, MODULE_ORDER, nextModuleSlug } from '@/lib/content/module-order'
import { getModuleMeta } from '@/lib/content/load-module-meta'
import { getQuiz } from '@/lib/content/load-quiz'
import { QuizPlayer } from '@/components/quiz/QuizPlayer'

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of ['it', 'en']) for (const slug of MODULE_ORDER) params.push({ locale, slug })
  return params
}

export default async function QuizPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!isModuleSlug(slug)) notFound()
  setRequestLocale(locale)
  const meta = await getModuleMeta(locale as 'it' | 'en', slug)
  const questions = await getQuiz(locale as 'it' | 'en', slug)
  const t = await getTranslations('Lesson')

  return (
    <section className="mx-auto max-w-[680px]">
      <p className="text-pvj-gold display text-sm mb-2">{t('moduleNumber', { n: meta.order })} · Quiz</p>
      <h1 className="display mb-8">{meta.title}</h1>
      <QuizPlayer slug={slug} questions={questions} />
      <div className="mt-12 flex items-center justify-between border-t border-pvj-cream-200 pt-6">
        <Link href={`/m/${slug}`} className="text-pvj-navy/60 hover:text-pvj-navy">{t('backToLesson')}</Link>
        <Link
          href={`/m/${slug}/flashcards`}
          className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700"
        >
          {t('toFlashcards')}
        </Link>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create flashcards page `src/app/[locale]/m/[slug]/flashcards/page.tsx`**

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Link } from '@/lib/i18n/routing'
import { isModuleSlug, MODULE_ORDER, nextModuleSlug } from '@/lib/content/module-order'
import { getModuleMeta } from '@/lib/content/load-module-meta'
import { getFlashcards } from '@/lib/content/load-flashcards'
import { FlashcardDeck } from '@/components/flashcards/FlashcardDeck'

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = []
  for (const locale of ['it', 'en']) for (const slug of MODULE_ORDER) params.push({ locale, slug })
  return params
}

export default async function FlashcardsPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!isModuleSlug(slug)) notFound()
  setRequestLocale(locale)
  const meta = await getModuleMeta(locale as 'it' | 'en', slug)
  const cards = await getFlashcards(locale as 'it' | 'en', slug)
  const next = nextModuleSlug(slug)
  const t = await getTranslations('Lesson')

  return (
    <section className="mx-auto max-w-[680px]">
      <p className="text-pvj-gold display text-sm mb-2">{t('moduleNumber', { n: meta.order })} · Flashcard</p>
      <h1 className="display mb-8">{meta.title}</h1>
      <FlashcardDeck slug={slug} cards={cards} />
      <div className="mt-12 flex items-center justify-between border-t border-pvj-cream-200 pt-6">
        <Link href={`/m/${slug}/quiz`} className="text-pvj-navy/60 hover:text-pvj-navy">{t('backToQuiz')}</Link>
        {next ? (
          <Link href={`/m/${next}`} className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700">{t('nextModule')}</Link>
        ) : (
          <Link href="/summary" className="rounded-md bg-pvj-gold px-4 py-2 text-pvj-navy hover:bg-pvj-gold-soft">{t('toSummary')}</Link>
        )}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Add `Lesson` translations**

`src/messages/it.json` — add:
```json
"Lesson": {
  "moduleNumber": "Modulo {n}",
  "estimated": "Tempo stimato: {n} min",
  "back": "← Dashboard",
  "backToLesson": "← Lezione",
  "backToQuiz": "← Quiz",
  "toQuiz": "Vai al quiz →",
  "toFlashcards": "Vai alle flashcard →",
  "nextModule": "Modulo successivo →",
  "toSummary": "Vedi sintesi →"
}
```

`src/messages/en.json` — add:
```json
"Lesson": {
  "moduleNumber": "Module {n}",
  "estimated": "Estimated time: {n} min",
  "back": "← Dashboard",
  "backToLesson": "← Lesson",
  "backToQuiz": "← Quiz",
  "toQuiz": "Go to quiz →",
  "toFlashcards": "Go to flashcards →",
  "nextModule": "Next module →",
  "toSummary": "See summary →"
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/[locale]/m src/messages
git commit -m "feat(routes): add module lesson/quiz/flashcards pages with i18n labels"
```

---

## Task 1.11: validate-content script + first placeholder module

**Files:**
- Create: `scripts/validate-content.ts`
- Create: `content/it/modules/01-welcome.mdx` (placeholder)
- Create: `content/it/quizzes.json` (placeholder welcome only)
- Create: `content/it/flashcards.json` (placeholder welcome only)
- Create: `content/en/modules/01-welcome.mdx` (placeholder)
- Create: `content/en/quizzes.json` (placeholder welcome only)
- Create: `content/en/flashcards.json` (placeholder welcome only)

- [ ] **Step 1: Create `scripts/validate-content.ts`**

```ts
#!/usr/bin/env tsx
import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import { quizFileSchema, flashcardFileSchema, moduleFrontmatterSchema } from '../src/lib/content/schemas'
import { MODULE_ORDER } from '../src/lib/content/module-order'

const LOCALES = ['it', 'en'] as const
const ROOT = path.resolve(process.cwd(), 'content')

async function readJson(p: string) {
  return JSON.parse(await fs.readFile(p, 'utf8'))
}

async function fileExists(p: string) {
  try { await fs.access(p); return true } catch { return false }
}

async function main() {
  const errors: string[] = []
  for (const locale of LOCALES) {
    const localeDir = path.join(ROOT, locale)
    if (!(await fileExists(localeDir))) {
      errors.push(`[${locale}] missing directory ${localeDir}`)
      continue
    }
    // quizzes
    const quizPath = path.join(localeDir, 'quizzes.json')
    if (await fileExists(quizPath)) {
      const data = await readJson(quizPath)
      const r = quizFileSchema.safeParse(data)
      if (!r.success) errors.push(`[${locale}] quizzes.json: ${r.error.message}`)
    } else errors.push(`[${locale}] quizzes.json missing`)
    // flashcards
    const fcPath = path.join(localeDir, 'flashcards.json')
    if (await fileExists(fcPath)) {
      const data = await readJson(fcPath)
      const r = flashcardFileSchema.safeParse(data)
      if (!r.success) errors.push(`[${locale}] flashcards.json: ${r.error.message}`)
    } else errors.push(`[${locale}] flashcards.json missing`)
    // modules
    for (let i = 0; i < MODULE_ORDER.length; i++) {
      const slug = MODULE_ORDER[i]
      const order = String(i + 1).padStart(2, '0')
      const mdxPath = path.join(localeDir, 'modules', `${order}-${slug}.mdx`)
      if (!(await fileExists(mdxPath))) {
        errors.push(`[${locale}] missing ${order}-${slug}.mdx`)
        continue
      }
      const raw = await fs.readFile(mdxPath, 'utf8')
      const { data } = matter(raw)
      const r = moduleFrontmatterSchema.safeParse(data)
      if (!r.success) errors.push(`[${locale}] ${order}-${slug}.mdx frontmatter: ${r.error.message}`)
      else if (r.data.slug !== slug) errors.push(`[${locale}] ${order}-${slug}.mdx slug mismatch (frontmatter says "${r.data.slug}")`)
      else if (r.data.order !== i + 1) errors.push(`[${locale}] ${order}-${slug}.mdx order mismatch (frontmatter says ${r.data.order}, expected ${i + 1})`)
    }
  }
  if (errors.length > 0) {
    console.error('Content validation FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'))
    process.exit(1)
  }
  console.log('Content validation OK.')
}

main().catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 2: Create placeholder MDX `content/it/modules/01-welcome.mdx`**

```mdx
---
slug: welcome
order: 1
title: "Benvenuto in PVJets"
estimated_minutes: 8
sources: ["pvj_company_profile_3.pdf p.1"]
---

# Benvenuto in PVJets

(Contenuto in arrivo nella Phase 2 — questo è un placeholder funzionante.)

<KeyFact>Fly Private Every Time.</KeyFact>
```

- [ ] **Step 3: Create placeholder `content/it/quizzes.json`**

```json
{
  "welcome": [
    {
      "id": "q-w-001",
      "type": "mcq",
      "question": "Qual è il motto di PVJets?",
      "options": ["Fly Private Every Time", "Always Fly Higher", "Best in Sky", "Travel Like a King"],
      "correct_index": 0,
      "explanation": "Il motto ufficiale è 'Fly Private Every Time'."
    },
    {
      "id": "q-w-002",
      "type": "mcq",
      "question": "Come viene descritta l'identità di PVJets?",
      "options": [
        "Italian company with Swiss precision",
        "Swiss company with Italian flexibility",
        "French-Italian joint venture",
        "American operator in Europe"
      ],
      "correct_index": 0,
      "explanation": "PVJets è un'azienda italiana con precisione svizzera."
    }
  ]
}
```

- [ ] **Step 4: Create placeholder `content/it/flashcards.json`**

```json
{
  "welcome": [
    { "id": "f-w-001", "front": "Fly Private Every Time", "back": "Motto di PVJets — vola privato ogni volta, senza eccezioni.", "tags": ["brand"] },
    { "id": "f-w-002", "front": "Italian company with Swiss precision", "back": "Identità PVJets — radici italiane, eccellenza operativa svizzera.", "tags": ["brand"] }
  ]
}
```

- [ ] **Step 5: Mirror placeholders for EN**

`content/en/modules/01-welcome.mdx`:
```mdx
---
slug: welcome
order: 1
title: "Welcome to PVJets"
estimated_minutes: 8
sources: ["pvj_company_profile_3.pdf p.1"]
---

# Welcome to PVJets

(Content coming in Phase 2 — this is a working placeholder.)

<KeyFact>Fly Private Every Time.</KeyFact>
```

`content/en/quizzes.json`:
```json
{
  "welcome": [
    {
      "id": "q-w-001",
      "type": "mcq",
      "question": "What is the PVJets motto?",
      "options": ["Fly Private Every Time", "Always Fly Higher", "Best in Sky", "Travel Like a King"],
      "correct_index": 0,
      "explanation": "The official motto is 'Fly Private Every Time'."
    },
    {
      "id": "q-w-002",
      "type": "mcq",
      "question": "How is PVJets' identity described?",
      "options": [
        "Italian company with Swiss precision",
        "Swiss company with Italian flexibility",
        "French-Italian joint venture",
        "American operator in Europe"
      ],
      "correct_index": 0,
      "explanation": "PVJets is an Italian company with Swiss precision."
    }
  ]
}
```

`content/en/flashcards.json`:
```json
{
  "welcome": [
    { "id": "f-w-001", "front": "Fly Private Every Time", "back": "PVJets motto — fly private every time, no exception.", "tags": ["brand"] },
    { "id": "f-w-002", "front": "Italian company with Swiss precision", "back": "PVJets identity — Italian roots, Swiss operational excellence.", "tags": ["brand"] }
  ]
}
```

- [ ] **Step 6: Stub other modules to keep validation passing**

For modules 2–11 in both locales, create empty MDX files with frontmatter only (so validation passes for the whole structure), and add empty arrays in `quizzes.json`/`flashcards.json` for those slugs.

Use a small loop:
```bash
for i in 2 3 4 5 6 7 8 9 10 11; do
  for locale in it en; do
    case $i in
      2) slug=mission;;
      3) slug=global-reach;;
      4) slug=charter-membership;;
      5) slug=fleet;;
      6) slug=sustainability;;
      7) slug=private-aviation-market;;
      8) slug=aircraft-types;;
      9) slug=lead-qualification;;
      10) slug=whatsapp-communication;;
      11) slug=scenarios;;
    esac
    pad=$(printf '%02d' $i)
    mkdir -p "content/$locale/modules"
    cat > "content/$locale/modules/${pad}-${slug}.mdx" <<MDX
---
slug: ${slug}
order: ${i}
title: "${slug} (placeholder)"
estimated_minutes: 5
sources: []
---

(Placeholder — content arrives in later phases.)
MDX
  done
done
```

Then edit `content/it/quizzes.json` and `content/it/flashcards.json` (and EN mirrors) to add empty arrays for every slug not yet seeded:

```json
{
  "welcome": [ ... ],
  "mission": [],
  "global-reach": [],
  "charter-membership": [],
  "fleet": [],
  "sustainability": [],
  "private-aviation-market": [],
  "aircraft-types": [],
  "lead-qualification": [],
  "whatsapp-communication": [],
  "scenarios": []
}
```

- [ ] **Step 7: Run validator**

```bash
pnpm validate-content
```

Expected: `Content validation OK.`

- [ ] **Step 8: Run dev and walk the loop manually**

```bash
pnpm dev
```

Open `/it`. Click module 1. Read placeholder. Click "Vai al quiz". Answer the 2 MCQ. Go to flashcards. Mark known/unknown. Return to dashboard — module 1 should display 100% (lesson read + quiz best score 100% + deck completed).

Switch to `/en`. Verify the EN placeholder appears.

- [ ] **Step 9: Commit**

```bash
git add scripts/validate-content.ts content/
git commit -m "feat(content): add validate-content script and placeholder modules for all 11 slugs"
```

---

## Task 1.12: Reset dialog + dashboard reset button

**Files:**
- Create: `src/components/shared/ResetDialog.tsx`
- Modify: `src/app/[locale]/_dashboard.tsx`

- [ ] **Step 1: Create `src/components/shared/ResetDialog.tsx`**

```tsx
'use client'
import { useRef } from 'react'
import { useTranslations } from 'next-intl'

export function ResetDialog({ onConfirm }: { onConfirm: () => void }) {
  const t = useTranslations('Reset')
  const ref = useRef<HTMLDialogElement>(null)
  return (
    <>
      <button
        onClick={() => ref.current?.showModal()}
        className="text-sm text-pvj-navy/50 hover:text-error"
      >
        {t('button')}
      </button>
      <dialog ref={ref} className="rounded-md backdrop:bg-pvj-navy/40 p-6 max-w-md">
        <h3 className="display text-xl mb-3">{t('title')}</h3>
        <p className="text-pvj-navy/70 mb-6">{t('body')}</p>
        <div className="flex justify-end gap-2">
          <button onClick={() => ref.current?.close()} className="px-4 py-2 text-pvj-navy/60">{t('cancel')}</button>
          <button
            onClick={() => { onConfirm(); ref.current?.close() }}
            className="rounded-md bg-error px-4 py-2 text-white hover:bg-error/90"
          >
            {t('confirm')}
          </button>
        </div>
      </dialog>
    </>
  )
}
```

- [ ] **Step 2: Wire reset into dashboard**

Edit `src/app/[locale]/_dashboard.tsx` — replace the function body with:

```tsx
'use client'
import { useProgress } from '@/lib/progress/use-progress'
import { MODULE_ORDER } from '@/lib/content/module-order'
import { ModuleCard } from '@/components/dashboard/ModuleCard'
import { ProgressRing } from '@/components/dashboard/ProgressRing'
import { ResetDialog } from '@/components/shared/ResetDialog'
import type { ModuleFrontmatter } from '@/lib/content/schemas'

export function Dashboard({ metas, title, subtitle }: { metas: ModuleFrontmatter[]; title: string; subtitle: string }) {
  const { progress, stats, resetAll } = useProgress(MODULE_ORDER)
  return (
    <section>
      <header className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between mb-12">
        <div>
          <h1 className="display">{title}</h1>
          <p className="mt-2 text-pvj-navy/60">{subtitle}</p>
        </div>
        <ProgressRing value={stats.percentComplete} />
      </header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metas.map((meta) => (
          <ModuleCard key={meta.slug} meta={meta} progress={progress.modules[meta.slug]} />
        ))}
      </div>
      <div className="mt-12 text-right">
        <ResetDialog onConfirm={resetAll} />
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Add Reset translations**

`src/messages/it.json` — add:
```json
"Reset": {
  "button": "Ricomincia da capo",
  "title": "Sicuro di voler ricominciare?",
  "body": "Tutto il tuo progresso (lezioni lette, score quiz, flashcard) sarà cancellato. Non si può annullare.",
  "cancel": "Annulla",
  "confirm": "Sì, ricomincia"
}
```

`src/messages/en.json` — add:
```json
"Reset": {
  "button": "Start over",
  "title": "Restart from scratch?",
  "body": "All your progress (lessons read, quiz scores, flashcards) will be wiped. This cannot be undone.",
  "cancel": "Cancel",
  "confirm": "Yes, restart"
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/ResetDialog.tsx src/app/[locale]/_dashboard.tsx src/messages
git commit -m "feat(dashboard): add reset dialog with confirmation"
```

---

## Task 1.13: Phase 1 verification + tag

- [ ] **Step 1: Run all checks**

```bash
pnpm validate-content
pnpm test
pnpm typecheck
pnpm build
```

All four must succeed.

- [ ] **Step 2: Push and verify Vercel preview**

```bash
git push origin main
```

Wait for Vercel deploy. Open the production URL — full module-1 loop must work end-to-end (lesson + quiz + flashcards + dashboard reflects progress).

- [ ] **Step 3: Tag**

```bash
git tag -a phase-1-engine -m "Phase 1 complete: core engine, all routes, placeholder content for all 11 modules"
git push origin phase-1-engine
```

---

# Phase 2 — Modules 1-3 IT (Welcome, Mission, Global Reach)

**Goal:** real Italian content for the first three modules, sourced from the company profile. EN versions deferred to Phase 7.

**Source extraction:** before writing module content, run extraction once.

## Task 2.0: Extract source PDFs/DOCX/HTML to raw markdown

**Files:**
- Create: `scripts/extract-sources.ts`
- Generated (gitignored): `extracted/raw/*.md`

- [ ] **Step 1: Create `scripts/extract-sources.ts`**

```ts
#!/usr/bin/env tsx
import fs from 'node:fs/promises'
import path from 'node:path'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import mammoth from 'mammoth'
import * as cheerio from 'cheerio'

const execp = promisify(exec)

const ONBOARDING = '/Users/giorgiopluchino/Desktop/Claud/Clienti/RG-PVJ/PVJ/Onboarding'
const PVJ_ROOT = '/Users/giorgiopluchino/Desktop/Claud/Clienti/RG-PVJ/PVJ'
const SOP = path.join(PVJ_ROOT, 'SOP')
const QUIZ = path.join(PVJ_ROOT, 'QUIZ')
const OUT = path.join(ONBOARDING, 'extracted', 'raw')

const SOURCES: Array<{ key: string; src: string; kind: 'pdf' | 'docx' | 'html' }> = [
  { key: 'company-profile', src: path.join(ONBOARDING, 'pvj_company_profile_3.pdf'), kind: 'pdf' },
  { key: 'sop-qualificazione', src: path.join(PVJ_ROOT, 'PVJets_SOP_Qualificazione_Lead.docx'), kind: 'docx' },
  { key: 'sop-whatsapp', src: path.join(SOP, 'PVJets_SOP_SDR_WhatsApp_Communication_v1.docx'), kind: 'docx' },
  { key: 'sdr-playbook', src: path.join(SOP, 'PVJets_SDR_Playbook_Online_v1.html'), kind: 'html' },
  { key: 'training', src: path.join(QUIZ, 'training.pdf'), kind: 'pdf' },
]

async function extractPdf(src: string): Promise<string> {
  // Requires `pdftotext` on PATH (macOS: `brew install poppler`)
  const { stdout } = await execp(`pdftotext -layout "${src}" -`)
  return stdout
}

async function extractDocx(src: string): Promise<string> {
  const { value } = await mammoth.convertToMarkdown({ path: src })
  return value
}

async function extractHtml(src: string): Promise<string> {
  const html = await fs.readFile(src, 'utf8')
  const $ = cheerio.load(html)
  $('script, style, noscript').remove()
  return $('body').text().replace(/\n{3,}/g, '\n\n').trim()
}

async function main() {
  await fs.mkdir(OUT, { recursive: true })
  for (const s of SOURCES) {
    try {
      console.log(`Extracting ${s.key} (${s.kind})...`)
      const text = s.kind === 'pdf' ? await extractPdf(s.src)
                 : s.kind === 'docx' ? await extractDocx(s.src)
                 : await extractHtml(s.src)
      const outPath = path.join(OUT, `${s.key}.md`)
      await fs.writeFile(outPath, text, 'utf8')
      console.log(`  → ${outPath} (${text.length} chars)`)
    } catch (e) {
      console.warn(`  ! failed ${s.key}: ${(e as Error).message}`)
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 2: Verify `pdftotext` is available**

```bash
which pdftotext || brew install poppler
```

- [ ] **Step 3: Run extraction**

```bash
pnpm extract-sources
ls -la extracted/raw/
```

Expected: 5 `.md` files. Open each briefly and skim to confirm they contain readable text.

- [ ] **Step 4: Commit (script only — `extracted/raw` is gitignored)**

```bash
git add scripts/extract-sources.ts
git commit -m "chore(scripts): add extract-sources for PDFs/DOCX/HTML"
```

---

## Task 2.1: Module 1 — Welcome (IT)

**Files:**
- Modify: `content/it/modules/01-welcome.mdx`
- Modify: `content/it/quizzes.json` (replace `welcome` array)
- Modify: `content/it/flashcards.json` (replace `welcome` array)

**Source:** `extracted/raw/company-profile.md` — section "Welcome" (page 1) and "Mission & Core Values".

**Lesson length target:** 800-1200 words IT. Cover: founders' welcome message, identity ("Italian company with Swiss precision"), motto "Fly Private Every Time", what PVJets does at a glance, why it exists (removing inefficiencies, executives + HNWIs).

**Quiz target:** 6-8 MCQ.
**Flashcard target:** 10-12 cards covering identity, motto, founders, target customers, mission keywords.

- [ ] **Step 1: Open `extracted/raw/company-profile.md`** and identify the Welcome / Mission excerpt.

- [ ] **Step 2: Write the lesson MDX**

Replace `content/it/modules/01-welcome.mdx` entirely with the new content. Structure:

```mdx
---
slug: welcome
order: 1
title: "Benvenuto in PVJets"
estimated_minutes: 8
sources: ["pvj_company_profile_3.pdf p.1-4 (Welcome + Mission)"]
---

# Benvenuto in PVJets

[2-3 sentence intro — context for a brand-new SDR]

## La nostra identità

[paragraph: Italian company with Swiss precision, founders' vision, what makes PVJets different]

<KeyFact>Fly Private Every Time.</KeyFact>

[paragraph explaining the motto]

## Per chi voliamo

[paragraph on executives, HNWIs, frequency, fair pricing, impeccable service]

<Callout type="info">
  [insight: "Executive" e "HNWI" sono i due segmenti centrali, ma non parlano lo stesso linguaggio. Imparerai a distinguerli nel modulo 7.]
</Callout>

## Cosa rimuoviamo

[paragraph on inefficiencies in private aviation that PVJets eliminates]

## Il tuo ruolo come SDR

[short paragraph: as an SDR your job is to qualify these prospects and connect them with the right service. The 11 modules will give you the language and the tools.]
```

Fill in the bracketed sections with real prose synthesized from the extracted Welcome/Mission text. Keep the SDR-onboarding angle — speak directly to the new hire.

- [ ] **Step 3: Write 6-8 quiz questions**

Edit `content/it/quizzes.json`. Replace the `welcome` key with an array of 6-8 questions covering:
1. Who signs the welcome message (Marco Vitali — Co-Founder)
2. Identity ("Italian company with Swiss precision")
3. Motto ("Fly Private Every Time")
4. Target customers (executives + HNWIs)
5. Why PVJets exists (removing inefficiencies)
6. What "fair pricing and impeccable service" means in context
7. (optional) something specific about the founders' vision
8. (optional) what differentiates PVJets from a generic broker

Each question follows the schema (id `q-w-001` to `q-w-008`, mcq, 4 options, correct_index, explanation, source).

- [ ] **Step 4: Write 10-12 flashcards**

Edit `content/it/flashcards.json`. Replace the `welcome` key with an array of 10-12 cards. Suggested fronts: "Fly Private Every Time", "Italian company with Swiss precision", "Marco Vitali", "HNWI", "Executive private aviation", "On-demand", "Mission PVJets", "Inefficiencies removed", "Fair pricing", "Impeccable service", "European private aviation", "Top players unified".

Each card has id `f-w-001` to `f-w-012`, front, back (1-2 sentences), tags.

- [ ] **Step 5: Validate and run**

```bash
pnpm validate-content
pnpm dev
```

Open `/it/m/welcome` — content renders. Click through quiz and flashcards.

- [ ] **Step 6: Commit**

```bash
git add content/it/modules/01-welcome.mdx content/it/quizzes.json content/it/flashcards.json
git commit -m "content(welcome): write IT module 1 — Welcome to PVJets"
```

---

## Task 2.2: Module 2 — Mission & Core Values (IT)

**Files:**
- Modify: `content/it/modules/02-mission.mdx`
- Modify: `content/it/quizzes.json` (replace `mission`)
- Modify: `content/it/flashcards.json` (replace `mission`)

**Source:** `extracted/raw/company-profile.md` — section "Mission & Core Values | Excellence, Innovation & Client Commitment".

**Lesson target:** 800-1200 words. Cover: the three core values (Excellence, Innovation, Client Commitment), what each means concretely, examples from PVJets operations, how a values-aligned SDR behaves.

**Quiz:** 6-7 MCQ. **Flashcards:** 10-12.

- [ ] **Step 1: Read source extract on Mission & Core Values.**

- [ ] **Step 2: Write `02-mission.mdx`** with sections:
  - Intro (why values matter for an SDR)
  - Excellence — definition + behaviour
  - Innovation — definition + behaviour
  - Client Commitment — definition + behaviour
  - Use `<Comparison>` to show "values-aligned vs values-blind" SDR behaviours
  - Closing `<KeyFact>` summarising the three values

- [ ] **Step 3: Write quiz** (6-7 questions on definitions and applications, ids `q-mi-001` to `q-mi-007`).

- [ ] **Step 4: Write flashcards** (10-12 cards on each value, key behaviours, related glossary, ids `f-mi-001` to `f-mi-012`).

- [ ] **Step 5: Validate, run, walk through.**

```bash
pnpm validate-content
pnpm dev
```

- [ ] **Step 6: Commit**

```bash
git add content/it/modules/02-mission.mdx content/it/quizzes.json content/it/flashcards.json
git commit -m "content(mission): write IT module 2 — Mission & Core Values"
```

---

## Task 2.3: Module 3 — Global Reach & Strategic Presence (IT)

**Files:**
- Modify: `content/it/modules/03-global-reach.mdx`
- Modify: `content/it/quizzes.json`
- Modify: `content/it/flashcards.json`

**Source:** `extracted/raw/company-profile.md` — section "Global Reach & Strategic Presence | Key Destinations & International Network".

**Lesson:** 800-1200 words. Cover: where PVJets operates, key European hubs, partner network model, intercontinental reach, what "international service" means in private aviation operations.

**Quiz:** 6 MCQ. **Flashcards:** 10.

- [ ] **Step 1: Read source on Global Reach.**
- [ ] **Step 2: Write `03-global-reach.mdx`** with `<ImageFigure>` for a network map (placeholder `/images/pvj-network.svg` — we'll add the actual asset in Phase 8).
- [ ] **Step 3: Write 6 quiz questions** (ids `q-gr-001` to `q-gr-006`) on hubs, network model, intercontinental coverage.
- [ ] **Step 4: Write 10 flashcards** (ids `f-gr-001` to `f-gr-010`).
- [ ] **Step 5: Validate, run.**
- [ ] **Step 6: Commit**

```bash
git add content/it/modules/03-global-reach.mdx content/it/quizzes.json content/it/flashcards.json
git commit -m "content(global-reach): write IT module 3 — Global Reach & Strategic Presence"
```

---

## Task 2.4: Phase 2 batch verification

- [ ] **Step 1: Run full check**

```bash
pnpm validate-content && pnpm test && pnpm typecheck && pnpm build
```

- [ ] **Step 2: Walk modules 1-3 in dev locally.** Confirm: lesson reads, quiz scores update progress, flashcard known/unknown works, switching to `/en/m/welcome` still shows the placeholder (EN content will come in Phase 7).

- [ ] **Step 3: Push.**

```bash
git push origin main
```

- [ ] **Step 4: Tag**

```bash
git tag -a phase-2-modules-1-3-it -m "Phase 2: Italian content for modules 1-3 (Welcome, Mission, Global Reach)"
git push origin phase-2-modules-1-3-it
```

---

# Phase 3 — Modules 4-6 IT (Charter & Membership, Fleet, Sustainability)

Same task shape as Phase 2 — one task per module + a verification task.

## Task 3.1: Module 4 — On-Demand Charter & Membership (IT)

**Source:** `company-profile.md` "On-Demand Charter & Membership | Flexible Private Travel Solutions" (p.8-10).

**Lesson:** 1000-1500 words. Sections: the two commercial models, who uses each, pricing logic at a high level (no specific numbers — those change), customer journey for each.
Use `<Comparison>` for on-demand vs membership.
Use `<Callout type="note">` for the SDR insight on which questions distinguish a candidate for each model.

**Quiz:** 7-8 MCQ (ids `q-cm-001` to `q-cm-008`).
**Flashcards:** 12-15 cards (ids `f-cm-001` to `f-cm-015`).

- [ ] **Step 1**: Read source extract.
- [ ] **Step 2**: Write `04-charter-membership.mdx`.
- [ ] **Step 3**: Write quiz array.
- [ ] **Step 4**: Write flashcard array.
- [ ] **Step 5**: Validate, walk through.
- [ ] **Step 6**: Commit `content(charter-membership): write IT module 4 — On-Demand Charter & Membership`.

## Task 3.2: Module 5 — La nostra flotta (IT)

**Source:** `company-profile.md` "Our Fleet | Aircraft Categories & Performance Specifications" (p.11-16).

**Lesson:** 1200-1500 words. Sections: jet categories used by PVJets (light / midsize / super-mid / heavy / ultra-long-range), helicopters, what determines category choice for a mission, performance specs (range, pax) at high level.
Use `<FleetSpecCard>` for each major category — at least 5 cards.

**Quiz:** 8 MCQ (ids `q-fl-001` to `q-fl-008`) — focus on category-to-mission matching.
**Flashcards:** 13-15 (ids `f-fl-001` to `f-fl-015`) — categories, ranges, pax counts, example aircraft.

- [ ] **Step 1**: Read source.
- [ ] **Step 2**: Write `05-fleet.mdx`.
- [ ] **Step 3**: Write quiz.
- [ ] **Step 4**: Write flashcards.
- [ ] **Step 5**: Validate, walk through.
- [ ] **Step 6**: Commit `content(fleet): write IT module 5 — La nostra flotta`.

## Task 3.3: Module 6 — Sostenibilità & strategia futura (IT)

**Source:** `company-profile.md` "Sustainability & Future Strategy | Carbon-Neutral Flights & Eco Initiatives" (p.17).

**Lesson:** 800-1100 words. Cover: carbon neutrality, SAF (Sustainable Aviation Fuel), offset strategy, what to say to clients who raise sustainability concerns.

**Quiz:** 5-6 MCQ (ids `q-su-001` to `q-su-006`).
**Flashcards:** 8-10 (ids `f-su-001` to `f-su-010`) — SAF, offsets, key terms.

- [ ] **Step 1**: Read source.
- [ ] **Step 2**: Write `06-sustainability.mdx`.
- [ ] **Step 3**: Write quiz.
- [ ] **Step 4**: Write flashcards.
- [ ] **Step 5**: Validate, walk through.
- [ ] **Step 6**: Commit `content(sustainability): write IT module 6 — Sostenibilità & strategia futura`.

## Task 3.4: Phase 3 verification + tag

- [ ] **Step 1**: Run full check.
- [ ] **Step 2**: Walk modules 4-6 in dev.
- [ ] **Step 3**: Push.
- [ ] **Step 4**: Tag `phase-3-modules-4-6-it`.

---

# Phase 4 — Modules 7-8 IT (Market, Aircraft Types)

These two modules synthesize **knowledge generale** (written by Claude based on consolidated private aviation knowledge) cross-checked with `extracted/raw/training.md` and Company Profile.

## Task 4.1: Module 7 — Il mercato del private aviation (IT)

**Lesson:** 1200-1500 words. Sections:
- The actors: owner / operator / broker / charterer (clear distinctions)
- Customer segments: HNWI / UHNWI / executives / family offices
- Commercial models: dry lease, wet lease, fractional, jet card, on-demand
- Operational concepts: positioning flight, ferry flight, FBO, slots, handling
- Where PVJets fits (broker + curated operator network)

Use `<Aside>` blocks for "common confusions" (e.g., broker ≠ operator).

**Quiz:** 8 MCQ (ids `q-pm-001` to `q-pm-008`) — definition tests.
**Flashcards:** 18-20 cards (ids `f-pm-001` to `f-pm-020`) — every term gets a card.

- [ ] **Step 1**: Cross-check terminology in `extracted/raw/training.md` and `company-profile.md`.
- [ ] **Step 2**: Write `07-private-aviation-market.mdx`.
- [ ] **Step 3**: Write quiz.
- [ ] **Step 4**: Write flashcards.
- [ ] **Step 5**: Validate, walk through.
- [ ] **Step 6**: Commit `content(private-aviation-market): write IT module 7 — Il mercato del private aviation`.

## Task 4.2: Module 8 — Tipologie di aircraft (IT)

**Lesson:** 1200-1500 words. Sections:
- VLJ — Very Light Jet (range, pax, examples Phenom 100, Citation Mustang, HondaJet)
- Light Jet (Citation CJ3+, Phenom 300, Learjet 75)
- Midsize (Citation XLS+, Hawker 900XP)
- Super-Midsize (Challenger 350, Citation Longitude, Praetor 600)
- Heavy (Falcon 7X, Challenger 650, Gulfstream G450)
- Ultra-Long-Range (Global 6000/7500, G550/650, Falcon 8X)
- Helicopters quick mention (AW139, H145)
- How to map a mission (city-pair, pax, baggage, runway constraints) to a category

Use `<FleetSpecCard>` for each category, total ~7 cards.
Use `<Comparison>` for "Light vs Midsize" and "Heavy vs Ultra-Long".

**Quiz:** 8 MCQ (ids `q-at-001` to `q-at-008`).
**Flashcards:** 18-22 cards (ids `f-at-001` to `f-at-022`) — one per category + key examples.

- [ ] **Step 1**: Write `08-aircraft-types.mdx`.
- [ ] **Step 2**: Write quiz.
- [ ] **Step 3**: Write flashcards.
- [ ] **Step 4**: Validate, walk through.
- [ ] **Step 5**: Commit `content(aircraft-types): write IT module 8 — Tipologie di aircraft`.

## Task 4.3: Phase 4 verification + tag

- [ ] Standard checks, push, tag `phase-4-modules-7-8-it`.

---

# Phase 5 — Modules 9-11 IT (Lead qualification, WhatsApp, Scenarios)

## Task 5.1: Module 9 — Come qualifichiamo un lead (IT)

**Source:** `extracted/raw/sop-qualificazione.md` + `extracted/raw/sdr-playbook.md` (sections on qualification).

**Lesson:** 1200-1500 words. Sections:
- Why we qualify (avoid wasted broker time, match capacity)
- The 5 PVJ qualification criteria (synthesize from SOP — likely budget, route, urgency, segment, decision authority)
- The qualification flow (touchpoints, questions to ask, how to score)
- Red flags vs green flags
- When to escalate to a broker

Use `<Callout type="warning">` for red flags.
Use `<Comparison>` for "qualified vs unqualified lead".

**Quiz:** 8 MCQ (ids `q-lq-001` to `q-lq-008`) — apply the criteria.
**Flashcards:** 14-16 cards (ids `f-lq-001` to `f-lq-016`).

- [ ] **Step 1**: Read SOP qualificazione and SDR playbook excerpts. Identify the 5 criteria as PVJ uses them.
- [ ] **Step 2**: Write `09-lead-qualification.mdx`.
- [ ] **Step 3**: Write quiz.
- [ ] **Step 4**: Write flashcards.
- [ ] **Step 5**: Validate, walk through.
- [ ] **Step 6**: Commit `content(lead-qualification): write IT module 9 — Come qualifichiamo un lead`.

## Task 5.2: Module 10 — Comunicazione: WhatsApp & first touch (IT)

**Source:** `extracted/raw/sop-whatsapp.md` + relevant section of `sdr-playbook.md`.

**Lesson:** 1000-1300 words. Sections:
- Tone of voice (formal but warm, never casual, never bureaucratic)
- Opening message templates (3-4 examples in `<Comparison>`)
- Do/Don't with concrete examples
- Response timing expectations
- When to switch to a call vs stay on WhatsApp

Use `<Aside>` for "Don't write 'ciao'" and similar specifics from the SOP.

**Quiz:** 7 MCQ (ids `q-wa-001` to `q-wa-007`) — recognise tone-correct messages.
**Flashcards:** 12 cards (ids `f-wa-001` to `f-wa-012`).

- [ ] **Step 1**: Read SOP whatsapp.
- [ ] **Step 2**: Write `10-whatsapp-communication.mdx`.
- [ ] **Step 3**: Write quiz.
- [ ] **Step 4**: Write flashcards.
- [ ] **Step 5**: Validate, walk through.
- [ ] **Step 6**: Commit `content(whatsapp-communication): write IT module 10 — Comunicazione WhatsApp & first touch`.

## Task 5.3: Module 11 — Casi pratici: scenari (IT)

**Source:** synthesis of SOP qualificazione + SDR playbook + WhatsApp SOP. Optional reference to `extracted/raw/training.md` for any concrete examples.

**Lesson:** 300-500 words (intro to the framework — the bulk is in the scenarios).

Sections:
- Why scenarios — putting modules 7-10 into practice
- The decision framework (referencing modules 9 and 10): identify segment → identify model → identify next action
- "How to read the scenarios" — there's no single right answer, but there's always a clearly best one given PVJ values

**Quiz** (4 scenario-style MCQ, ids `q-sc-001` to `q-sc-004`):

1. **Lead da broker estero:** "Ti scrive un broker greco con cui non hai mai lavorato chiedendo un Falcon Athens-Dubai per domani per un cliente VIP. Cosa fai?" — 4 options including "respond immediately with a quote", "ask for KYC and previous-flight history first", "redirect to senior broker", "ignore until office hours".
2. **Cliente HNWI privato:** "Una signora ti scrive 'Avrei bisogno di un volo per andare a Capri il weekend del 15 maggio per 6 persone, è possibile?' Cosa fai per primo?" — 4 options on what to ask.
3. **Richiesta sospetta / off-pattern:** "Ti chiama un numero sconosciuto chiedendo un volo cargo non commerciale Sofia-Lagos pagato in cash. Cosa fai?" — qualification + escalation question.
4. **Richiesta complessa multi-leg:** "Cliente regular: Roma → Londra (martedì), Londra → New York (mercoledì), New York → Roma (venerdì sera), 8 pax con bagagli golf. Cosa proponi?" — aircraft category + commercial-model recommendation.

Each scenario has 4 options where one is clearly best per PVJ values+SOP, and the explanation walks through why.

**Flashcards:** 8-10 cards (ids `f-sc-001` to `f-sc-010`) summarising the decision criteria used in the scenarios.

- [ ] **Step 1**: Write the framework lesson.
- [ ] **Step 2**: Write the 4 scenario MCQ.
- [ ] **Step 3**: Write 8-10 flashcards.
- [ ] **Step 4**: Validate, walk through. Verify in dev that the quiz step renders the long scenario question text without layout breakage.
- [ ] **Step 5**: Commit `content(scenarios): write IT module 11 — Casi pratici scenari`.

## Task 5.4: Phase 5 verification + tag

- [ ] Standard checks, push, tag `phase-5-modules-9-11-it`.
- [ ] Verify: an Italian user can complete all 11 modules end-to-end with real content. The dashboard shows 100% after completion. The summary placeholder still appears (until Phase 6).

---

# Phase 6 — Glossary + Summary + Polish

## Task 6.1: Glossary aggregation script + page

**Files:**
- Create: `scripts/generate-glossary.ts`
- Create: `src/components/glossary/GlossaryTable.tsx`
- Create: `src/app/[locale]/glossary/page.tsx`

- [ ] **Step 1: Create `scripts/generate-glossary.ts`** (optional helper — produces a JSON sorted by tag for inspection)

```ts
#!/usr/bin/env tsx
import fs from 'node:fs/promises'
import path from 'node:path'

const LOCALES = ['it', 'en'] as const

async function main() {
  for (const locale of LOCALES) {
    const file = path.resolve('content', locale, 'flashcards.json')
    const raw = JSON.parse(await fs.readFile(file, 'utf8'))
    const all: any[] = []
    for (const [module, cards] of Object.entries<any[]>(raw)) {
      for (const c of cards) all.push({ ...c, module })
    }
    all.sort((a, b) => a.front.localeCompare(b.front))
    const out = path.resolve('content', locale, 'glossary-index.json')
    await fs.writeFile(out, JSON.stringify(all, null, 2), 'utf8')
    console.log(`[${locale}] glossary: ${all.length} entries → ${out}`)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
```

(Note: the page does not depend on this file — it computes the same on the fly via `getAllFlashcards`. The script exists as a debugging aid.)

- [ ] **Step 2: Create `src/components/glossary/GlossaryTable.tsx`**

```tsx
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
    return entries.filter((e) =>
      e.front.toLowerCase().includes(needle) ||
      e.back.toLowerCase().includes(needle) ||
      e.tags.some((t) => t.toLowerCase().includes(needle))
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
              <Link href={`/m/${e.module}`} className="text-xs text-pvj-gold whitespace-nowrap">{e.module} →</Link>
            </div>
            <p className="mt-1 text-pvj-navy/80 text-sm">{e.back}</p>
            {e.tags.length > 0 && (
              <p className="mt-2 text-xs text-pvj-navy/40">{e.tags.join(' · ')}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

- [ ] **Step 3: Create `src/app/[locale]/glossary/page.tsx`**

```tsx
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { getAllFlashcards } from '@/lib/content/load-flashcards'
import { GlossaryTable } from '@/components/glossary/GlossaryTable'

export default async function GlossaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const entries = await getAllFlashcards(locale as 'it' | 'en')
  entries.sort((a, b) => a.front.localeCompare(b.front))
  const t = await getTranslations('Glossary')
  return (
    <section>
      <h1 className="display mb-2">{t('title')}</h1>
      <p className="text-pvj-navy/60 mb-8">{t('subtitle')}</p>
      <GlossaryTable entries={entries} />
    </section>
  )
}
```

- [ ] **Step 4: Add Glossary translations**

`src/messages/it.json` — add:
```json
"Glossary": {
  "title": "Glossario",
  "subtitle": "Tutte le flashcard di tutti i moduli, ricercabili. Usalo come riferimento rapido.",
  "searchPlaceholder": "Cerca un termine…",
  "count": "{n} voci"
}
```

`src/messages/en.json` — add:
```json
"Glossary": {
  "title": "Glossary",
  "subtitle": "All flashcards from every module, searchable. Use as a quick reference.",
  "searchPlaceholder": "Search a term…",
  "count": "{n} entries"
}
```

- [ ] **Step 5: Run dev, visit `/it/glossary`** — verify all flashcards are listed, search filters, click on module link returns to lesson.

- [ ] **Step 6: Commit**

```bash
git add scripts/generate-glossary.ts src/components/glossary src/app/[locale]/glossary src/messages
git commit -m "feat(glossary): add searchable aggregated glossary page"
```

---

## Task 6.2: Summary page

**Files:**
- Create: `src/components/summary/SummaryHeader.tsx`
- Create: `src/components/summary/ModuleScoreTable.tsx`
- Create: `src/components/summary/FlashcardReviewList.tsx`
- Create: `src/app/[locale]/summary/page.tsx`
- Create: `src/app/[locale]/summary/_summary-client.tsx`

- [ ] **Step 1: Implement `SummaryHeader.tsx`**

```tsx
'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

export function SummaryHeader({ percent, totalTimeMs }: { percent: number; totalTimeMs: number }) {
  const t = useTranslations('Summary')
  const [name, setName] = useState(typeof window !== 'undefined' ? localStorage.getItem('pvj-onboarding-username') ?? '' : '')

  function update(v: string) {
    setName(v)
    if (typeof window !== 'undefined') localStorage.setItem('pvj-onboarding-username', v)
  }

  const minutes = Math.floor(totalTimeMs / 60_000)
  const hours = Math.floor(minutes / 60)
  const remMin = minutes % 60
  const timeStr = hours > 0 ? `${hours}h ${remMin}m` : `${remMin}m`

  return (
    <header className="text-center space-y-3 mb-12">
      <p className="text-sm uppercase tracking-wider text-pvj-gold">PVJets</p>
      <h1 className="display">
        {t('completed')}{name ? ` — ${name}` : ''}
      </h1>
      <input
        placeholder={t('namePlaceholder')}
        value={name}
        onChange={(e) => update(e.target.value)}
        className="border-b border-pvj-cream-200 bg-transparent text-center px-2 py-1 text-pvj-navy/70 focus:outline-none focus:border-pvj-gold"
      />
      <p className="text-pvj-navy/60">{t('totalTime', { time: timeStr })} · {Math.round(percent * 100)}%</p>
    </header>
  )
}
```

- [ ] **Step 2: Implement `ModuleScoreTable.tsx`**

```tsx
'use client'
import { useTranslations } from 'next-intl'
import type { Progress } from '@/lib/progress/types'
import type { ModuleFrontmatter } from '@/lib/content/schemas'

export function ModuleScoreTable({ progress, metas }: { progress: Progress; metas: ModuleFrontmatter[] }) {
  const t = useTranslations('Summary')
  return (
    <section className="mb-12">
      <h2 className="display mb-4">{t('modulesTitle')}</h2>
      <table className="w-full text-sm">
        <thead className="text-left text-xs uppercase tracking-wider text-pvj-navy/50 border-b border-pvj-cream-200">
          <tr><th className="py-2">#</th><th>{t('colModule')}</th><th>{t('colScore')}</th><th>{t('colAttempts')}</th></tr>
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
```

- [ ] **Step 3: Implement `FlashcardReviewList.tsx`**

```tsx
'use client'
import { Link } from '@/lib/i18n/routing'
import { useTranslations } from 'next-intl'
import type { Flashcard } from '@/lib/content/schemas'
import type { ModuleSlug } from '@/lib/content/module-order'

export function FlashcardReviewList({ items }: { items: Array<Flashcard & { module: ModuleSlug }> }) {
  const t = useTranslations('Summary')
  if (items.length === 0) return <p className="text-pvj-navy/60">{t('flashcardReviewEmpty')}</p>
  return (
    <section className="mb-12">
      <h2 className="display mb-4">{t('reviewTitle', { n: items.length })}</h2>
      <ul className="space-y-2">
        {items.map((c) => (
          <li key={c.id} className="rounded-md border border-pvj-cream-200 bg-white p-3 flex items-baseline justify-between gap-4">
            <div>
              <p className="display">{c.front}</p>
              <p className="text-xs text-pvj-navy/50 mt-0.5">{c.module}</p>
            </div>
            <Link href={`/m/${c.module}/flashcards`} className="text-xs text-pvj-gold whitespace-nowrap">{t('reviewLink')}</Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
```

- [ ] **Step 4: Implement `_summary-client.tsx`**

```tsx
'use client'
import { useProgress } from '@/lib/progress/use-progress'
import { MODULE_ORDER } from '@/lib/content/module-order'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/routing'
import { SummaryHeader } from '@/components/summary/SummaryHeader'
import { ModuleScoreTable } from '@/components/summary/ModuleScoreTable'
import { FlashcardReviewList } from '@/components/summary/FlashcardReviewList'
import { ResetDialog } from '@/components/shared/ResetDialog'
import type { ModuleFrontmatter, Flashcard } from '@/lib/content/schemas'
import type { ModuleSlug } from '@/lib/content/module-order'

export function SummaryClient({ metas, allFlashcards }: { metas: ModuleFrontmatter[]; allFlashcards: Array<Flashcard & { module: ModuleSlug }> }) {
  const t = useTranslations('Summary')
  const { progress, stats, resetAll } = useProgress(MODULE_ORDER)
  const incomplete = stats.modulesCompleted < stats.totalModules

  const unknownIds = new Set<string>()
  for (const slug of MODULE_ORDER) {
    const mp = progress.modules[slug]
    mp?.flashcards.unknown.forEach((id) => unknownIds.add(id))
  }
  const reviewItems = allFlashcards.filter((c) => unknownIds.has(c.id))

  if (incomplete) {
    const missing = metas.filter((m) => !progress.modules[m.slug] || progress.modules[m.slug].quiz.bestScore === null)
    return (
      <section className="text-center py-16">
        <h1 className="display mb-4">{t('lockedTitle')}</h1>
        <p className="text-pvj-navy/60 mb-8">
          {t('lockedBody', { done: stats.modulesCompleted, total: stats.totalModules })}
        </p>
        <ul className="text-left max-w-md mx-auto space-y-1 mb-8">
          {missing.map((m) => (
            <li key={m.slug}><Link href={`/m/${m.slug}`} className="text-pvj-gold underline-offset-4 hover:underline">{m.order}. {m.title}</Link></li>
          ))}
        </ul>
        <Link href="/" className="text-pvj-navy/60 hover:text-pvj-navy">← Dashboard</Link>
      </section>
    )
  }

  return (
    <article className="mx-auto max-w-[720px]">
      <SummaryHeader percent={stats.percentComplete} totalTimeMs={progress.totalTimeMs} />
      <ModuleScoreTable progress={progress} metas={metas} />
      <FlashcardReviewList items={reviewItems} />
      <div className="mt-12 flex items-center justify-between border-t border-pvj-cream-200 pt-6 no-print">
        <button onClick={() => window.print()} className="rounded-md border border-pvj-navy/20 px-4 py-2 text-pvj-navy hover:bg-pvj-navy-50">
          {t('print')}
        </button>
        <ResetDialog onConfirm={resetAll} />
      </div>
    </article>
  )
}
```

- [ ] **Step 5: Implement `src/app/[locale]/summary/page.tsx`**

```tsx
import { setRequestLocale } from 'next-intl/server'
import { getAllModuleMeta } from '@/lib/content/load-module-meta'
import { getAllFlashcards } from '@/lib/content/load-flashcards'
import { SummaryClient } from './_summary-client'

export default async function SummaryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const metas = await getAllModuleMeta(locale as 'it' | 'en')
  const allFlashcards = await getAllFlashcards(locale as 'it' | 'en')
  return <SummaryClient metas={metas} allFlashcards={allFlashcards} />
}
```

- [ ] **Step 6: Add Summary translations**

`src/messages/it.json` — add:
```json
"Summary": {
  "completed": "Onboarding completato",
  "namePlaceholder": "Il tuo nome (opzionale)",
  "totalTime": "Tempo totale: {time}",
  "modulesTitle": "Moduli completati",
  "colModule": "Modulo", "colScore": "Score", "colAttempts": "Tentativi",
  "reviewTitle": "Flashcard da ripassare ({n})",
  "reviewLink": "Apri →",
  "flashcardReviewEmpty": "Nessuna flashcard segnata come 'Non sapevo'. Hai memorizzato tutto.",
  "lockedTitle": "Sintesi bloccata",
  "lockedBody": "Hai completato {done}/{total} moduli. Finisci il percorso per sbloccare la sintesi.",
  "print": "Stampa sintesi"
}
```

`src/messages/en.json` — add:
```json
"Summary": {
  "completed": "Onboarding complete",
  "namePlaceholder": "Your name (optional)",
  "totalTime": "Total time: {time}",
  "modulesTitle": "Modules completed",
  "colModule": "Module", "colScore": "Score", "colAttempts": "Attempts",
  "reviewTitle": "Flashcards to review ({n})",
  "reviewLink": "Open →",
  "flashcardReviewEmpty": "No flashcards marked 'didn't know'. You memorised everything.",
  "lockedTitle": "Summary locked",
  "lockedBody": "You completed {done}/{total} modules. Finish the journey to unlock the summary.",
  "print": "Print summary"
}
```

- [ ] **Step 7: Test**

Run dev, complete all modules in IT, navigate to `/it/summary` — full view should render.
Click "Stampa sintesi" — print preview must hide header/footer.

- [ ] **Step 8: Commit**

```bash
git add src/components/summary src/app/[locale]/summary src/messages
git commit -m "feat(summary): add summary page with score table, review list, print"
```

---

## Task 6.3: Active-time tracker (totalTimeMs)

**Goal:** keep `progress.totalTimeMs` updated only while the tab is visible.

**Files:**
- Create: `src/components/shared/ActiveTimeTracker.tsx`
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Implement `src/components/shared/ActiveTimeTracker.tsx`**

```tsx
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
      writeProgress({ ...p, totalTimeMs: p.totalTimeMs + delta, lastActivityAt: new Date().toISOString() })
    }

    function start() { last = Date.now(); id = window.setInterval(tick, TICK_MS) }
    function stop() { if (id !== null) { window.clearInterval(id); id = null } }

    function onVis() { if (document.visibilityState === 'visible') start(); else stop() }

    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => { stop(); document.removeEventListener('visibilitychange', onVis) }
  }, [])
  return null
}
```

- [ ] **Step 2: Mount in locale layout**

Edit `src/app/[locale]/layout.tsx`. Inside `<NextIntlClientProvider>`, add `<ActiveTimeTracker />`:

```tsx
import { ActiveTimeTracker } from '@/components/shared/ActiveTimeTracker'
// ...
<NextIntlClientProvider>
  <ActiveTimeTracker />
  <Header />
  ...
</NextIntlClientProvider>
```

- [ ] **Step 3: Verify**

Open dev, leave tab focused for ~30s, check via DevTools localStorage that `totalTimeMs` is increasing. Switch tab → counter pauses. Return → resumes.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/ActiveTimeTracker.tsx src/app/[locale]/layout.tsx
git commit -m "feat(progress): track active time only while tab visible"
```

---

## Task 6.4: Phase 6 verification + tag

- [ ] Standard checks (`pnpm validate-content && pnpm test && pnpm typecheck && pnpm build`).
- [ ] Walk a full IT loop: dashboard → 11 modules → glossary → summary.
- [ ] Push, tag `phase-6-glossary-summary`.

---

# Phase 7 — EN translation

**Goal:** mirror modules 1-11 in English. Schema/order/ids must match exactly across IT and EN — only the `title`, `question`, `options`, `explanation`, `front`, `back`, and the MDX prose change.

## Task 7.1: Module 1 EN — Welcome to PVJets

**Files:**
- Modify: `content/en/modules/01-welcome.mdx`
- Modify: `content/en/quizzes.json` (key `welcome`)
- Modify: `content/en/flashcards.json` (key `welcome`)

- [ ] **Step 1**: Translate the IT prose to EN preserving structure.
- [ ] **Step 2**: For each quiz question, mirror the same `id`, `correct_index`, `source`. Translate `question`, `options`, `explanation`.
- [ ] **Step 3**: For each flashcard, mirror the same `id`, `tags`. Translate `front` and `back`.
- [ ] **Step 4**: Validate.
- [ ] **Step 5**: Commit `content(en/welcome): translate module 1 to English`.

## Tasks 7.2 — 7.11: One task per module (2-11), same shape as 7.1

- [ ] 7.2 Module 2 — Mission & Core Values
- [ ] 7.3 Module 3 — Global Reach & Strategic Presence
- [ ] 7.4 Module 4 — On-Demand Charter & Membership
- [ ] 7.5 Module 5 — Our Fleet
- [ ] 7.6 Module 6 — Sustainability & Future Strategy
- [ ] 7.7 Module 7 — The Private Aviation Market
- [ ] 7.8 Module 8 — Aircraft Types in Detail
- [ ] 7.9 Module 9 — How We Qualify a Lead
- [ ] 7.10 Module 10 — Customer Communication: WhatsApp & First Touch
- [ ] 7.11 Module 11 — Practical Scenarios

For each: translate prose, mirror quiz/flashcard ids and shape, validate, walk through, commit.

## Task 7.12: Phase 7 verification + tag

- [ ] Run validator on both locales.
- [ ] Walk one EN loop end-to-end (`/en` → modules 1–11 → glossary → summary).
- [ ] Push, tag `phase-7-en-translation`.

---

# Phase 8 — Polish, smoke E2E, production cutover

## Task 8.1: Real assets — favicon, logo, hero image, network map

**Files:**
- Create: `public/favicon.ico`, `public/icon.svg`
- Create: `public/images/pvj-logo.svg`
- Create: `public/images/hero-jet.jpg` (or similar)
- Create: `public/images/pvj-network.svg`
- Modify: any MDX referencing placeholder images

- [ ] **Step 1: Extract logo from company profile PDF** using `pdfimages`:

```bash
pdfimages -png pvj_company_profile_3.pdf extracted/raw/img-cp
ls extracted/raw/img-cp-*.png
```

- [ ] **Step 2: Manually pick the logo + the most usable hero candidate**, rename and place under `public/images/`. Convert to SVG if a clean version is available; otherwise compress to AVIF + WebP.

- [ ] **Step 3: Replace placeholder favicon**

```bash
node -e "const fs=require('fs'); /* skip — produce real favicon outside or use online tool */"
```

If no real favicon is available, leave the 1×1 placeholder and add a TODO in `README.md` (acceptable for internal use).

- [ ] **Step 4: Update MDX modules** that referenced `/images/pvj-network.svg` or hero placeholders.

- [ ] **Step 5: Commit**

```bash
git add public/images public/favicon.ico
git commit -m "feat(assets): add real logo, hero image, network map; update MDX references"
```

---

## Task 8.2: Playwright smoke E2E

**Files:**
- Create: `tests/e2e/dashboard.spec.ts`
- Create: `tests/e2e/module-flow.spec.ts`
- Create: `tests/e2e/lang-switch.spec.ts`
- Create: `tests/e2e/reset.spec.ts`
- Create: `tests/e2e/summary.spec.ts`

- [ ] **Step 1: Install Playwright browsers**

```bash
pnpm exec playwright install chromium
```

- [ ] **Step 2: Write `tests/e2e/dashboard.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('dashboard shows 11 modules and 0% on first visit', async ({ page, context }) => {
  await context.clearCookies()
  await page.addInitScript(() => localStorage.clear())
  await page.goto('/')
  await expect(page).toHaveURL(/\/it/)
  await expect(page.getByRole('heading', { name: /Onboarding SDR/ })).toBeVisible()
  const cards = page.locator('a[href*="/m/"]')
  await expect(cards).toHaveCount(11)
})
```

- [ ] **Step 3: Write `tests/e2e/module-flow.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('completing module 1 marks it done on dashboard', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
  await page.goto('/it/m/welcome')
  // scroll to bottom and click toQuiz
  await page.getByRole('link', { name: /quiz/i }).click()
  await expect(page).toHaveURL(/\/m\/welcome\/quiz$/)
  // answer all questions: click the first option for every question, then "Next"/"Finish"
  for (let i = 0; i < 8; i++) { // upper bound
    const visible = await page.locator('button:has-text(":")').first().isVisible().catch(() => false)
    const opts = page.locator('ul button')
    if ((await opts.count()) === 0) break
    await opts.first().click()
    const next = page.getByRole('button', { name: /(Successiva|Vedi risultato)/ })
    if (await next.isVisible()) await next.click()
    else break
  }
  // Result bar shown
  await expect(page.getByText(/Risultato/)).toBeVisible()
  // navigate to flashcards
  await page.goto('/it/m/welcome/flashcards')
  // Mark each flashcard known
  let safety = 25
  while (safety-- > 0) {
    const flip = page.getByRole('button', { name: /Flip card/i })
    if (!(await flip.isVisible().catch(() => false))) break
    await flip.click()
    const known = page.getByRole('button', { name: /Sapevo/ })
    if (!(await known.isVisible().catch(() => false))) break
    await known.click()
  }
  // back to dashboard
  await page.goto('/it')
  // module welcome should show "Completato"
  const card = page.locator('a[href$="/m/welcome"]')
  await expect(card.getByText(/Completato/)).toBeVisible()
})
```

- [ ] **Step 4: Write `tests/e2e/lang-switch.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('switching language preserves position', async ({ page }) => {
  await page.goto('/it/m/welcome')
  await page.getByRole('button', { name: /^EN$/ }).click()
  await expect(page).toHaveURL(/\/en\/m\/welcome$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Welcome|Mission|PVJets/)
})
```

- [ ] **Step 5: Write `tests/e2e/reset.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('reset clears localStorage and progress UI', async ({ page }) => {
  await page.goto('/it')
  await page.evaluate(() => localStorage.setItem('pvj-onboarding-progress-v1', JSON.stringify({ version: 1, modules: { welcome: { lessonReadAt: '2026-01-01', quiz: { attempts:[], bestScore: 1 }, flashcards: { known:['x'], unknown:[], completedAt:'2026-01-01' } } }, totalTimeMs: 0, startedAt: null, lastActivityAt: null, locale: 'it' })))
  await page.reload()
  const card = page.locator('a[href$="/m/welcome"]')
  await expect(card.getByText(/Completato/)).toBeVisible()
  await page.getByRole('button', { name: /Ricomincia da capo/ }).click()
  await page.getByRole('button', { name: /Sì, ricomincia/ }).click()
  await expect(card.getByText(/Completato/)).not.toBeVisible()
})
```

- [ ] **Step 6: Write `tests/e2e/summary.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('summary shows locked state when incomplete', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear())
  await page.goto('/it/summary')
  await expect(page.getByText(/Sintesi bloccata/)).toBeVisible()
})
```

- [ ] **Step 7: Run E2E**

```bash
pnpm dev &  # or rely on webServer config
pnpm test:e2e
```

Expected: 5 tests pass.

- [ ] **Step 8: Commit**

```bash
git add tests/e2e
git commit -m "test(e2e): add 5 smoke Playwright tests covering dashboard, module flow, lang switch, reset, summary"
```

---

## Task 8.3: Performance pass

- [ ] **Step 1: Build prod and inspect bundle**

```bash
pnpm build
```

Look at the build output `First Load JS` for `/`. Target: < 130 KB (we said < 100 KB but next-intl + MDX legitimately raise the floor — accept up to 150 KB if needed).

- [ ] **Step 2: Run Lighthouse on a Vercel preview URL**

```bash
pnpm exec lhci autorun --collect.url=https://onboarding-pvj.vercel.app/it 2>/dev/null || npx -y lighthouse https://onboarding-pvj.vercel.app/it --only-categories=performance,accessibility --output=json --output-path=./lighthouse.json
```

Target: Performance ≥ 90, Accessibility ≥ 90.

- [ ] **Step 3: Fix any low-hanging issues** (missing `alt`, `aria-label`, font preload).

- [ ] **Step 4: Commit fixes individually with descriptive messages.**

---

## Task 8.4: README + CONTRIBUTING

**Files:**
- Modify: `README.md`
- Create: `CONTRIBUTING.md`

- [ ] **Step 1: Update `README.md`**

Replace placeholder README with: project description, dev quickstart, structure overview, deploy notes, link to spec and plan.

- [ ] **Step 2: Create `CONTRIBUTING.md`**

Document:
- How to add or edit a module (which files, what fields)
- How to run validation and tests
- How to extract source materials (and the local-only convention for PDFs)

- [ ] **Step 3: Commit**

```bash
git add README.md CONTRIBUTING.md
git commit -m "docs: write user-facing README and contributing guide"
```

---

## Task 8.5: Production cutover

- [ ] **Step 1: Final preflight**

```bash
pnpm validate-content
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
```

All five must succeed.

- [ ] **Step 2: Push**

```bash
git push origin main
```

- [ ] **Step 3: Verify Vercel production deploy**

```bash
sleep 60
curl -sI https://onboarding-pvj.vercel.app/it | head -1
curl -sI https://onboarding-pvj.vercel.app/en | head -1
```

Both must return `200`.

- [ ] **Step 4: Smoke check production manually** — open in browser, complete one full module, check summary.

- [ ] **Step 5: Tag final release**

```bash
git tag -a v1.0.0 -m "PVJets SDR Onboarding v1.0.0 — 11 modules IT+EN, full content, production deploy"
git push origin v1.0.0
```

- [ ] **Step 6: Optional — request custom domain**

If Giorgio wants `onboarding.pvjets.com`, configure CNAME in Vercel project settings. Otherwise, share `https://onboarding-pvj.vercel.app` with PVJets team.

---

## Self-review

This checklist was run after writing the plan above.

**Spec coverage:**
- Curriculum (11 modules) → covered by Phases 2–5 + Phase 7 (EN).
- IA & URL tree → Tasks 0.3, 0.4, 1.10, 6.1, 6.2.
- Module shape (lesson + quiz + flashcards) → Tasks 1.6 (lesson MDX components), 1.7 (quiz), 1.8 (flashcards).
- Stack (Next 15 + MDX + Tailwind v4 + next-intl + zod + vitest + playwright) → Phase 0.
- Content extraction pipeline → Task 2.0 (`extract-sources.ts`) + per-module tasks.
- Progress + localStorage schema (`pvj-onboarding-progress-v1` + per-module shape + 60% threshold + reset + `username`) → Tasks 1.3, 1.4, 1.5, 1.12, 6.3.
- Summary screen (locked/unlocked, name field, score table, flashcard review, print, reset) → Task 6.2.
- Visual (Navy + Cream + Gold, Fraunces + Inter, scales, layout containers) → Task 0.2.
- Repo + tests + deploy + error handling → Task 0.5 (config), Phase 8 (E2E + perf), `error.tsx` and `not-found.tsx` referenced via Next defaults — explicit `not-found.tsx` is created during Phase 0.

**Gap found and fixed:** the original plan did not explicitly create `src/app/not-found.tsx` (mentioned in spec section 10.3). Adding it as part of Task 0.4 follow-up — see addendum below.

**Placeholder scan:** no "TBD"/"TODO" left except the README favicon TODO acknowledged in Task 8.1, which is justified.

**Type consistency:**
- `useProgress(allSlugs)` signature consistent across Tasks 1.5, 1.7, 1.8, 1.9, 1.12, 6.3.
- `MODULE_ORDER` constant used as the canonical slug list everywhere (Tasks 1.2, 1.5+).
- `ModuleProgress` shape matches Tasks 1.3 → 1.4 → 1.5 → 1.9 → 6.2.
- `STORAGE_KEY = 'pvj-onboarding-progress-v1'` matches the spec.
- `QUIZ_PASS_THRESHOLD = 0.6` matches spec section 7.3.

**Addendum: missing `not-found.tsx`**

Add a sub-step to Task 0.4 Step 5 (between creating the page and committing):

```tsx
// src/app/not-found.tsx
export default function NotFound() {
  return (
    <html>
      <body className="bg-pvj-cream text-pvj-navy min-h-screen flex flex-col items-center justify-center text-center p-6">
        <h1 className="display text-4xl mb-4">404</h1>
        <p className="text-pvj-navy/60">Pagina non trovata · Page not found</p>
        <a href="/it" className="mt-6 underline decoration-pvj-gold-soft underline-offset-4">Dashboard</a>
      </body>
    </html>
  )
}
```

Plus a per-locale `error.tsx`:

```tsx
// src/app/[locale]/error.tsx
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <section className="text-center py-16">
      <h1 className="display mb-4">Qualcosa è andato storto</h1>
      <p className="text-pvj-navy/60 mb-6">{error.message}</p>
      <button onClick={reset} className="rounded-md bg-pvj-navy px-4 py-2 text-pvj-cream hover:bg-pvj-navy-700">Riprova</button>
    </section>
  )
}
```

These two files are added in Task 0.4 alongside the locale layout and committed with the same message.

---

## Execution Handoff

Plan complete and saved to [`docs/superpowers/plans/2026-05-10-pvj-sdr-onboarding-plan.md`](2026-05-10-pvj-sdr-onboarding-plan.md).

Two execution options:

1. **Subagent-Driven (recommended)** — fresh subagent per task, two-stage review, fast iteration. Best for this plan because content tasks (Phases 2–5, 7) are highly parallelisable per module.
2. **Inline Execution** — execute tasks in this session via `superpowers:executing-plans` with batch checkpoints. Slower but lets us pair-program.

Which approach?
