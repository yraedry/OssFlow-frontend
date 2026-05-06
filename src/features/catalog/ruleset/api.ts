import { apiClient } from '@/shared/api/client'
import type { Page } from '@/shared/types/pagination'
import type { Ruleset, CreateRulesetRequest, UpdateRulesetRequest } from './types'

export const rulesetApi = {
  list: (params?: { page?: number; size?: number }) =>
    apiClient
      .get('catalog/rulesets', { searchParams: params as Record<string, string | number> })
      .json<Page<Ruleset>>(),
  get: (id: number) => apiClient.get(`catalog/rulesets/${id}`).json<Ruleset>(),
  create: (data: CreateRulesetRequest) =>
    apiClient.post('catalog/rulesets', { json: data }).json<Ruleset>(),
  update: (id: number, data: UpdateRulesetRequest) =>
    apiClient.put(`catalog/rulesets/${id}`, { json: data }).json<Ruleset>(),
  delete: (id: number) => apiClient.delete(`catalog/rulesets/${id}`),
}
