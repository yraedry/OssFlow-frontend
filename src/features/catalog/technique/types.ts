export type TechniqueCategory = 'SUBMISSION' | 'SWEEP' | 'PASS' | 'TAKEDOWN' | 'ESCAPE' | 'TRANSITION'

export interface Technique {
  id: number
  name: string
  category: TechniqueCategory
  startPositionId: number
  startPositionName?: string
  endPositionId?: number
  endPositionName?: string
  minimumBelt: 'WHITE' | 'BLUE' | 'PURPLE' | 'BROWN' | 'BLACK'
  modality: 'GI' | 'NOGI' | 'BOTH'
  visibility: 'PUBLIC' | 'PRIVATE'
  description?: string
  youtubeUrl?: string
  aiGenerated?: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTechniqueRequest {
  name: string
  category: TechniqueCategory
  startPositionId: number
  endPositionId?: number
  minimumBelt: Technique['minimumBelt']
  modality: Technique['modality']
  visibility: Technique['visibility']
  description?: string
  youtubeUrl?: string
}
