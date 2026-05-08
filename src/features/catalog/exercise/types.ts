export type ExerciseCategory = 'STRENGTH' | 'CARDIO' | 'FLEXIBILITY' | 'CORE' | 'MOBILITY' | 'OTHER'
export type EquipmentType = 'NO_EQUIPMENT' | 'HOME' | 'GYM'

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  STRENGTH: 'Fuerza',
  CARDIO: 'Cardio',
  FLEXIBILITY: 'Flexibilidad',
  CORE: 'Core',
  MOBILITY: 'Movilidad',
  OTHER: 'Otro',
}

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  NO_EQUIPMENT: 'Sin material',
  HOME: 'En casa',
  GYM: 'Gimnasio',
}

export interface Exercise {
  id: number
  ownerId: number
  name: string
  description?: string
  category: ExerciseCategory
  equipment: EquipmentType
  youtubeUrl?: string
  visibility: 'PUBLIC' | 'PRIVATE'
  createdAt: string
  updatedAt: string
  version: number
}

export interface CreateExerciseRequest {
  name: string
  description?: string
  category: ExerciseCategory
  equipment: EquipmentType
  youtubeUrl?: string
  visibility: 'PUBLIC' | 'PRIVATE'
}
