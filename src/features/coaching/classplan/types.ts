import type { StudyBlock } from '../studyplan/types'

export type ClassPlanStatus = 'DRAFT' | 'PUBLISHED'
export type Modality = 'GI' | 'NOGI' | 'BOTH'

export type ClassPlan = {
  id: number
  gymId: number
  title: string
  description?: string
  scheduledDate?: string
  durationMinutes?: number
  modality?: Modality
  status: ClassPlanStatus
  blocks: StudyBlock[]
  createdAt: string
  updatedAt: string
}
