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
