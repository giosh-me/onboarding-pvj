# Contributing

Guida pratica per modificare contenuti, aggiungere moduli o sviluppare il sito.

## Workflow generale

1. Branch da `main`
2. Modifica, valida (`pnpm validate-content`), testa (`pnpm test && pnpm test:e2e`), tipa (`pnpm typecheck`), builda (`pnpm build`)
3. Commit con conventional commit (`feat(area):`, `fix:`, `content(slug):`, `docs:`, `test:`, `chore:`)
4. PR su `main` → Vercel preview automatico
5. Merge → deploy production

## Modificare il contenuto di un modulo

Ogni modulo ha **3 file** che vivono insieme, uno per lingua:

```
content/it/modules/<order>-<slug>.mdx
content/it/quizzes.json     # entry "<slug>"
content/it/flashcards.json  # entry "<slug>"

content/en/modules/<order>-<slug>.mdx   # mirror, same slug/order
content/en/quizzes.json                  # mirror, same ids
content/en/flashcards.json               # mirror, same ids
```

**Regola d'oro IT/EN**: id, `correct_index`, `tags`, `order`, `slug` devono **combaciare esattamente** tra le due lingue. Cambia solo `question`/`options`/`explanation`/`front`/`back`/`title` (e la prosa MDX).

### Frontmatter MDX

```yaml
---
slug: welcome                # deve essere in src/lib/content/module-order.ts
order: 1                     # posizione 1-11
title: "Benvenuto in PVJets" # mostrato in dashboard
estimated_minutes: 8         # tempo stimato
sources: ["..."]             # documenti sorgente (string array)
---
```

### Componenti MDX disponibili

- `<Callout type="info|warning|note">…</Callout>` — riquadro evidenziato
- `<KeyFact>…</KeyFact>` — frase chiave a grande risalto
- `<Comparison items={[{name, when?, pros?, cons?}, …]} />` — confronto a colonne
- `<ImageFigure src="/images/x.png" alt="…" caption="…" width={1200} height={700} />`
- `<Aside>…</Aside>` — note marginali
- `<FleetSpecCard model="…" pax="…" range="…" examples={[…]} />`

Vedi `src/components/lesson/` per il codice sorgente.

### Schema quiz

```jsonc
{
  "slug-modulo": [
    {
      "id": "q-xx-NNN",        // univoco
      "type": "mcq",
      "question": "...",
      "options": ["...", "...", "...", "..."],  // 2-6 opzioni
      "correct_index": 0,                        // < options.length
      "explanation": "...",
      "source": "..."                            // opzionale
    }
  ]
}
```

### Schema flashcard

```jsonc
{
  "slug-modulo": [
    {
      "id": "f-xx-NNN",
      "front": "...",
      "back": "...",
      "tags": ["tag1", "tag2"]   // opzionale, default []
    }
  ]
}
```

### Cose da evitare nei MDX

- **Carattere `<` seguito da cifra/lettera** senza spazio o backtick: MDX lo interpreta come JSX e fa fallire la build. Es. `<5` → scrivi `Sotto 5` o `` `<5` ``.
- **`{` graffe** che non aprono espressioni JSX: escape come `\{` o usa testo.
- Lezioni più lunghe di ~2000 parole: spezzale in due paragrafi successivi, MDX gestisce blocchi ma diventa pesante da editare.

## Aggiungere un nuovo modulo

Più invasivo. Richiede coordinamento tra codice e contenuti:

1. Aggiungi lo slug a `src/lib/content/module-order.ts` (in posizione corretta — l'ordine è canonico)
2. Crea `content/it/modules/<pad>-<slug>.mdx` e mirror in `content/en/`
3. Aggiungi le entry `<slug>` in `content/it/quizzes.json`, `flashcards.json` + mirror EN
4. `pnpm validate-content` → la build fallirà se i file mancano o gli id/order non combaciano

Il modulo apparirà automaticamente nella dashboard, nel glossario e nello score di summary. Nessuna route da registrare manualmente.

## Estrazione fonti

Per rigenerare il markdown grezzo dai materiali sorgente:

```bash
pnpm extract-sources
```

I file vanno in `extracted/raw/` (gitignored). I path sorgente sono codificati in `scripts/extract-sources.ts` — modificali se i documenti cambiano posizione.

## Test

```bash
pnpm test          # unit (vitest) — 23 test
pnpm test:e2e      # smoke E2E (Playwright) — 5 test
pnpm typecheck     # TypeScript
pnpm validate-content   # zod sui contenuti
```

Tutti devono passare prima di un PR.

## Stile codice

- TypeScript strict, no `any` in codice di app (solo in script di build se proprio serve)
- React 19 patterns: server components by default, `'use client'` solo dove serve interazione
- Tailwind v4 con design tokens in `globals.css` (`--color-pvj-*`, `--text-*`)
- next-intl per ogni stringa user-facing — niente testo hardcoded nei componenti `'use client'`

## Domanda?

Apri una issue su https://github.com/giosh-me/onboarding-pvj.
