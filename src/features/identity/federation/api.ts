import { apiClient } from '@/shared/api/client'
import type { Federation, FederationAssignment } from './types'

export async function getFederations(): Promise<Federation[]> {
  return apiClient.get('catalog/federations').json<Federation[]>()
}

export interface CreateFederationRequest {
  code: string
  name: string
  officialUrl?: string
}

export async function createFederation(data: CreateFederationRequest): Promise<Federation> {
  return apiClient.post('catalog/federations', { json: data }).json<Federation>()
}

export async function updateProfileFederations(
  federations: FederationAssignment[],
): Promise<void> {
  await apiClient.put('identity/profile/federations', { json: federations })
}
