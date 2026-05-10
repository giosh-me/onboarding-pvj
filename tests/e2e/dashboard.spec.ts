import { test, expect } from '@playwright/test'

test('dashboard shows 11 modules and 0% on first visit', async ({ page, context }) => {
  await context.clearCookies()
  await page.addInitScript(() => localStorage.clear())
  await page.goto('/')
  await expect(page).toHaveURL(/\/it/)
  await expect(page.getByRole('heading', { name: /Onboarding SDR/, level: 1 })).toBeVisible()
  const cards = page.locator('a[href*="/m/"]')
  await expect(cards).toHaveCount(11)
})
