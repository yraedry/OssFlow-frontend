import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Badge } from '@/shared/components/ui/badge'
import { MarkdownEditor } from '@/shared/components/ui/MarkdownEditor'
import { z } from 'zod'
import { createNoteSchema } from '../schemas'
import type { Note } from '../types'

const noteFormSchema = createNoteSchema.omit({ tags: true })
type NoteFormValues = z.infer<typeof noteFormSchema>

type NoteFormProps = {
  defaultValues?: Partial<Note>
  onSubmit: (data: NoteFormValues & { tags: string[] }) => void
  isPending?: boolean
}

export function NoteForm({ defaultValues, onSubmit, isPending }: NoteFormProps) {
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [bodyMarkdown, setBodyMarkdown] = useState(defaultValues?.bodyMarkdown ?? '')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      bodyMarkdown: defaultValues?.bodyMarkdown ?? '',
    },
  })

  function handleBodyChange(v: string) {
    setBodyMarkdown(v)
    setValue('bodyMarkdown', v, { shouldValidate: true })
  }

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
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, bodyMarkdown, tags }))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" {...register('title')} placeholder="Notas sobre guardia cerrada..." />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bodyMarkdown">Contenido</Label>
        <MarkdownEditor
          value={bodyMarkdown}
          onChange={handleBodyChange}
          placeholder="# Título&#10;&#10;Escribe aquí..."
          rows={8}
        />
        {errors.bodyMarkdown && <p className="text-sm text-destructive">{errors.bodyMarkdown.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Etiquetas</Label>
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

      <button type="submit" disabled={isPending} className="w-full py-2.5 bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-50" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
        {isPending ? 'Guardando...' : defaultValues ? 'Actualizar' : 'Crear nota'}
      </button>
    </form>
  )
}
