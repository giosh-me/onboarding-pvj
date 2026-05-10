import { test, expect } from '@playwright/test'

test('reset clears localStorage and progress UI', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'pvj-onboarding-progress-v1',
      JSON.stringify({
        version: 1,
        startedAt: '2026-01-01T00:00:00Z',
        lastActivityAt: '2026-01-01T00:00:00Z',
        totalTimeMs: 0,
        locale: 'it',
        modules: {
          welcome: {
            lessonReadAt: '2026-01-01T00:00:00Z',
            quiz: { attempts: [], bestScore: 1 },
            flashcards: { known: ['x'], unknown: [], completedAt: '2026-01-01T00:00:00Z' },
          },
        },
      }),
    )
  })

  await page.goto('/it')
  const card = page.locator('a[href$="/m/welcome"]')
  await expect(card.getByText(/Completato/)).toBeVisible()

  await page.getByRole('button', { name: /Ricomincia da capo/ }).click()
  await page.getByRole('button', { name: /Sì, ricomincia/ }).click()

  await expect(card.getByText(/Completato/)).toHaveCount(0)
})
