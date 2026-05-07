import { apiClient } from './client'

export interface WeeklyStats {
  weekNumber: number
  weekStart: string
  weekEnd: string
  bjjSessions: number
  physicalSessions: number
  bjjGoal: number
  physicalGoal: number
  streakDays: number
  techniquesThisMonth: number
}

export function fetchWeeklyStats(): Promise<WeeklyStats> {
  return apiClient.get('dashboard/weekly-stats').json<WeeklyStats>()
}
