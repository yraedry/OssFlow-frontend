import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { InvitationCard } from './InvitationCard'
import { coachingApi } from '../api'
import type { InvitationCode } from '../types'

vi.mock('../api', () => ({
  coachingApi: {
    getActiveInvitation: vi.fn(),
    generateInvitation: vi.fn(),
    revokeInvitation: vi.fn(),
    redeemCode: vi.fn(),
    removeAthlete: vi.fn(),
    leaveCoach: vi.fn(),
    getAthletes: vi.fn(),
    getAthleteSummary: vi.fn(),
    getCoaches: vi.fn(),
    getNotifications: vi.fn(),
    markNotificationsRead: vi.fn(),
    changeRole: vi.fn(),
  },
}))

// Sonner toast mock
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const MOCK_INVITATION: InvitationCode = {
  code: 'XYZ999',
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
  usedCount: 2,
}

function renderCard() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    React.createElement(
      QueryClientProvider,
      { client: qc },
      React.createElement(InvitationCard)
    )
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('InvitationCard', () => {
  it('shows "Generar código" button when no invitation exists', async () => {
    const { ApiClientError } = await import('@/shared/api/client')
    vi.mocked(coachingApi.getActiveInvitation).mockRejectedValue(
      new ApiClientError(404, {
        timestamp: '', status: 404, error: 'Not Found', code: 'NOT_FOUND',
        message: 'No active invitation', path: '', traceId: '',
      })
    )
    renderCard()
    const btn = await screen.findByRole('button', { name: /generar código/i })
    expect(btn).toBeInTheDocument()
  })

  it('renders invitation code when invitation exists', async () => {
    vi.mocked(coachingApi.getActiveInvitation).mockResolvedValue(MOCK_INVITATION)
    renderCard()
    const code = await screen.findByText('XYZ999')
    expect(code).toBeInTheDocument()
  })

  it('shows "Revocar" button when invitation exists', async () => {
    vi.mocked(coachingApi.getActiveInvitation).mockResolvedValue(MOCK_INVITATION)
    renderCard()
    const revokeBtn = await screen.findByRole('button', { name: /revocar/i })
    expect(revokeBtn).toBeInTheDocument()
  })

  it('calls revokeInvitation when Revocar is clicked', async () => {
    vi.mocked(coachingApi.getActiveInvitation).mockResolvedValue(MOCK_INVITATION)
    vi.mocked(coachingApi.revokeInvitation).mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderCard()
    const revokeBtn = await screen.findByRole('button', { name: /revocar/i })
    await user.click(revokeBtn)
    expect(coachingApi.revokeInvitation).toHaveBeenCalledOnce()
  })
})
