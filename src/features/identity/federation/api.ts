import { apiClient } from '@/shared/api/client'
import type { Federation, ProfileFederation, FederationAssignment } from './types'

type PageResponse<T> = { content: T[]; totalElements: number; totalPages: number }

export async function getFederations(): Promise<Federation[]> {
  const res = await apiClient.get('catalog/federations').json<PageResponse<Federation>>()
  return res.content
}

export async function getProfileFederations(profileId: number): Promise<ProfileFederation[]> {
  return apiClient.get(`identity/profile/${profileId}/federations`).json<ProfileFederation[]>()
}

export async function updateProfileFederations(
  profileId: number,
  federations: FederationAssignment[],
): Promise<ProfileFederation[]> {
  return apiClient
    .put(`identity/profile/${profileId}/federations`, { json: { federations } })
    .json<ProfileFederation[]>()
}
