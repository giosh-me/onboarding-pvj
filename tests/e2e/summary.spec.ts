import { test, expect } from '@playwright/test'

test('summary shows locked state when incomplete', async ({ page, context }) => {
  await context.clearCookies()
  await page.addInitScript(() => localStorage.clear())
  await page.goto('/it/summary')
  await expect(page.getByRole('heading', { name: /Sintesi bloccata/ })).toBeVisible()
})
