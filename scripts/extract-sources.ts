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
  const { stdout } = await execp(`pdftotext -layout "${src}" -`, { maxBuffer: 50 * 1024 * 1024 })
  return stdout
}

async function extractDocx(src: string): Promise<string> {
  const m = mammoth as unknown as {
    convertToMarkdown: (input: { path: string }) => Promise<{ value: string }>
  }
  const { value } = await m.convertToMarkdown({ path: src })
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
      const text =
        s.kind === 'pdf'
          ? await extractPdf(s.src)
          : s.kind === 'docx'
            ? await extractDocx(s.src)
            : await extractHtml(s.src)
      const outPath = path.join(OUT, `${s.key}.md`)
      await fs.writeFile(outPath, text, 'utf8')
      console.log(`  → ${outPath} (${text.length} chars)`)
    } catch (e) {
      console.warn(`  ! failed ${s.key}: ${(e as Error).message}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
