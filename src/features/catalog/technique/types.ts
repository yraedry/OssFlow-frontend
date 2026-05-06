export interface Technique {
  id: number
  name: string
  startPositionId: number
  startPositionName?: string
  endPositionId?: number
  endPositionName?: string
  belt: 'WHITE' | 'BLUE' | 'PURPLE' | 'BROWN' | 'BLACK'
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
  startPositionId: number
  endPositionId?: number
  belt: Technique['belt']
  modality: Technique['modality']
  visibility: Technique['visibility']
  description?: string
  youtubeUrl?: string
}
