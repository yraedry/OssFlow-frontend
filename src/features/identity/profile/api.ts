import { apiClient, ApiClientError } from '@/shared/api/client'
import type { UserProfile, CreateProfileRequest, UpdateProfileRequest } from './types'

export async function getProfile(): Promise<UserProfile | null> {
  try {
    return await apiClient.get('api/v1/profile').json<UserProfile>()
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) return null
    throw error
  }
}

export async function createProfile(data: CreateProfileRequest): Promise<UserProfile> {
  return apiClient.post('api/v1/profile', { json: data }).json<UserProfile>()
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  return apiClient.put('api/v1/profile', { json: data }).json<UserProfile>()
}
