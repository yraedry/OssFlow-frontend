export type StudyItem = {
  id: number
  studyBlockId: number
  description: string
  status: string
  targetType?: string
  targetId?: number
  createdAt: string
}

export type StudyBlock = {
  id: number
  studyPlanId: number
  title: string
  startDate?: string
  endDate?: string
  blockOrder: number
  notesMarkdown?: string
  focusEntities?: string
  createdAt: string
  updatedAt: string
}

export type CreateStudyBlockRequest = {
  title: string
  startDate?: string
  endDate?: string
  blockOrder: number
  notesMarkdown?: string
  focusEntities?: string
}
