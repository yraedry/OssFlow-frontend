export interface Tag {
  id: number
  name: string
}

export interface Note {
  id: number
  title: string
  bodyMarkdown: string
  tags: string[]
  targetType?: string
  targetId?: number
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CreateNoteRequest {
  title: string
  bodyMarkdown: string
  tags: string[]
  targetType?: string
  targetId?: number
}
