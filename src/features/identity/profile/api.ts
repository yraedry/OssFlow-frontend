import { apiClient, ApiClientError } from '@/shared/api/client'
import type { UserProfile, CreateProfileRequest, UpdateProfileRequest } from './types'

export async function getProfile(): Promise<UserProfile | null> {
  try {
    return await apiClient.get('profile').json<UserProfile>()
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null
    throw error
  }
}

export async function createProfile(data: CreateProfileRequest): Promise<UserProfile> {
  return apiClient.post('profile', { json: data }).json<UserProfile>()
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  return apiClient.put('profile', { json: data }).json<UserProfile>()
}
