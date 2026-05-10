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
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  const errors: string[] = []
  for (const locale of LOCALES) {
    const localeDir = path.join(ROOT, locale)
    if (!(await fileExists(localeDir))) {
      errors.push(`[${locale}] missing directory ${localeDir}`)
      continue
    }
    const quizPath = path.join(localeDir, 'quizzes.json')
    if (await fileExists(quizPath)) {
      const data = await readJson(quizPath)
      const r = quizFileSchema.safeParse(data)
      if (!r.success) errors.push(`[${locale}] quizzes.json: ${r.error.message}`)
    } else errors.push(`[${locale}] quizzes.json missing`)
    const fcPath = path.join(localeDir, 'flashcards.json')
    if (await fileExists(fcPath)) {
      const data = await readJson(fcPath)
      const r = flashcardFileSchema.safeParse(data)
      if (!r.success) errors.push(`[${locale}] flashcards.json: ${r.error.message}`)
    } else errors.push(`[${locale}] flashcards.json missing`)
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
      else if (r.data.slug !== slug)
        errors.push(`[${locale}] ${order}-${slug}.mdx slug mismatch (frontmatter says "${r.data.slug}")`)
      else if (r.data.order !== i + 1)
        errors.push(
          `[${locale}] ${order}-${slug}.mdx order mismatch (frontmatter says ${r.data.order}, expected ${i + 1})`,
        )
    }
  }
  if (errors.length > 0) {
    console.error('Content validation FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'))
    process.exit(1)
  }
  console.log('Content validation OK.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
