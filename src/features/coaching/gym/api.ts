import { apiClient } from '@/shared/api/client'
import type { GymLocation } from './types'

const BASE = 'coaching/gyms'

export const gymApi = {
  list(): Promise<GymLocation[]> {
    return apiClient.get(BASE).json<GymLocation[]>()
  },
  create(name: string, address?: string): Promise<GymLocation> {
    return apiClient.post(BASE, { json: { name, address } }).json<GymLocation>()
  },
  update(id: number, name: string, address?: string): Promise<GymLocation> {
    return apiClient.put(`${BASE}/${id}`, { json: { name, address } }).json<GymLocation>()
  },
  delete(id: number): Promise<void> {
    return apiClient.delete(`${BASE}/${id}`).then(() => undefined)
  },
}
