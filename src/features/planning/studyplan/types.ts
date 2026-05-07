export type StudyPlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'

export type StudyPlan = {
  id: number
  title: string
  goalMarkdown?: string
  startDate?: string
  endDate?: string
  status: StudyPlanStatus
  createdAt: string
  updatedAt: string
}

export type CreateStudyPlanRequest = {
  title: string
  goalMarkdown?: string
  startDate?: string
  endDate?: string
  status: StudyPlanStatus
}
