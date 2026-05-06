export interface Technique {
  id: number
  name: string
  positionId: number
  visibility: 'PUBLIC' | 'PRIVATE'
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateTechniqueRequest {
  name: string
  positionId: number
  visibility: Technique['visibility']
  description?: string
}
