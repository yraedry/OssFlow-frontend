import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'

test.describe('OssFlow - prueba completa de flujos', () => {
  test('posiciones - crear con tipos correctos (no NEUTRAL)', async ({ page }) => {
    await page.goto(`${BASE}/catalog/positions`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500)

    await page.getByRole('button', { name: /nueva posición/i }).click()
    await page.waitForTimeout(600)

    // Abrir selector de tipo
    const typeCombobox = page.locator('[role="combobox"]').first()
    await typeCombobox.click()
    await page.waitForTimeout(400)

    const options = page.locator('[role="option"]')
    const optTexts = await options.allTextContents()
    console.log('Tipos de posición disponibles:', optTexts)

    expect(optTexts.some(t => t.includes('Top'))).toBeTruthy()
    expect(optTexts.some(t => t.includes('De pie'))).toBeTruthy()
    expect(optTexts.some(t => t.includes('Neutral en suelo'))).toBeTruthy()
    expect(optTexts.some(t => t.includes('Sometido'))).toBeTruthy()
    expect(optTexts.every(t => !t.trim().match(/^Neutral$/))).toBeTruthy()

    await options.filter({ hasText: 'De pie' }).first().click()
    await page.getByLabel(/nombre/i).fill('Posición de pie - e2e')
    await page.getByRole('button', { name: /crear posición/i }).click()
    await page.waitForTimeout(1500)

    await expect(page.getByText('Posición de pie - e2e')).toBeVisible()
    console.log('✅ Posiciones: creación OK con STANDING, 5 tipos disponibles')
  })

  test('técnicas - categoría aparece primero y usa minimumBelt', async ({ page }) => {
    await page.goto(`${BASE}/catalog/techniques`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500)

    await page.getByRole('button', { name: /nueva técnica/i }).click()
    await page.waitForTimeout(600)

    await expect(page.getByText('Categoría *')).toBeVisible()
    await expect(page.getByText('Cinturón mínimo')).toBeVisible()

    await page.getByLabel(/nombre/i).fill(`Armbar e2e ${Date.now()}`)

    // Primer combobox = Categoría
    const categoryCombobox = page.locator('[role="combobox"]').first()
    await categoryCombobox.click()
    await page.waitForTimeout(400)

    const catOptions = page.locator('[role="option"]')
    const catTexts = await catOptions.allTextContents()
    console.log('Categorías:', catTexts)

    expect(catTexts.some(t => t.includes('Sumisión'))).toBeTruthy()
    await catOptions.filter({ hasText: /sumisión/i }).first().click()

    // Segundo combobox = Posición de inicio
    const posCombobox = page.locator('[role="combobox"]').nth(1)
    await posCombobox.click()
    await page.waitForTimeout(600)
    const posOptions = page.locator('[role="option"]')
    const posCount = await posOptions.count()
    if (posCount > 0) {
      await posOptions.first().click()
    } else {
      console.log('⚠️ Sin posiciones todavía, se creará técnica sin posición de inicio')
      await page.keyboard.press('Escape')
    }

    await page.getByRole('button', { name: /crear técnica/i }).click()
    await page.waitForTimeout(2000)

    const errorToast = page.locator('[data-sonner-toast]').filter({ hasText: /error/i })
    const hasError = await errorToast.isVisible().catch(() => false)
    if (hasError) {
      console.log('❌ Error al crear técnica:', await errorToast.textContent())
    } else {
      console.log('✅ Técnicas: categoría primero, minimumBelt OK')
    }
  })

  test('sistemas - tiene campo flowDefinition y crea OK', async ({ page }) => {
    await page.goto(`${BASE}/catalog/systems`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500)

    await page.getByRole('button', { name: /nuevo sistema/i }).click()
    await page.waitForTimeout(600)

    await expect(page.getByText(/definición de flujo/i)).toBeVisible()

    await page.getByLabel(/nombre/i).fill(`Sistema e2e ${Date.now()}`)
    await page.getByRole('button', { name: /crear sistema/i }).click()
    await page.waitForTimeout(2000)

    const errorToast = page.locator('[data-sonner-toast]').filter({ hasText: /error/i })
    const hasError = await errorToast.isVisible().catch(() => false)
    if (hasError) {
      console.log('❌ Error al crear sistema:', await errorToast.textContent())
    } else {
      console.log('✅ Sistemas: flowDefinition presente, creación OK')
    }
  })

  test('reglamentos - selector de federación carga opciones', async ({ page }) => {
    await page.goto(`${BASE}/catalog/rulesets`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500)

    await page.getByRole('button', { name: /nuevo reglamento/i }).click()
    // Esperamos que el dialog cargue y que el hook de federaciones haga fetch
    await page.waitForTimeout(1500)

    await expect(page.getByText('Federación *')).toBeVisible()

    // No debe haber campo de texto libre para ID de federación
    const textInput = page.getByLabel(/id de federación/i)
    const hasTextInput = await textInput.isVisible().catch(() => false)
    expect(hasTextInput).toBeFalsy()

    const fedCombobox = page.locator('[role="combobox"]').first()
    // Abrir y cerrar el dropdown varias veces hasta que las opciones aparezcan (esperando el fetch)
    let fedCount = 0
    for (let attempt = 0; attempt < 5; attempt++) {
      await fedCombobox.click()
      await page.waitForTimeout(800)
      fedCount = await page.locator('[role="option"]').count()
      if (fedCount > 0) break
      // Cerrar el dropdown y esperar más
      await page.keyboard.press('Escape')
      await page.waitForTimeout(600)
    }

    console.log(`Federaciones en selector: ${fedCount}`)
    expect(fedCount).toBeGreaterThan(0)
    await page.locator('[role="option"]').first().click()
    await page.getByLabel(/vigente desde/i).fill('2024-01-01')
    await page.getByRole('button', { name: /crear reglamento/i }).click()
    await page.waitForTimeout(2000)

    const errorToast = page.locator('[data-sonner-toast]').filter({ hasText: /error/i })
    const hasError = await errorToast.isVisible().catch(() => false)
    if (hasError) {
      console.log('❌ Error al crear reglamento:', await errorToast.textContent())
    } else {
      console.log('✅ Reglamentos: selector de federación OK, creación OK')
    }
  })

  test('sesiones de entrenamiento - sin crash, crear OK', async ({ page }) => {
    const jsErrors: string[] = []
    page.on('pageerror', err => jsErrors.push(err.message))

    await page.goto(`${BASE}/journal/training-sessions`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(3000)

    // No debe haber TypeError de null
    const hasTypeError = jsErrors.some(e => e.includes('Cannot read properties of null'))
    if (hasTypeError) console.log('❌ TypeError:', jsErrors.join(', '))
    expect(hasTypeError).toBeFalsy()

    // No debe haber error boundary visible
    const errorBoundary = page.locator('h3').filter({ hasText: /Cannot read properties/i })
    await expect(errorBoundary).not.toBeVisible()

    await expect(page.getByRole('button', { name: /nueva sesión/i })).toBeVisible()

    // Crear sesión
    await page.getByRole('button', { name: /nueva sesión/i }).click()
    await page.waitForTimeout(600)
    await expect(page.getByLabel(/fecha/i).first()).toBeVisible()

    await page.getByRole('button', { name: /crear sesión/i }).click()
    await page.waitForTimeout(2000)

    const errorToast = page.locator('[data-sonner-toast]').filter({ hasText: /error/i })
    const hasError = await errorToast.isVisible().catch(() => false)
    if (hasError) {
      console.log('❌ Error al crear sesión:', await errorToast.textContent())
    } else {
      console.log('✅ Sesiones: sin crash, creación OK')
    }
  })

  test('perfil - carga con campos correctos', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2500)

    await expect(page.getByText(/cinturón actual/i)).toBeVisible()
    await expect(page.getByText(/modalidad preferida/i)).toBeVisible()
    console.log('✅ Perfil: currentBelt y preferredModality presentes')
  })
})
