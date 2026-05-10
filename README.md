# PVJets SDR Onboarding

Mini-sito di onboarding interattivo per nuovi SDR di PVJets — bilingue IT/EN, statico, deploy su Vercel.

🌐 **Live**: <https://onboarding-pvj.vercel.app>

## Cosa contiene

- **11 moduli** con lezione + quiz a scelta multipla + flashcard
- **2 lingue**: italiano (default) ed inglese, switcher in alto a destra
- **Glossario** searchable con tutti i termini
- **Schermata di sintesi** finale con score per modulo, tempo totale, badge, ripasso flashcard
- **Progresso persistente** in `localStorage` (no auth, no DB)

## Curriculum (11 moduli)

**Parte 1 — Brand**
1. Welcome to PVJets — identità, motto, founders
2. Mission & Core Values — i 5 valori operativi + i 3 pilastri
3. Global Reach — presenza geografica + range per categoria

**Parte 2 — Servizi & Flotta**
4. On-Demand Charter & PVJets Club — i due modelli commerciali
5. Our Fleet — le 6 categorie aircraft con specs
6. Sustainability — carbon offset + Empty Legs + SAF

**Parte 3 — Mercato**
7. Private Aviation Market — attori, segmenti, vocabolario
8. Aircraft Types in Detail — VLJ + decision tree mission→categoria

**Parte 4 — Mestiere SDR**
9. Lead Qualification — flusso Salesforce + scoring + KYC + anti-frode
10. WhatsApp Communication — canone HNWI + template + Path A/B
11. Practical Scenarios — 4 scenari interattivi che riassumono tutto

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind v4
- next-intl (locale prefix `/it`, `/en`)
- MDX per le lezioni, JSON validato con zod per quiz/flashcard
- `useSyncExternalStore` su `localStorage` per il progresso
- Build statica deployata su Vercel

## Sviluppo locale

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm validate-content  # zod check su content/it e content/en
pnpm test         # vitest unit (23 test)
pnpm typecheck    # tsc --noEmit
pnpm build        # Next.js build
```

## Struttura

```
content/
  it/                       # contenuti italiani (default)
    modules/01-welcome.mdx ... 11-scenarios.mdx
    quizzes.json            # tutte le domande, raggruppate per modulo
    flashcards.json         # tutti i mazzi, raggruppati per modulo
  en/                       # mirror EN, stessi id e order
src/
  app/[locale]/             # routing bilingue (Next.js 15 App Router)
  components/               # lesson, quiz, flashcards, dashboard, summary, glossary, shared
  lib/
    progress/               # types, store, useProgress, stats
    content/                # zod schemas, loaders MDX/JSON
    quiz/                   # scoring logic
    i18n/                   # next-intl routing
scripts/
  extract-sources.ts        # PDF/DOCX/HTML → markdown grezzo
  validate-content.ts       # zod check al prebuild
docs/
  superpowers/specs/        # design approvato
  superpowers/plans/        # implementation plan
```

## Estrazione fonti

Lo script `scripts/extract-sources.ts` legge i materiali sorgente PVJets (`pvj_company_profile_3.pdf`, SOP DOCX, SDR Playbook HTML, training.pdf) e produce markdown grezzo in `extracted/raw/` (gitignored). Le lezioni MDX sono **sintesi** redatte da quel materiale per il taglio "SDR onboarding", non copy-paste.

## Materiali sorgente

I documenti PVJets di partenza non sono committati in questo repo pubblico — restano locali nello spazio di lavoro.

## Documenti di progetto

- Design: [`docs/superpowers/specs/2026-05-10-pvj-sdr-onboarding-design.md`](docs/superpowers/specs/2026-05-10-pvj-sdr-onboarding-design.md)
- Plan: [`docs/superpowers/plans/2026-05-10-pvj-sdr-onboarding-plan.md`](docs/superpowers/plans/2026-05-10-pvj-sdr-onboarding-plan.md)

## Tag delle release

- `phase-0-scaffolding` — Next.js + Tailwind + i18n + first deploy
- `phase-1-engine` — core engine completo, primo modulo end-to-end
- `phase-2-modules-1-3-it` ... `phase-5-modules-9-11-it` — contenuti IT
- `phase-6-glossary-summary` — glossario, summary, active-time tracker
- `phase-7-en-translation` — traduzione EN completa
