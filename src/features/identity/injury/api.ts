import { apiClient } from '@/shared/api/client'
import type { Injury, CreateInjuryRequest } from './types'

export async function getInjuries(): Promise<Injury[]> {
  return apiClient.get('identity/injuries').json<Injury[]>()
}

export async function createInjury(data: CreateInjuryRequest): Promise<Injury> {
  return apiClient.post('identity/injuries', { json: data }).json<Injury>()
}

export async function updateInjury(id: number, data: CreateInjuryRequest): Promise<Injury> {
  return apiClient.put(`identity/injuries/${id}`, { json: data }).json<Injury>()
}

export async function deleteInjury(id: number): Promise<void> {
  await apiClient.delete(`identity/injuries/${id}`)
}
