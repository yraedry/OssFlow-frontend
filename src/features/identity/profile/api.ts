import { apiClient, ApiClientError } from '@/shared/api/client'
import type { UserProfile, CreateProfileRequest, UpdateProfileRequest } from './types'
import type { FederationAssignment } from '@/features/identity/federation/types'

export async function getProfile(): Promise<UserProfile | null> {
  try {
    return await apiClient.get('identity/profile').json<UserProfile>()
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null
    throw error
  }
}

export async function createProfile(data: CreateProfileRequest): Promise<UserProfile> {
  return apiClient.post('identity/profile', { json: data }).json<UserProfile>()
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  return apiClient.put('identity/profile', { json: data }).json<UserProfile>()
}

export async function replaceFederations(federations: FederationAssignment[]): Promise<UserProfile> {
  return apiClient.put('identity/profile/federations', { json: federations }).json<UserProfile>()
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete('me/account')
}
