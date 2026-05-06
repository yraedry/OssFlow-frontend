import { test } from '@playwright/test'
const BASE = 'http://localhost:5173'

test('timing del error de red en webkit', async ({ page }) => {
  await page.goto(`${BASE}/catalog/positions`)
  await page.waitForLoadState('networkidle')
  const start = Date.now()
  for (let i = 0; i < 30; i++) {
    await page.waitForTimeout(1000)
    const bodyText = await page.locator('body').textContent() ?? ''
    const chars = bodyText.replace(/\s/g, '').length
    console.log(`${Date.now() - start}ms: chars=${chars}`)
    if (chars > 10) break
  }
  await page.screenshot({ path: 'e2e/screenshots/safari/timing-final.png', fullPage: true })
})
