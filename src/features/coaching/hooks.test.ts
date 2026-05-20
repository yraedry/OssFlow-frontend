import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useActiveInvitation, useGenerateInvitation, useNotifications, COACHING_KEYS } from './hooks'
import { coachingApi } from './api'
import type { InvitationCode, CoachingNotification } from './types'

vi.mock('./api', () => ({
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

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children)
  return { wrapper, qc }
}

const MOCK_INVITATION: InvitationCode = {
  code: 'ABC123',
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
  usedCount: 0,
}

const MOCK_NOTIFICATIONS: CoachingNotification[] = [
  { id: 1, type: 'ATHLETE_JOINED', payload: 'Juan',  read: false, createdAt: new Date().toISOString() },
  { id: 2, type: 'ATHLETE_LEFT',   payload: 'Maria', read: false, createdAt: new Date().toISOString() },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useActiveInvitation', () => {
  it('returns invitation data when available', async () => {
    vi.mocked(coachingApi.getActiveInvitation).mockResolvedValue(MOCK_INVITATION)
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useActiveInvitation(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(MOCK_INVITATION)
  })

  it('returns null when 404', async () => {
    const { ApiClientError } = await import('@/shared/api/client')
    vi.mocked(coachingApi.getActiveInvitation).mockRejectedValue(
      new ApiClientError(404, {
        timestamp: '', status: 404, error: 'Not Found', code: 'NOT_FOUND',
        message: 'No active invitation', path: '', traceId: '',
      })
    )
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useActiveInvitation(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toBeNull()
  })
})

describe('useGenerateInvitation', () => {
  it('calls the API and invalidates the invitation query', async () => {
    vi.mocked(coachingApi.generateInvitation).mockResolvedValue(MOCK_INVITATION)
    vi.mocked(coachingApi.getActiveInvitation).mockResolvedValue(MOCK_INVITATION)
    const { wrapper, qc } = makeWrapper()
    const invalidateSpy = vi.spyOn(qc, 'invalidateQueries')
    const { result } = renderHook(() => useGenerateInvitation(), { wrapper })
    result.current.mutate()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(coachingApi.generateInvitation).toHaveBeenCalledOnce()
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: COACHING_KEYS.invitation })
  })
})

describe('useNotifications', () => {
  it('returns notifications data', async () => {
    vi.mocked(coachingApi.getNotifications).mockResolvedValue(MOCK_NOTIFICATIONS)
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useNotifications(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
  })

  it('fetches notifications on mount', async () => {
    vi.mocked(coachingApi.getNotifications).mockResolvedValue(MOCK_NOTIFICATIONS)
    const { wrapper } = makeWrapper()
    const { result } = renderHook(() => useNotifications(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(coachingApi.getNotifications).toHaveBeenCalledOnce()
    expect(result.current.data).toHaveLength(2)
  })
})
