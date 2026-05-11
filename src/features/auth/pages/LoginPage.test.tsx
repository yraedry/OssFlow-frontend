import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from './LoginPage'

function renderWithRoute(initialPath: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initialPath]}>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  it('renders email and password fields', () => {
    renderWithRoute('/login')
    expect(screen.getByPlaceholderText(/tu@email\.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/••••/)).toBeInTheDocument()
  })

  it('shows error message when ?error=oauth_email_unverified', () => {
    renderWithRoute('/login?error=oauth_email_unverified')
    expect(screen.getByRole('alert')).toHaveTextContent(/email verificado/i)
  })

  it('shows error message when ?error=oauth_account_exists', () => {
    renderWithRoute('/login?error=oauth_account_exists')
    expect(screen.getByRole('alert')).toHaveTextContent(/inicia sesión con tu contraseña/i)
  })

  it('shows generic error when ?error=oauth_failed', () => {
    renderWithRoute('/login?error=oauth_failed')
    expect(screen.getByRole('alert')).toHaveTextContent(/no pudimos completar/i)
  })

  it('does not show alert without error param', () => {
    renderWithRoute('/login')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
