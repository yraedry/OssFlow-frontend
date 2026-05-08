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
