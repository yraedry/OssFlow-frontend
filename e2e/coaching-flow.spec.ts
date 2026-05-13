import { test, expect } from '@playwright/test'

/**
 * Smoke tests: flujo completo maestro-atleta
 * Requiere frontend en http://localhost:5173 y backend en http://localhost:8080
 *
 * Cubre:
 *  - Página de registro carga y muestra el formulario de creación de cuenta
 *  - Página de login carga y muestra el botón de inicio de sesión
 *  - /gimnasio (CoachingDashboardPage) redirige a /login cuando no hay sesión activa
 */

test.describe('Coach-Athlete flow smoke tests', () => {
  test('registration page loads and shows create-account form', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // El título del formulario es "Crear cuenta"
    await expect(page.getByText('Crear cuenta').first()).toBeVisible({ timeout: 5000 })

    // El botón de submit tiene el texto "Crear cuenta"
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible({ timeout: 5000 })

    // Los campos email y contraseña están presentes
    await expect(page.locator('#email')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('#password')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('#confirmPassword')).toBeVisible({ timeout: 5000 })
  })

  test('login page is accessible and shows login button', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // El título del formulario es "Iniciar sesión"
    await expect(page.getByText('Iniciar sesión').first()).toBeVisible({ timeout: 5000 })

    // El botón principal de login
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible({ timeout: 5000 })

    // Campo de email presente
    await expect(page.locator('#email')).toBeVisible({ timeout: 5000 })
  })

  test('coaching dashboard /gimnasio redirects to /login when not authenticated', async ({ page }) => {
    // AuthGuard: si no hay token activo y la ruta no es /, navega a /login
    await page.goto('/gimnasio')

    // Esperamos que el AuthGuard haga el refresh intento (timeout 3 s) y luego redirija
    await expect(page).toHaveURL(/\/login/, { timeout: 6000 })

    // La página de login debe haberse cargado correctamente
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible({ timeout: 5000 })
  })

  test('registration → login navigation works', async ({ page }) => {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')

    // El enlace "Iniciar sesión" al final del form lleva a /login
    await page.getByRole('link', { name: /iniciar sesión/i }).click()
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 })
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible({ timeout: 5000 })
  })

  test('login → register navigation works', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')

    // El enlace "Regístrate" al final del form lleva a /register
    await page.getByRole('link', { name: /regístrate/i }).click()
    await expect(page).toHaveURL(/\/register/, { timeout: 5000 })
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible({ timeout: 5000 })
  })
})
