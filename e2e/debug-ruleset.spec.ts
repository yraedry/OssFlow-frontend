import { test } from '@playwright/test'

test('debug ruleset federation selector', async ({ page }) => {
  const BASE = 'http://localhost:5173'
  
  const consoleMessages: string[] = []
  const networkErrors: string[] = []
  
  page.on('console', msg => consoleMessages.push(`${msg.type()}: ${msg.text()}`))
  page.on('requestfailed', req => networkErrors.push(`${req.url()} - ${req.failure()?.errorText}`))
  
  await page.goto(`${BASE}/catalog/rulesets`)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(3000)
  
  // Click nuevo reglamento
  await page.getByRole('button', { name: /nuevo reglamento/i }).click()
  await page.waitForTimeout(2000)
  
  // Verificar que el formulario está montado y hay datos de federaciones
  const fedQuery = await page.evaluate(() => {
    // Buscar en el DOM si hay SelectContent montado
    const selects = document.querySelectorAll('[role="combobox"]')
    const selectItems = document.querySelectorAll('[role="option"]')
    const poppers = document.querySelectorAll('[data-radix-popper-content-wrapper]')
    return {
      comboboxCount: selects.length,
      optionCount: selectItems.length,
      popperCount: poppers.length,
      comboboxTexts: Array.from(selects).map(s => s.textContent?.trim()),
    }
  })
  console.log('DOM state after dialog open:', JSON.stringify(fedQuery))
  
  // Intentar click con force
  const fedCombobox = page.locator('[role="combobox"]').first()
  await fedCombobox.click({ force: true })
  await page.waitForTimeout(1000)
  
  const afterClick = await page.evaluate(() => {
    const selects = document.querySelectorAll('[role="combobox"]')
    const selectItems = document.querySelectorAll('[role="option"]')
    const poppers = document.querySelectorAll('[data-radix-popper-content-wrapper]')
    return {
      comboboxCount: selects.length,
      optionCount: selectItems.length,
      popperCount: poppers.length,
      popperHTML: Array.from(poppers).map(p => p.innerHTML.slice(0, 200)),
    }
  })
  console.log('DOM state after click:', JSON.stringify(afterClick))
  
  await page.screenshot({ path: 'e2e/screenshots/debug-ruleset-1.png', fullPage: true })
  
  // Intentar con keyboard Enter
  await page.keyboard.press('Enter')
  await page.waitForTimeout(500)
  
  const afterEnter = await page.evaluate(() => {
    const selectItems = document.querySelectorAll('[role="option"]')
    return { optionCount: selectItems.length }
  })
  console.log('DOM state after Enter:', JSON.stringify(afterEnter))
  
  await page.screenshot({ path: 'e2e/screenshots/debug-ruleset-2.png', fullPage: true })
  
  console.log('Network errors:', networkErrors)
  console.log('Console messages (errors):', consoleMessages.filter(m => m.includes('error')))
})
