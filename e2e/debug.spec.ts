import { test } from '@playwright/test'
const BASE = 'http://localhost:5173'

test('debug spinner source', async ({ page }) => {
  const networkReqs: string[] = []
  page.on('request', req => networkReqs.push(req.url()))
  page.on('response', res => console.log('RESPONSE:', res.url(), res.status()))
  page.on('requestfailed', req => console.log('FAILED:', req.url(), req.failure()?.errorText))

  await page.goto(`${BASE}/catalog/positions`)
  await page.waitForLoadState('networkidle')

  // Snapshot del DOM a los 2s
  await page.waitForTimeout(2000)
  const snapshot2 = await page.locator('body').innerHTML()
  console.log('DOM a 2s (primeros 500 chars):', snapshot2.slice(0, 500))
  await page.screenshot({ path: 'e2e/screenshots/safari/debug-2s.png' })

  // Snapshot a los 5s
  await page.waitForTimeout(3000)
  const snapshot5 = await page.locator('body').innerHTML()
  console.log('DOM a 5s (primeros 500 chars):', snapshot5.slice(0, 500))
  await page.screenshot({ path: 'e2e/screenshots/safari/debug-5s.png' })

  // Snapshot a los 10s
  await page.waitForTimeout(5000)
  const snapshot10 = await page.locator('body').innerHTML()
  console.log('DOM a 10s (primeros 500 chars):', snapshot10.slice(0, 500))
  await page.screenshot({ path: 'e2e/screenshots/safari/debug-10s.png' })

  console.log('Todas las requests:', networkReqs.filter(u => u.includes('api')))
})
