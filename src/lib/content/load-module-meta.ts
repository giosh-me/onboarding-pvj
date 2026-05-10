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
