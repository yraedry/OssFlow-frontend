export type StudyPlanStatus = 'DRAFT' | 'PUBLISHED'
export type StudyItemType = 'TEXT' | 'TECHNIQUE'

export type StudyItem = {
  id: number
  itemOrder: number
  itemType: StudyItemType
  content?: string
  techniqueId?: number
  techniqueName?: string
}

export type StudyBlock = {
  id: number
  title: string
  blockOrder: number
  items: StudyItem[]
}

export type StudyPlan = {
  id: number
  coachId: number
  athleteId: number
  title: string
  description?: string
  status: StudyPlanStatus
  viewedByAthlete: boolean
  blocks: StudyBlock[]
  createdAt: string
  updatedAt: string
}
