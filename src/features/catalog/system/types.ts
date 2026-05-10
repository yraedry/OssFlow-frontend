export type System = {
  id: number
  name: string
  description?: string
  visibility: 'PUBLIC' | 'PRIVATE'
  flowDefinition?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export type CreateSystemRequest = {
  name: string
  description?: string
  flowDefinition: string
  visibility?: 'PUBLIC' | 'PRIVATE'
}

export type UpdateSystemRequest = {
  name?: string
  description?: string
  visibility?: 'PUBLIC' | 'PRIVATE'
  flowDefinition?: string
}
