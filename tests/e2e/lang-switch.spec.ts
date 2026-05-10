import { test, expect } from '@playwright/test'

test('switching language preserves position', async ({ page }) => {
  await page.goto('/it/m/welcome')
  await expect(page.getByRole('heading', { name: 'Benvenuto in PVJets' }).first()).toBeVisible()

  await page.getByRole('button', { name: /^en$/i }).click()
  await expect(page).toHaveURL(/\/en\/m\/welcome$/)
  await expect(page.getByRole('heading', { name: 'Welcome to PVJets' }).first()).toBeVisible()
})
