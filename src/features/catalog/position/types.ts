export interface Position {
  id: number
  name: string
  type: 'TOP' | 'BOTTOM' | 'STANDING' | 'GROUND_NEUTRAL' | 'SUBMITTED'
  visibility: 'PUBLIC' | 'PRIVATE'
  description?: string
  youtubeUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePositionRequest {
  name: string
  type: Position['type']
  visibility?: Position['visibility']
  description?: string
  youtubeUrl?: string
}
