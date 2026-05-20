import { useEffect } from 'react'
import { ReceivedNoteList } from '@/features/coaching/notes/ReceivedNoteList'
import { useReceivedNotes, useMarkNoteRead } from '@/features/coaching/hooks'

export function MaestroNotasPage() {
  const { data: notes } = useReceivedNotes()
  const markRead = useMarkNoteRead()

  useEffect(() => {
    if (!notes) return
    notes.filter(n => !n.read).forEach(n => markRead.mutate(n.id))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes?.length])

  return <ReceivedNoteList />
}
