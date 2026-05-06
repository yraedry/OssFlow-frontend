import { apiClient } from '@/shared/api/client'
import type { Page } from '@/shared/types/pagination'
import type { Ruleset, CreateRulesetRequest, UpdateRulesetRequest } from './types'

export const rulesetApi = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient
      .get('api/v1/rulesets', { searchParams: params as Record<string, string | number> })
      .json<Page<Ruleset>>(),
  get: (id: number) => apiClient.get(`api/v1/rulesets/${id}`).json<Ruleset>(),
  create: (data: CreateRulesetRequest) =>
    apiClient.post('api/v1/rulesets', { json: data }).json<Ruleset>(),
  update: (id: number, data: UpdateRulesetRequest) =>
    apiClient.put(`api/v1/rulesets/${id}`, { json: data }).json<Ruleset>(),
  delete: (id: number) => apiClient.delete(`api/v1/rulesets/${id}`),
}
