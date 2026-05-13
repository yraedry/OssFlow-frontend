import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { NotificationBell } from './NotificationBell'
import { coachingApi } from '../api'
import type { CoachingNotification } from '../types'

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

const MOCK_NOTIFICATIONS: CoachingNotification[] = [
  { id: 1, type: 'ATHLETE_JOINED', payload: 'Juan Perez', createdAt: new Date().toISOString() },
]

function renderBell() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    React.createElement(
      QueryClientProvider,
      { client: qc },
      React.createElement(NotificationBell)
    )
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NotificationBell', () => {
  it('shows purple badge when there are notifications', async () => {
    vi.mocked(coachingApi.getNotifications).mockResolvedValue(MOCK_NOTIFICATIONS)
    renderBell()
    // Wait for the badge to appear
    const badge = await screen.findByRole('button', { name: /notificaciones \(1 nuevas\)/i })
    expect(badge).toBeInTheDocument()
    // Badge span should be present
    const bellBtn = screen.getByRole('button', { name: /notificaciones/i })
    // Badge is a sibling span inside the button
    expect(bellBtn.querySelector('span.bg-purple-600')).toBeInTheDocument()
  })

  it('opens dropdown with notifications when clicked', async () => {
    vi.mocked(coachingApi.getNotifications).mockResolvedValue(MOCK_NOTIFICATIONS)
    vi.mocked(coachingApi.markNotificationsRead).mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderBell()
    await screen.findByRole('button', { name: /notificaciones/i })
    const bell = screen.getByRole('button', { name: /notificaciones/i })
    await user.click(bell)
    expect(await screen.findByText(/nuevo alumno/i)).toBeInTheDocument()
  })

  it('marks notifications as read when dropdown opens with unread notifications', async () => {
    vi.mocked(coachingApi.getNotifications).mockResolvedValue(MOCK_NOTIFICATIONS)
    vi.mocked(coachingApi.markNotificationsRead).mockResolvedValue(undefined)
    const user = userEvent.setup()
    renderBell()
    await screen.findByRole('button', { name: /notificaciones/i })
    const bell = screen.getByRole('button', { name: /notificaciones/i })
    await user.click(bell)
    expect(coachingApi.markNotificationsRead).toHaveBeenCalledOnce()
  })

  it('shows "Sin notificaciones" when list is empty', async () => {
    vi.mocked(coachingApi.getNotifications).mockResolvedValue([])
    const user = userEvent.setup()
    renderBell()
    await screen.findByRole('button', { name: 'Notificaciones' })
    const bell = screen.getByRole('button', { name: 'Notificaciones' })
    await user.click(bell)
    expect(await screen.findByText(/sin notificaciones/i)).toBeInTheDocument()
  })
})
