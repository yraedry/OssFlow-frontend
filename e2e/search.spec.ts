import { test, expect, Page } from '@playwright/test'

// Dev server for this project is on port 5178 (5173-5177 taken by other processes)
const BASE = 'http://localhost:5178'

/**
 * Mock auth endpoints via Playwright route intercepting browser requests.
 * - POST /api/auth/refresh → fake token
 * - GET  /api/v1/identity/profile → minimal profile (avoids onboarding redirect)
 * - GET  /api/v1/catalog/** → empty page responses
 */
async function mockAuth(page: Page) {
  await page.route('**/api/auth/refresh', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ accessToken: 'fake-test-token' }),
    })
  })

  await page.route('**/api/v1/identity/profile', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 1, displayName: 'Test', ownerId: 1 }),
    })
  })

  await page.route('**/api/v1/catalog/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: 20,
      }),
    })
  })
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true })
}

test.describe('Search — Estudio subsections', () => {
  test.beforeAll(async () => {
    const fs = await import('fs')
    if (!fs.existsSync('e2e/screenshots')) fs.mkdirSync('e2e/screenshots', { recursive: true })
  })

  async function verifySearchInput(
    page: Page,
    path: string,
    placeholder: string,
    screenshotName: string,
  ) {
    await mockAuth(page)
    await page.goto(`${BASE}${path}`)

    const input = page.locator(`input[placeholder="${placeholder}"]`)

    // Wait up to 8s for the input to become visible (auth + render cycle)
    await input.waitFor({ state: 'visible', timeout: 8000 })

    const count = await input.count()

    await screenshot(page, screenshotName)
    console.log(`[${path}] URL: ${page.url()}`)
    console.log(`[${path}] SearchInput present: ${count > 0}`)

    if (count > 0) {
      // Typing updates value
      await input.fill('test')
      await page.waitForTimeout(400)
      expect(await input.inputValue()).toBe('test')

      // Clear with X button
      const clearBtn = page.locator('button[aria-label="Limpiar búsqueda"]')
      if (await clearBtn.count() > 0) {
        await clearBtn.click()
        await page.waitForTimeout(200)
        expect(await input.inputValue()).toBe('')
      }

      await screenshot(page, `${screenshotName}-after-clear`)
    }

    return count > 0
  }

  test('Técnicas — SearchInput renders and clears', async ({ page }) => {
    const found = await verifySearchInput(page, '/estudio/tecnicas', 'Buscar técnicas...', 'search-tecnicas')
    expect(found).toBe(true)
  })

  test('Posiciones — SearchInput renders and clears', async ({ page }) => {
    const found = await verifySearchInput(page, '/estudio/posiciones', 'Buscar posiciones...', 'search-posiciones')
    expect(found).toBe(true)
  })

  test('Sistemas — SearchInput renders and clears', async ({ page }) => {
    const found = await verifySearchInput(page, '/estudio/sistemas', 'Buscar sistemas...', 'search-sistemas')
    expect(found).toBe(true)
  })

  test('Ejercicios (Físico) — SearchInput renders and clears', async ({ page }) => {
    const found = await verifySearchInput(page, '/estudio/ejercicios', 'Buscar ejercicios...', 'search-ejercicios')
    expect(found).toBe(true)
  })

  test('Movilidad — SearchInput renders and clears', async ({ page }) => {
    const found = await verifySearchInput(page, '/estudio/movilidad', 'Buscar ejercicios de movilidad...', 'search-movilidad')
    expect(found).toBe(true)
  })

  test('Flexibilidad — SearchInput renders and clears', async ({ page }) => {
    const found = await verifySearchInput(page, '/estudio/flexibilidad', 'Buscar ejercicios de flexibilidad...', 'search-flexibilidad')
    expect(found).toBe(true)
  })

  test('Reglamentos — SearchInput renders and clears', async ({ page }) => {
    const found = await verifySearchInput(page, '/estudio/reglamentos', 'Buscar reglamentos...', 'search-reglamentos')
    expect(found).toBe(true)
  })
})
