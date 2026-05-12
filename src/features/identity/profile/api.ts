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

export async function exportFullBackup(): Promise<void> {
  const response = await apiClient.get('export/full')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ossflow-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importBackup(json: unknown): Promise<void> {
  await apiClient.post('me/import', { json })
}
