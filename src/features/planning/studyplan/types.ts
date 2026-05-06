export interface StudyPlan {
  id: number
  title: string
  description?: string
  visibility: 'PUBLIC' | 'PRIVATE'
  createdAt: string
  updatedAt: string
}

export interface CreateStudyPlanRequest {
  title: string
  description?: string
  visibility: StudyPlan['visibility']
}
