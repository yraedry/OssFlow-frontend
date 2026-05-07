import { apiClient } from '@/shared/api/client'
import type { WeeklyTemplate } from './types'
import type { SaveWeeklyTemplateForm } from './schemas'

export const weeklyTemplateApi = {
  get(): Promise<WeeklyTemplate> {
    return apiClient.get('planning/weekly-template').json<WeeklyTemplate>()
  },
  save(data: SaveWeeklyTemplateForm): Promise<WeeklyTemplate> {
    return apiClient.put('planning/weekly-template', { json: data }).json<WeeklyTemplate>()
  },
}
