# PVJets SDR Onboarding — Design

**Data**: 2026-05-10
**Autore**: Giorgio + Claude (brainstorm)
**Stato**: Design approvato in sessione, in attesa di review scritta
**Scope**: mini-sito di onboarding per nuovi SDR PVJets — lezioni brevi + mini-quiz + flashcard, bilingue IT/EN, completamente statico, deploy su Vercel.

---

## 1. Contesto e decisioni ancoranti

### 1.1 Obiettivo

Costruire un sito di apprendimento **molto semplice, chiaro, intuitivo e interattivo** per il nuovo SDR PVJets. L'SDR al primo giorno apre un link, segue un percorso completo (~1 giornata) basato su:

1. il **Company Profile** PVJets (`pvj_company_profile_3.pdf`)
2. la **SOP commerciale** (qualificazione lead, comunicazione WhatsApp, SDR Playbook)
3. **knowledge generale** sul mercato del private aviation

Al termine vede una sintesi del proprio progresso e degli score per modulo.

### 1.2 Decisioni ancoranti (raccolte nel brainstorming)

| Decisione | Scelta | Motivazione |
|---|---|---|
| Target utente | Nuovo SDR in onboarding | Definito esplicitamente |
| Formato apprendimento | Lezioni brevi + mini-quiz + flashcard concetti chiave | Mix B+C scelto |
| Auth & persistenza | Nessun login, nessun DB, progresso solo in `localStorage` | Massima semplicità + Vercel-only |
| Scope contenuti | Completo: 11 moduli, ~1 giornata di fruizione | Onboarding serio |
| Origine contenuti | Estrazione automatica dai materiali PVJets esistenti | Velocità + aderenza |
| Lingua | Bilingue IT/EN con switcher | Coerente con team internazionale |
| Direzione visiva | PVJets quiet luxury — Navy + Cream + Gold, tipografia editoriale | Coerenza brand & settore |
| Output finale | Schermata di sintesi con score per modulo, tempo, badge | Motivazione senza overhead |
| Stack | Next.js 15 statico, MDX + JSON in repo, niente backend | "Molto semplice" |
| Deploy | Vercel, branch `main` → production | Standard utente |

### 1.3 Out of scope (esplicitamente)

