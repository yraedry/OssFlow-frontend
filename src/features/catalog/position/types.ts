export interface Position {
  id: number
  name: string
  type: 'TOP' | 'BOTTOM' | 'NEUTRAL'
  visibility: 'PUBLIC' | 'PRIVATE'
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePositionRequest {
  name: string
  type: Position['type']
  visibility: Position['visibility']
  description?: string
}
