export interface Note {
  id: number
  title: string
  content: string
  visibility: 'PUBLIC' | 'PRIVATE'
  createdAt: string
  updatedAt: string
}

export interface CreateNoteRequest {
  title: string
  content: string
  visibility: Note['visibility']
}
