import { useState } from 'react'
import { useCreateNote } from '../hooks'
import { TechniqueFamilyPicker } from '../components/TechniqueFamilyPicker'
import { Spinner } from '@/shared/components/ui/spinner'
import { MarkdownEditor } from '@/shared/components/ui/MarkdownEditor'

type Props = { athleteId: number }

export function CoachNoteForm({ athleteId }: Props) {
  const [body, setBody] = useState('')
  const [family, setFamily] = useState('')
  const create = useCreateNote()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    create.mutate(
      { athleteId, body: body.trim(), techniqueFamily: family || undefined },
      { onSuccess: () => { setBody(''); setFamily('') } },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-4">
      <MarkdownEditor
        value={body}
        onChange={setBody}
        placeholder="Escribe una nota para el atleta..."
        rows={4}
        disabled={create.isPending}
      />
      <TechniqueFamilyPicker
        value={family}
        onChange={setFamily}
        disabled={create.isPending}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!body.trim() || create.isPending}
          className="px-4 py-1.5 text-xs bg-foreground text-background font-mono uppercase tracking-wide disabled:opacity-40 transition-opacity flex items-center gap-2"
        >
          {create.isPending ? <Spinner /> : null}
          Enviar nota
        </button>
      </div>
    </form>
  )
}
