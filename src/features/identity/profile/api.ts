import { apiClient } from '@/shared/api/client'
import type { Profile, CreateProfileRequest } from './types'

export const profileApi = {
  get: () => apiClient.get('identity/profile').json<Profile>(),
  create: (data: CreateProfileRequest) => apiClient.post('identity/profile', { json: data }).json<Profile>(),
  update: (data: Partial<CreateProfileRequest>) =>
    apiClient.patch('identity/profile', { json: data }).json<Profile>(),
}
