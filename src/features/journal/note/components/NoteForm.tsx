import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { Badge } from '@/shared/components/ui/badge'
import { createNoteSchema, type CreateNoteForm } from '../schemas'
import type { Note } from '../types'

interface NoteFormProps {
  defaultValues?: Partial<Note>
  onSubmit: (data: CreateNoteForm & { tags: string[] }) => void
  isPending?: boolean
}

export function NoteForm({ defaultValues, onSubmit, isPending }: NoteFormProps) {
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? [])
  const [tagInput, setTagInput] = useState('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, formState: { errors } } = useForm<CreateNoteForm>({
    resolver: zodResolver(createNoteSchema) as any,
    defaultValues: {
      title: defaultValues?.title ?? '',
      bodyMarkdown: defaultValues?.bodyMarkdown ?? '',
      tags: [] as string[],
    },
  })

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag))

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag() }
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, tags }))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" {...register('title')} placeholder="Notas sobre guardia cerrada..." />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bodyMarkdown">Contenido (Markdown)</Label>
        <Textarea id="bodyMarkdown" {...register('bodyMarkdown')} rows={8} placeholder="# Título&#10;&#10;Escribe aquí..." />
        {errors.bodyMarkdown && <p className="text-sm text-destructive">{errors.bodyMarkdown.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="bjj, guardia, submission..."
          />
          <Button type="button" variant="outline" onClick={addTag}>Añadir</Button>
        </div>
        {tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {tags.map((t) => (
              <Badge key={t} variant="secondary" className="gap-1 cursor-pointer" onClick={() => removeTag(t)}>
                {t} <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Crear nota'}
      </Button>
    </form>
  )
}
