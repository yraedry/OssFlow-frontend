export type StudyPlan = {
  id: number
  title: string
  description?: string
  startDate: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

export type CreateStudyPlanRequest = {
  title: string
  description?: string
  startDate: string
  endDate?: string
}
