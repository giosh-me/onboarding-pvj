import { test, expect } from '@playwright/test'

test('completing module 1 quiz persists best score', async ({ page, context }) => {
  await context.clearCookies()
  await page.addInitScript(() => localStorage.clear())

  await page.goto('/it/m/welcome')
  await expect(page.getByRole('heading', { name: 'Benvenuto in PVJets' }).first()).toBeVisible()

  await page.getByRole('link', { name: /Vai al quiz/ }).click()
  await expect(page).toHaveURL(/\/m\/welcome\/quiz$/)

  // 8 questions, all correct_index = 0 → click first option each time and advance.
  for (let i = 1; i <= 8; i++) {
    await expect(page.getByText(`Domanda ${i} / 8`)).toBeVisible()
    await page.locator('ul button').first().click()
    await page.getByRole('button', { name: i < 8 ? /Successiva/ : /Vedi risultato/ }).click()
  }

  // Result bar shows 8/8
  await expect(page.getByText('8/8')).toBeVisible()

  // Persistence — localStorage now holds the welcome module with bestScore = 1
  const stored = await page.evaluate(() => localStorage.getItem('pvj-onboarding-progress-v1'))
  expect(stored).not.toBeNull()
  const parsed = JSON.parse(stored as string)
  expect(parsed.modules.welcome.quiz.bestScore).toBe(1)
})
