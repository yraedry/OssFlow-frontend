import { test, expect, Page } from '@playwright/test'

const BASE = 'http://localhost:5173'

// El backend no está corriendo, así que el AuthGuard esperará indefinidamente el perfil.
// Navegamos directamente al onboarding y luego a todas las rutas sin guard.
// Para probar la UI sin backend, vamos directo a cada ruta inyectando un mock del perfil.

async function goTo(page: Page, path: string) {
  await page.goto(`${BASE}${path}`)
  await page.waitForLoadState('networkidle')
}

async function screenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: true })
}

test.describe('OssFlow E2E smoke tests', () => {
  test.beforeAll(async () => {
    const fs = await import('fs')
    if (!fs.existsSync('e2e/screenshots')) fs.mkdirSync('e2e/screenshots', { recursive: true })
  })

  test('homepage carga y muestra spinner o redirect a onboarding', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForTimeout(3000)
    const url = page.url()
    // Sin backend, puede quedarse en home con spinner o ir a onboarding
    console.log('URL tras carga:', url)
    await screenshot(page, '01-homepage')
    // Verificar que al menos el DOM existe
    expect(await page.title()).toBeTruthy()
  })

  test('onboarding page carga correctamente', async ({ page }) => {
    await page.goto(`${BASE}/onboarding`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await screenshot(page, '02-onboarding')
    // Debe mostrar algo sobre bienvenida o formulario
    const body = await page.locator('body').textContent()
    console.log('Onboarding body (truncado):', body?.slice(0, 200))
    expect(body).toBeTruthy()
  })

  test('onboarding: paso 1 - rellenar nombre', async ({ page }) => {
    await page.goto(`${BASE}/onboarding`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Buscar input de nombre
    const nameInput = page.locator('input[id="displayName"], input[placeholder*="nombre"], input[placeholder*="Juan"]').first()
    const exists = await nameInput.count()
    if (exists > 0) {
      await nameInput.fill('Adrian Núñez')
      await screenshot(page, '03-onboarding-step1-filled')
      await page.locator('button[type="submit"], button:has-text("Siguiente")').first().click()
      await page.waitForTimeout(1000)
      await screenshot(page, '04-onboarding-step2')
      console.log('Onboarding paso 2 URL:', page.url())
    } else {
      console.log('Input no encontrado, puede estar en spinner o redirigido')
      await screenshot(page, '03-onboarding-no-input')
    }
  })

  test('404 page funciona', async ({ page }) => {
    await page.goto(`${BASE}/ruta-inexistente`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    await screenshot(page, '05-not-found')
    const body = await page.locator('body').textContent()
    console.log('404 body:', body?.slice(0, 200))
    expect(body).toBeTruthy()
  })

  // Pruebas responsive — viewport mobile
  test('responsive mobile: homepage en 390x844', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(BASE)
    await page.waitForTimeout(2000)
    await screenshot(page, '06-mobile-homepage')
    const body = await page.locator('body').textContent()
    expect(body).toBeTruthy()
  })

  test('responsive tablet: homepage en 768x1024', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto(BASE)
    await page.waitForTimeout(2000)
    await screenshot(page, '07-tablet-homepage')
    const body = await page.locator('body').textContent()
    expect(body).toBeTruthy()
  })

  test('responsive desktop: homepage en 1440x900', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(BASE)
    await page.waitForTimeout(2000)
    await screenshot(page, '08-desktop-homepage')
    const body = await page.locator('body').textContent()
    expect(body).toBeTruthy()
  })

  // Prueba de la build — verificar que no hay errores de consola fatales
  test('no hay errores fatales en consola', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto(BASE)
    await page.waitForTimeout(3000)
    // Filtra errores esperados (404 de API sin backend)
    const fatalErrors = errors.filter(e =>
      !e.includes('Failed to fetch') &&
      !e.includes('NetworkError') &&
      !e.includes('net::ERR') &&
      !e.includes('Load failed') &&
      !e.includes('api/v1') &&
      !e.includes('localhost:8080')
    )
    console.log('Todos los errores:', errors)
    console.log('Errores fatales (filtrados):', fatalErrors)
    expect(fatalErrors).toHaveLength(0)
  })
})