- Login, autenticazione, gestione utenti, ruoli — **no**.
- Database (Drizzle / Postgres / Turso) — **no**.
- Certificato PDF firmato, integrazione HR — **no** (`window.print()` se l'SDR vuole salvarsi una sintesi).
- Sistema di achievement complesso, classifiche tra SDR, gamification spinta — **no**.
- Riuso del progetto `QUIZ/` esistente — **no**, parto da repo nuovo.
- Riuso/migrazione di `pvj-academy-next` o `pvj-playbook-next` — **no**, sono progetti separati che restano dove sono.
- CMS headless o authoring web — **no**, contenuti in repo.
- Analytics dettagliata di apprendimento (LMS-style) — **no**, al massimo Vercel Analytics builtin.
- Modalità scura — **no**, design solo light "quiet luxury".
- Indicizzazione SEO — **no**, sito interno (`robots: noindex`).

### 1.4 Approccio architetturale scelto

**Approccio 1: Next.js multi-pagina + MDX/JSON in repo.**

Scartati:
- **Approccio 2 (single data file + componenti generici)**: a 11 moduli bilingui il file unico diventa ingestibile, niente URL granulari per linkare singole lezioni.
- **Approccio 3 (riuso `QUIZ/` esistente)**: alleggerire una codebase con Drizzle/auth/admin/i18n complesso costa più che partire da zero ed è incoerente con "molto semplice".

---

## 2. Curriculum

11 moduli + 1 schermata di sintesi. Ogni modulo: **1 lezione MDX (800-1500 parole) + 1 quiz (5-8 domande MCQ) + 1 mazzo flashcard (8-15 carte)**.

| # | Modulo | Fonte primaria | Fonte secondaria |
|---|---|---|---|
| 1 | Welcome to PVJets | `pvj_company_profile_3.pdf` p.1 (Welcome) | — |
| 2 | Mission & Core Values | Company Profile "Mission & Core Values" | — |
| 3 | Global Reach & Strategic Presence | Company Profile "Global Reach" | — |
| 4 | On-Demand Charter & Membership | Company Profile "On-Demand Charter" | — |
| 5 | La nostra flotta | Company Profile "Our Fleet" | knowledge generale |
| 6 | Sostenibilità & strategia futura | Company Profile "Sustainability" | — |
| 7 | Il mercato del private aviation | knowledge generale | `training.pdf` (riferimenti) |
| 8 | Tipologie di aircraft in dettaglio | knowledge generale | Company Profile "Fleet" |
| 9 | Come qualifichiamo un lead | `PVJets_SOP_Qualificazione_Lead.docx` | `PVJets_SDR_Playbook_Online_v1.html` |
| 10 | Comunicazione cliente: WhatsApp & first touch | `PVJets_SOP_SDR_WhatsApp_Communication_v1.docx` | playbook HTML |
| 11 | Casi pratici: scenari di qualifica | playbook HTML + SOP qualificazione | `training.pdf` |
| — | **Sintesi finale** | — | — |

**Modulo 11 — variante**: ha la stessa tripletta degli altri (lezione + "quiz" + flashcard), ma il "quiz" non è un set di MCQ classico bensì una sequenza di **4 mini-scenari interattivi** ("Ti scrive su WhatsApp un cliente: cosa fai?") con 4 opzioni di azione e spiegazione. Riusa identico lo schema JSON dei quiz (`type: "mcq"`), cambia solo il taglio narrativo del contenuto. La lezione di apertura del modulo 11 è breve (300-500 parole, introduce il framework decisionale che gli scenari mettono in pratica). Le flashcard del modulo 11 raccolgono i criteri-chiave usati negli scenari.

**Glossario aggregato** (`/glossary`): aggrega tutte le flashcard di tutti i moduli in una vista searchable, utile come reference rapido anche dopo l'onboarding.

---

## 3. Information Architecture & URL tree

```
/                            → redirect a /it (default IT) o lingua browser
/it                          → DASHBOARD: indice 11 moduli, % completamento, CTA "Riprendi"
/it/m/[slug]                 → Lezione modulo (MDX render)
/it/m/[slug]/quiz            → Quiz del modulo (5-8 MCQ)
/it/m/[slug]/flashcards      → Mazzo flashcard del modulo
/it/glossary                 → Glossario aggregato (tutte le flashcard, searchable)
/it/summary                  → Schermata finale (placeholder se < 100%)

/en/* → mirror identico
```

### 3.1 Pattern di navigazione

Dentro un modulo: **Lezione → Quiz → Flashcard → CTA "Modulo successivo"**.
Dalla dashboard: ogni card di modulo è un link diretto alla lezione.
**Non lock-step**: l'SDR può saltare a qualsiasi modulo. La dashboard mostra l'ordine consigliato con contatore visivo, non blocca.

### 3.2 Selettore lingua

In alto a destra, due abbreviazioni "IT | EN". Cambio lingua = stesso URL ma con prefisso diverso (`/it/m/fleet/quiz` ↔ `/en/m/fleet/quiz`). Gestito da `next-intl` con `localePrefix: 'always'`.

### 3.3 Layout globale

`app/[locale]/layout.tsx` ospita:
- **Header**: logo PVJets (link a dashboard) + selettore lingua
- **Main**: contenuto della route
- **Footer minimo**: copyright, link a glossario, link a sintesi

---

## 4. Forma di un modulo

### 4.1 Lezione — file MDX

`content/it/modules/04-charter-membership.mdx`:

```mdx
---
slug: charter-membership
order: 4
title: "Charter on-demand & Membership"
estimated_minutes: 8
sources: ["pvj_company_profile_3.pdf p.8-10"]
---

import { Callout, KeyFact, Comparison } from '@/components/lesson'

PVJets offre due modelli commerciali principali...

<KeyFact>L'80% dei clienti PVJets sono executives e HNW...</KeyFact>

<Comparison
  items={[
    { name: 'On-demand', when: '...', pros: [...], cons: [...] },
    { name: 'Membership', when: '...', pros: [...], cons: [...] }
  ]}
/>
```

**Componenti MDX riusabili** (`src/components/lesson/`):
- `<Callout type="info|warning|note">` — riquadro evidenziato
- `<KeyFact>` — fatto chiave a grande risalto
- `<Comparison items=[]>` — confronto a colonne
- `<ImageFigure src caption>` — immagine con didascalia
- `<Aside>` — riquadro laterale per note marginali
- `<FleetSpecCard model pax range>` — solo per modulo 5/8 (specs aircraft)

### 4.2 Quiz — schema JSON

`content/it/quizzes.json`:

```jsonc
{
  "charter-membership": [
    {
      "id": "q-cm-001",
      "type": "mcq",
      "question": "Qual è la differenza principale tra On-Demand e Membership?",
      "options": ["...", "...", "...", "..."],
      "correct_index": 1,
      "explanation": "Riferimento Company Profile sez. 2.1 — ...",
      "source": "company_profile.pdf p.8"
    }
  ]
}
```

**UX quiz**: una domanda alla volta, click su un'opzione → highlight verde/rosso + spiegazione → bottone "Successiva". Alla fine: score modulo (es. "6/8") + opzione "Riprova quelle sbagliate" che pesca solo le errate dal tentativo.

Per il modulo 11 stesso schema, contenuto narrativo: domanda = scenario, opzioni = azioni possibili.

### 4.3 Flashcard — schema JSON

`content/it/flashcards.json`:

```jsonc
{
  "charter-membership": [
    {
      "id": "f-cm-001",
      "front": "On-Demand Charter",
      "back": "Modello pay-per-flight: il cliente paga solo per il singolo volo, senza impegno annuale. Ideale per chi vola occasionalmente.",
      "tags": ["servizi", "modelli-commerciali"]
    }
  ]
}
```

**UX flashcard**: card centrata, fronte visibile, click = flip (CSS `transform: rotateY()`) → retro. Dopo flip: due bottoni **"Sapevo / Non sapevo"**. Le "Non sapevo" tornano in coda al mazzo. Mazzo vuoto = modulo flashcard completato.
**Algoritmo**: Leitner semplificato a 2 box (sapevo / non sapevo). No SM-2.

---

## 5. Stack tecnico

```
Framework:   Next.js 15 (App Router) + React 19 + TypeScript
Styling:     Tailwind v4 + componenti custom (no shadcn pesante)
i18n:        next-intl (locale prefix /it /en, sempre presente)
Contenuti:   @next/mdx + next-mdx-remote/rsc per MDX
             JSON statici per quiz/flashcard
State:       React state per UI; useProgress() custom hook con useSyncExternalStore su localStorage
Validazione: zod per schema quiz/flashcard al build (script prebuild)
Test:        vitest (unit), @playwright/test (smoke E2E)
Build:       Statico (output: 'export') quando possibile, fallback ISR se serve
Deploy:      Vercel (auto da branch main, preview su PR)
Package mgr: pnpm
```

### 5.1 Dipendenze chiave (volutamente poche)

- `next`, `react`, `react-dom`, `typescript`
- `next-intl`
- `@next/mdx`, `@mdx-js/react`, `gray-matter`
- `zod`
- `tailwindcss` v4
- `clsx`, `lucide-react`
- Dev: `vitest`, `@playwright/test`, `eslint`, `prettier`

### 5.2 Niente di tutto questo

- DB (Drizzle / Postgres / Turso)
- Auth (NextAuth / Clerk / magic link)
- shadcn full / Radix completo (solo i pezzi che servono: `Dialog`, `Tabs` se servono)
- `@react-pdf/renderer`
- Analytics esterni (al massimo Vercel Analytics)

### 5.3 Performance budget

- JS bundle iniziale gzipped: **< 100 KB**
- LCP target: **< 1.8s** (sito statico, dovrebbe essere agevole)
- Font: `Fraunces` (display, serif Google Fonts) + `Inter` o `Geist Sans` (body), entrambi via `next/font/google` con subset

---

## 6. Pipeline di estrazione contenuti

### 6.1 Workflow

1. **Estrazione testo grezzo** (script `scripts/extract-sources.ts`):
   - PDF → `pdftotext` o `pdf-parse` → markdown
   - DOCX → `mammoth` o `pandoc` → markdown
   - HTML → `cheerio` → markdown
   - Output in `extracted/raw/*.md` (gitignored)
2. **Sintesi lezioni MDX** — manuale (Claude scrive sintetizzando dalla fonte, taglio "SDR onboarding"). Non copia-incolla.
3. **Generazione quiz + flashcard JSON** — manuale a partire dalla lezione finalizzata.
4. **Estrazione immagini chiave** dal company profile (logo, jet, mappa rotte) → `public/images/`
5. **Traduzione EN** — modulo per modulo, mantenendo identica struttura/order/id.
6. **Validation `zod` al build** — se un quiz ha `correct_index` fuori range o un id duplicato, build fallisce con messaggio chiaro.

### 6.2 Review loop

Procedo per **batch di 3-4 moduli alla volta** in PR separate, così Giorgio rivede e corregge inline mentre io continuo con i moduli successivi. Niente "tutto in una passata e poi 11 moduli da rilavorare".

### 6.3 Script di supporto

```
scripts/
  extract-sources.ts       → estrae testo grezzo dai 4 documenti
  validate-content.ts      → zod su tutti i JSON quiz/flashcard, chiamato da prebuild
  generate-glossary.ts     → aggrega flashcards di tutti i moduli per la pagina /glossary
```

---

## 7. Progresso e localStorage

### 7.1 Schema (versione 1)

Una sola chiave: `pvj-onboarding-progress-v1`. Schema TypeScript:

```ts
type Progress = {
  version: 1
  startedAt: string | null         // ISO8601, primo accesso
  lastActivityAt: string | null    // ISO8601, ultima azione
  totalTimeMs: number              // accumulo cross-sessione (timer attivo solo con tab visibile)
  locale: 'it' | 'en' | null
  modules: {
    [slug: string]: {
      lessonReadAt: string | null
      quiz: {
        attempts: { at: string; correct: number; total: number }[]
        bestScore: number | null   // % migliore
      }
      flashcards: {
        known: string[]            // ID carte marcate "Sapevo"
        unknown: string[]          // ID carte marcate "Non sapevo"
        completedAt: string | null
      }
    }
  }
}
```

Chiave secondaria: `pvj-onboarding-username` (string, opzionale, decorativo per la sintesi).

### 7.2 Hook `useProgress()`

`src/lib/progress/use-progress.ts`:

```ts
const {
  progress,                   // stato attuale
  markLessonRead(slug),
  recordQuizAttempt(slug, correct, total),
  markFlashcardKnown(slug, cardId),
  markFlashcardUnknown(slug, cardId),
  resetFlashcardDeck(slug),
  resetAll(),                 // reset totale (chiamante apre dialog di conferma)
  stats,                      // derived: { modulesCompleted, percentComplete, avgScore }
} = useProgress()
```

Implementato con `useSyncExternalStore` su `localStorage` per essere SSR-safe. Sincronizza tra tab grazie all'evento `storage`.

### 7.3 Definizione "modulo completato"

Un modulo è completato quando **tutti** i seguenti sono veri:
- `lessonReadAt` ≠ null (lezione vista)
- `quiz.bestScore >= 60%` (soglia in `lib/config.ts`)
- `flashcards.completedAt` ≠ null (mazzo svuotato)

### 7.4 Migrazione e reset

- **Migrazione**: chiave include `-v1`. Future versioni → `-v2` con funzione di migrazione. Se v1 corrotto/incompatibile → fallback a stato vuoto.
- **Reset**: bottone "Ricomincia da capo" nella dashboard, apre `<dialog>` di conferma → `resetAll()`.

---

## 8. Schermata di sintesi finale

URL: `/it/summary` (mirror `/en/summary`).

### 8.1 Accessibilità

Sempre raggiungibile. Se `< 100%` completato → placeholder con "Hai completato 7/11 moduli — finisci il percorso per sbloccare la sintesi" + lista moduli mancanti. A 100% si sblocca la vista piena.

### 8.2 Layout (a 100%)

Single column 720px max:

- **Header**: titolo "PVJets — Onboarding completato" + (opzionale) nome SDR + tempo totale
- **Score complessivo**: % e (corrette/totali) aggregati
- **Tabella moduli**: nome, score, tentativi
- **Flashcard da ripassare**: lista delle "non sapevo" residue, ognuna con bottone "Apri carta" che riapre il mazzo del modulo
- **Azioni**: `[Stampa sintesi]` (= `window.print()`) e `[Ricomincia]`

### 8.3 Nome SDR

Campo testo locale salvato in `localStorage.pvj-onboarding-username`. Solo decorativo, mai inviato a un server. Default vuoto → "Onboarding completato".

### 8.4 Stampa

`window.print()` con CSS `@media print` dedicato che pulisce header/footer e produce A4 leggibile. Niente jsPDF. L'SDR può salvare come PDF dal dialog del browser se vuole inviarlo all'HR.

### 8.5 Badge

Per ogni modulo completato, badge rotondo (icona Lucide) accanto al nome del modulo nella dashboard e nella tabella di sintesi. Niente sistema di achievement complesso.

---

## 9. Direzione visiva

### 9.1 Palette

```css
:root {
  /* Primary — navy profondo, autorevole */
  --pvj-navy:      oklch(20% 0.04 260);   /* #0F1530 ca. */
  --pvj-navy-700:  oklch(28% 0.04 260);
  --pvj-navy-50:   oklch(96% 0.005 260);

  /* Cream — sfondo principale */
  --pvj-cream:     oklch(97% 0.012 80);
  --pvj-cream-200: oklch(92% 0.018 80);

  /* Gold — accento parsimonioso */
  --pvj-gold:      oklch(72% 0.13 80);
  --pvj-gold-soft: oklch(85% 0.07 80);

  /* Semantici */
  --color-success: oklch(58% 0.13 145);
  --color-error:   oklch(55% 0.16 25);
  --color-text:    var(--pvj-navy);
  --color-text-muted: oklch(45% 0.02 260);
  --color-bg:      var(--pvj-cream);
  --color-surface: #ffffff;
}
```

L'oro è usato **molto poco**: bordo sottile dei badge "completato", numero del modulo nell'indice, sottolineatura della voce attiva. Non è colore di pulsante.

### 9.2 Tipografia

- **Display / titoli**: `Fraunces` (serif moderno, Google Fonts, premium feel) — H1, H2 lezioni, titolo dashboard
- **Body / UI**: `Inter` o `Geist Sans` (cleanness e leggibilità)
- **Mono**: `Geist Mono` (poco usato, glossario tecnici e specs aircraft)

Scale fluide:
```css
--text-display: clamp(2.5rem, 1.5rem + 3vw, 4rem);
--text-h1:      clamp(1.8rem, 1.3rem + 1.6vw, 2.6rem);
--text-h2:      clamp(1.4rem, 1.1rem + 1vw, 1.9rem);
--text-body:    1.0625rem;
--text-small:   0.875rem;
```

### 9.3 Layout & rhythm

- Container max body lezione: **680px** (linea ~70 caratteri)
- Container dashboard: **960px**
- Spacing unit: 4px base, scale 4/8/12/16/24/32/48/64/96
- Cards moduli: bordo 1px `--pvj-cream-200`, no shadow, hover = leggera elevation + bordo gold
- Quiz: opzioni come righe ampie, padding generoso, hover background `--pvj-navy-50`. Click = bordo verde/rosso 2px + icona check/cross
- Flashcard: card 480×280px su desktop, 90vw su mobile, flip CSS 3D

### 9.4 Atmosfera

- Sfondi: `--pvj-cream`, `--surface` (bianco) solo sulle card
- Niente gradients
- Una sola immagine atmosferica sulla landing (jet che decolla all'alba), b&w o duotone navy/cream, dal company profile
- Microanimazioni: solo fade/translate sottili (200-300ms, `cubic-bezier(0.16, 1, 0.3, 1)`)
- Modalità chiara only

---

## 10. Repo, testing, deploy, error handling

### 10.1 Repo structure

```
pvj-sdr-onboarding/
├── content/
│   ├── it/
│   │   ├── modules/01-welcome.mdx ... 11-scenarios.mdx
│   │   ├── quizzes.json
│   │   └── flashcards.json
│   └── en/  (mirror)
├── extracted/raw/             ← gitignored, output di scripts/extract-sources.ts
├── public/
│   └── images/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              (dashboard)
│   │   │   ├── m/[slug]/page.tsx
│   │   │   ├── m/[slug]/quiz/page.tsx
│   │   │   ├── m/[slug]/flashcards/page.tsx
│   │   │   ├── glossary/page.tsx
│   │   │   └── summary/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── lesson/               (Callout, KeyFact, Comparison, ImageFigure, Aside, FleetSpecCard)
│   │   ├── quiz/                 (QuizPlayer, QuestionCard, ResultBar)
│   │   ├── flashcards/           (FlashcardDeck, FlipCard)
│   │   ├── dashboard/            (ModuleCard, ProgressRing)
│   │   └── shared/               (Header, LangSwitcher, ResetDialog, Footer)
│   ├── lib/
│   │   ├── progress/             (use-progress.ts, store.ts, types.ts)
│   │   ├── content/              (loaders MDX/JSON, zod schemas)
│   │   ├── i18n/                 (next-intl config)
│   │   └── config.ts             (soglia quiz, costanti)
│   ├── messages/it.json, en.json
│   └── middleware.ts
├── scripts/
│   ├── extract-sources.ts
│   ├── validate-content.ts
│   └── generate-glossary.ts
├── tests/
│   ├── unit/                     (vitest)
│   └── e2e/                      (playwright)
├── next.config.ts
├── tailwind.config.ts (se serve oltre v4 inline)
├── tsconfig.json
└── package.json
```

### 10.2 Testing

**Vitest** (unit):
- `useProgress`: lettura/scrittura, isolamento tra moduli, stats derived, migrazione, reset
- Schema validation: zod su `quizzes.json`, `flashcards.json` IT+EN al build (`prebuild` hook)
- Scoring quiz (puro)

**Playwright** (smoke E2E, ~5 test):
1. Apri dashboard IT → vedo 11 moduli, 0% progresso
2. Completo lezione + quiz + flashcard del modulo 1 → dashboard mostra modulo 1 ✓
3. Cambio lingua a EN → URL `/en/...`, contenuti in inglese
4. Reset → tutto torna a 0%
5. `/it/summary` con < 100% → placeholder visibile

Niente target rigido di coverage 80% — è un sito quasi-statico, copertura solo sulla logica di stato.

### 10.3 Error handling

- **Contenuti rotti** (JSON invalido, MDX con frontmatter malformato): build fallisce con messaggio chiaro (script `validate-content.ts` chiamato da `prebuild`).
- **localStorage non disponibile** (privacy estrema, quota piena): fallback a stato in-memory + banner "Il progresso non verrà salvato in questa sessione".
- **Modulo/slug inesistente nell'URL**: pagina 404 custom in tono brand.
- **Errori di rendering React**: `error.tsx` per route, fallback grazioso con bottone "Torna alla dashboard".

### 10.4 Deploy

- **Repo**: nuovo, `pvj-sdr-onboarding`. Init in `/Users/giorgiopluchino/Desktop/Claud/Clienti/RG-PVJ/PVJ/Onboarding/pvj-sdr-onboarding/` (o cartella indicata da Giorgio).
- **Vercel**: import del repo, preview su PR, production su `main` (coerente con regola Vercel/main globale).
- **Variabili d'ambiente**: nessuna richiesta dal sito.
- **Robots**: `noindex` (materiale interno).
- **Domain**: da decidere — `onboarding.pvjets.com` su CNAME Vercel, oppure default `*.vercel.app` per lo start.

---

## 11. Next steps

1. Giorgio rivede questo design (questo file) ed eventualmente richiede modifiche.
2. Si invoca la skill `writing-plans` per produrre un implementation plan dettagliato (`2026-05-10-pvj-sdr-onboarding-plan.md`) che spezzi questo design in task eseguibili in ordine di dipendenza.
3. Si esegue il piano in batch:
   - Batch 0: scaffolding repo + Tailwind + i18n + layout vuoto + deploy Vercel funzionante (pagina "in costruzione")
   - Batch 1: estrazione fonti + componenti lezione/quiz/flashcard + `useProgress` + dashboard
   - Batch 2: moduli 1-3 (Welcome, Mission, Global Reach) IT
   - Batch 3: moduli 4-6 (Charter, Fleet, Sustainability) IT
   - Batch 4: moduli 7-8 (Mercato, Aircraft) IT
   - Batch 5: moduli 9-11 (Lead qualif, WhatsApp, Scenari) IT
   - Batch 6: schermata sintesi + glossario
   - Batch 7: traduzione EN di tutti i moduli
   - Batch 8: polish, smoke E2E, deploy production

Ogni batch si chiude con review di Giorgio e merge.
