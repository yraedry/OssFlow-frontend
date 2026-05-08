export type Intensity = 'LIGHT' | 'MODERATE' | 'HARD' | 'COMPETITION'
export type SessionType = 'BJJ' | 'PHYSICAL' | 'CARDIO'

export interface WorkedTechnique {
  trainingSessionId: number
  techniqueId: number
  techniqueName?: string
  repCount?: number
  notesMarkdown?: string
}

export interface UpsertWorkedTechniqueRequest {
  techniqueId: number
  repCount?: number
  notesMarkdown?: string
}

export interface TrainingSession {
  id: number
  sessionDate: string
  durationMinutes: number
  location?: string
  intensity: Intensity
  sessionType: SessionType
  notesMarkdown?: string
  createdAt: string
  updatedAt: string
  workedTechniques: WorkedTechnique[]
}

export interface CreateTrainingSessionRequest {
  sessionDate: string
  durationMinutes: number
  location?: string
  intensity: Intensity
  sessionType: SessionType
  notesMarkdown?: string
}
