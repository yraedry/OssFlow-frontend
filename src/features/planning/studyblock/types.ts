export type StudyBlock = {
  id: number
  planId: number
  title: string
  description?: string
  weekNumber?: number
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export type CreateStudyBlockRequest = {
  title: string
  description?: string
  weekNumber?: number
  orderIndex?: number
}
