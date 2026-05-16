import { apiClient } from '@/shared/api/client'
import type {
  InvitationCode, CoachAthleteListItem, AthleteSummary, CoachListItem, CoachingNotification,
  TechniqueFamily, Observation, RadarPoint, CreateObservationPayload,
} from './types'
import type { AccountRole } from '@/features/identity/profile/types'

export const coachingApi = {
  generateInvitation(): Promise<InvitationCode> {
    return apiClient.post('coaching/invitations').json<InvitationCode>()
  },

  getActiveInvitation(): Promise<InvitationCode> {
    return apiClient.get('coaching/invitations/active').json<InvitationCode>()
  },

  revokeInvitation(): Promise<void> {
    return apiClient.delete('coaching/invitations/active').json<void>()
  },

  redeemCode(code: string): Promise<void> {
    return apiClient.post('coaching/memberships/redeem', { json: { code } }).json<void>()
  },

  removeAthlete(athleteId: number): Promise<void> {
    return apiClient.delete(`coaching/memberships/${athleteId}`).json<void>()
  },

  leaveCoach(coachId: number): Promise<void> {
    return apiClient.delete(`coaching/memberships/leave/${coachId}`).json<void>()
  },

  getAthletes(): Promise<CoachAthleteListItem[]> {
    return apiClient.get('coaching/athletes').json<CoachAthleteListItem[]>()
  },

  getAthleteSummary(athleteId: number): Promise<AthleteSummary> {
    return apiClient.get(`coaching/athletes/${athleteId}/summary`).json<AthleteSummary>()
  },

  getCoaches(): Promise<CoachListItem[]> {
    return apiClient.get('coaching/coaches').json<CoachListItem[]>()
  },

  getNotifications(): Promise<CoachingNotification[]> {
    return apiClient.get('coaching/notifications').json<CoachingNotification[]>()
  },

  markNotificationsRead(): Promise<void> {
    return apiClient.patch('coaching/notifications/read').json<void>()
  },

  changeRole(role: AccountRole): Promise<void> {
    return apiClient.patch('me/role', { json: { role } }).then(() => undefined)
  },

  getTechniqueFamilies(): Promise<TechniqueFamily[]> {
    return apiClient.get('catalog/techniques/families').json<TechniqueFamily[]>()
  },

  getObservations(athleteId: number): Promise<Observation[]> {
    return apiClient.get(`coaching/observations/athlete/${athleteId}`).json<Observation[]>()
  },

  getObservationRadar(athleteId: number): Promise<RadarPoint[]> {
    return apiClient.get(`coaching/observations/athlete/${athleteId}/radar`).json<RadarPoint[]>()
  },

  createObservation(payload: CreateObservationPayload): Promise<Observation> {
    return apiClient.post('coaching/observations', { json: payload }).json<Observation>()
  },

  deleteObservation(id: number): Promise<void> {
    return apiClient.delete(`coaching/observations/${id}`).json<void>()
  },
}
