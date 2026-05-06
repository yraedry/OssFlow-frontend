export type ItemStatus = 'TODO' | 'DOING' | 'DONE' | 'SKIPPED'

export type StudyItem = {
  id: number
  blockId: number
  title: string
  description?: string
  status: ItemStatus
  techniqueId?: number
  positionId?: number
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export type CreateStudyItemRequest = {
  title: string
  description?: string
  orderIndex?: number
}

export type TransitionRequest = {
  targetStatus: ItemStatus
}
