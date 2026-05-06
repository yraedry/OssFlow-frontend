import { test, expect, Page, Browser } from '@playwright/test'
import fs from 'fs'

const BASE = 'http://localhost:5173'
const SS = 'e2e/screenshots/safari'

async function snap(page: Page, name: string) {
  await page.screenshot({ path: `${SS}/${name}.png`, fullPage: true })
}

async function visitAndSnap(page: Page, path: string, name: string, waitMs = 3500) {
  await page.goto(`${BASE}${path}`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(waitMs)
  await snap(page, name)
  return { url: page.url(), title: await page.title() }
}

test.describe.configure({ mode: 'serial' })

test.describe('Safari E2E — Navegación completa', () => {
  test.beforeAll(() => {
    if (!fs.existsSync(SS)) fs.mkdirSync(SS, { recursive: true })
  })

  // ─── ONBOARDING ───────────────────────────────────────────────
  test('01 — Onboarding: pantalla de bienvenida', async ({ page }) => {
    await page.goto(`${BASE}/onboarding`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    await snap(page, '01-onboarding-welcome')
    const text = await page.locator('body').textContent()
    expect(text).toContain('OssFlow')
  })

  test('02 — Onboarding: rellenar paso 1 y avanzar', async ({ page }) => {
    await page.goto(`${BASE}/onboarding`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    const nameInput = page.locator('#displayName')
    if (await nameInput.count() > 0) {
      await nameInput.fill('Adrian Núñez')
      const bioInput = page.locator('#bio')
      if (await bioInput.count() > 0) await bioInput.fill('Cinturón azul, 3 años practicando')
      await snap(page, '02-onboarding-step1-filled')
      await page.locator('button:has-text("Siguiente")').first().click()
      await page.waitForTimeout(1000)
      await snap(page, '03-onboarding-step2-federaciones')
    }
  })

  // ─── HOMEPAGE (con backend caído → isError → muestra app) ────
  test('04 — Homepage: dashboard carga (backend caído → isError)', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(4000) // esperar timeout de red
    await snap(page, '04-homepage-dashboard')
    const body = await page.locator('body').textContent()
    console.log('Homepage body:', body?.slice(0, 300))
  })

  // ─── CATÁLOGO ─────────────────────────────────────────────────
  test('05 — Posiciones: lista', async ({ page }) => {
    await visitAndSnap(page, '/catalog/positions', '05-catalog-positions')
    const body = await page.locator('body').textContent()
    console.log('Posiciones body:', body?.slice(0, 200))
    // Solo verificamos que carga algo, sin backend puede mostrar estado vacío o spinner
    expect(body).toBeTruthy()
  })

  test('06 — Técnicas: lista', async ({ page }) => {
    await visitAndSnap(page, '/catalog/techniques', '06-catalog-techniques')
  })

  test('07 — Sistemas: lista', async ({ page }) => {
    await visitAndSnap(page, '/catalog/systems', '07-catalog-systems')
  })

  test('08 — Reglamentos: lista', async ({ page }) => {
    await visitAndSnap(page, '/catalog/rulesets', '08-catalog-rulesets')
  })

  // ─── JOURNAL ──────────────────────────────────────────────────
  test('09 — Notas: lista', async ({ page }) => {
    await visitAndSnap(page, '/journal/notes', '09-journal-notes')
  })

  test('10 — Grafo de notas', async ({ page }) => {
    await visitAndSnap(page, '/journal/graph', '10-journal-graph', 3000)
  })

  test('11 — Sesiones de entrenamiento', async ({ page }) => {
    await visitAndSnap(page, '/journal/training-sessions', '11-journal-training')
  })

  // ─── COMPETENCIAS ─────────────────────────────────────────────
  test('12 — Competencias: lista', async ({ page }) => {
    await visitAndSnap(page, '/competition/logs', '12-competition-logs')
  })

  // ─── PLANNING ─────────────────────────────────────────────────
  test('13 — Planes de estudio: lista', async ({ page }) => {
    await visitAndSnap(page, '/planning/study-plans', '13-planning-study-plans')
  })

  // ─── PERFIL ───────────────────────────────────────────────────
  test('14 — Perfil de usuario', async ({ page }) => {
    await visitAndSnap(page, '/profile', '14-profile')
  })

  // ─── EXPORT / TRASH ───────────────────────────────────────────
  test('15 — Exportar datos', async ({ page }) => {
    await visitAndSnap(page, '/export', '15-export')
  })

  test('16 — Papelera', async ({ page }) => {
    await visitAndSnap(page, '/trash', '16-trash')
  })

  // ─── 404 ──────────────────────────────────────────────────────
  test('17 — Página 404', async ({ page }) => {
    await visitAndSnap(page, '/ruta-que-no-existe', '17-not-found')
    const body = await page.locator('body').textContent()
    expect(body).toContain('404')
  })

  // ─── RESPONSIVE ───────────────────────────────────────────────
  test('18 — Responsive mobile 390×844: catálogo posiciones', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await visitAndSnap(page, '/catalog/positions', '18-mobile-390-positions', 2500)
  })

  test('19 — Responsive tablet 768×1024: homepage', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    await snap(page, '19-tablet-768-homepage')
  })

  test('20 — Responsive desktop 1440×900: homepage', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)
    await snap(page, '20-desktop-1440-homepage')
  })

  test('21 — Dark mode toggle', async ({ page }) => {
    await page.goto(`${BASE}/catalog/positions`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500)
    // Buscar botón de toggle de tema
    const themeBtn = page.locator('button[aria-label*="tema"], button[aria-label*="theme"], button:has(svg[data-lucide="moon"]), button:has(svg[data-lucide="sun"])').first()
    if (await themeBtn.count() > 0) {
      await themeBtn.click()
      await page.waitForTimeout(500)
      await snap(page, '21a-dark-mode')
      await themeBtn.click()
      await page.waitForTimeout(500)
      await snap(page, '21b-light-mode')
    } else {
      await snap(page, '21-no-theme-button-found')
      console.log('Botón de tema no encontrado')
    }
  })

  test('22 — Command palette Cmd+K', async ({ page }) => {
    await page.goto(`${BASE}/catalog/positions`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.keyboard.press('Meta+k')
    await page.waitForTimeout(800)
    await snap(page, '22-command-palette')
    const palette = page.locator('[cmdk-root], [role="dialog"]').first()
    console.log('Command palette visible:', await palette.count() > 0)
  })

  test('23 — No errores JS fatales en ninguna ruta', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))

    const routes = ['/', '/catalog/positions', '/catalog/techniques', '/catalog/systems',
      '/journal/notes', '/competition/logs', '/planning/study-plans', '/profile', '/trash', '/export']

    for (const route of routes) {
      await page.goto(`${BASE}${route}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    }

    const fatal = errors.filter(e =>
      !e.includes('Failed to fetch') && !e.includes('NetworkError') &&
      !e.includes('net::ERR') && !e.includes('Load failed') &&
      !e.includes('api/v1') && !e.includes('localhost:8080') &&
      !e.includes('fetch') && !e.includes('network')
    )
    console.log('Errores totales:', errors.length, '| Fatales:', fatal.length)
    if (fatal.length > 0) console.log('Fatales:', fatal)
    expect(fatal).toHaveLength(0)
  })
})
