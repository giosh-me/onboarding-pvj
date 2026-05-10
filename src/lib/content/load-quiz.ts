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
