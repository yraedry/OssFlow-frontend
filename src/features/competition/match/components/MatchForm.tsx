import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { createMatchSchema, type CreateMatchForm } from '../schemas'

const OUTCOME_OPTIONS = [
  { value: 'WIN',  label: 'Victoria' },
  { value: 'LOSS', label: 'Derrota' },
  { value: 'DRAW', label: 'Empate' },
]

type MatchFormProps = {
  onSubmit: (data: CreateMatchForm) => void
  isPending?: boolean
}

export function MatchForm({ onSubmit, isPending }: MatchFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateMatchForm>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      opponentName:  '',
      opponentTeam:  '',
      outcome:       '',
      method:        '',
      round:         '',
      techniqueText: '',
      notesMarkdown: '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Oponente y equipo */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="opponentName">Oponente</Label>
          <Input id="opponentName" {...register('opponentName')} placeholder="Nombre del oponente" />
          {errors.opponentName && (
            <p className="text-sm text-destructive">{errors.opponentName.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="opponentTeam">Equipo</Label>
          <Input id="opponentTeam" {...register('opponentTeam')} placeholder="Academia del oponente" />
        </div>
      </div>

      {/* Resultado y método */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="outcome">Resultado</Label>
          <select
            id="outcome"
            {...register('outcome')}
            className="flex h-9 w-full border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="">—</option>
            {OUTCOME_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {errors.outcome && (
            <p className="text-sm text-destructive">{errors.outcome.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="method">Método</Label>
          <Input id="method" {...register('method')} placeholder="Sumisión, puntos, ventaja..." />
        </div>
      </div>

      {/* Técnica y ronda */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="techniqueText">Técnica</Label>
          <Input id="techniqueText" {...register('techniqueText')} placeholder="Armbar, RNC, estrangulamiento..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="round">Ronda / fase</Label>
          <Input id="round" {...register('round')} placeholder="Semifinal, Final..." />
        </div>
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <Label htmlFor="notesMarkdown">Notas</Label>
        <Textarea
          id="notesMarkdown"
          {...register('notesMarkdown')}
          placeholder="Observaciones del match..."
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-50"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}
      >
        {isPending ? 'Guardando...' : 'Añadir match'}
      </button>
    </form>
  )
}
