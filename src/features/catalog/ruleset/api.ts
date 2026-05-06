import { apiClient } from '@/shared/api/client'
import type { Page } from '@/shared/types/pagination'
import type { Ruleset, CreateRulesetRequest, UpdateRulesetRequest } from './types'

export const rulesetApi = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient
      .get('rulesets', { searchParams: params as Record<string, string | number> })
      .json<Page<Ruleset>>(),
  get: (id: number) => apiClient.get(`rulesets/${id}`).json<Ruleset>(),
  create: (data: CreateRulesetRequest) =>
    apiClient.post('rulesets', { json: data }).json<Ruleset>(),
  update: (id: number, data: UpdateRulesetRequest) =>
    apiClient.put(`rulesets/${id}`, { json: data }).json<Ruleset>(),
  delete: (id: number) => apiClient.delete(`rulesets/${id}`),
}
