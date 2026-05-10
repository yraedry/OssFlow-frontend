import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import { createMatchSchema, type CreateMatchForm } from '../schemas'

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
      opponentName: '',
      opponentBelt: '',
      result: 'WIN',
      technique: '',
      notes: '',
      orderIndex: 0,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="opponentName">Oponente</Label>
        <Input
          id="opponentName"
          {...register('opponentName')}
          placeholder="Nombre del oponente"
        />
        {errors.opponentName && (
          <p className="text-sm text-destructive">{errors.opponentName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="opponentBelt">Cinturón del oponente</Label>
          <Input id="opponentBelt" {...register('opponentBelt')} placeholder="Azul, Morado..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="result">Resultado</Label>
          <select
            id="result"
            {...register('result')}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="WIN">Victoria</option>
            <option value="LOSS">Derrota</option>
            <option value="DRAW">Empate</option>
          </select>
          {errors.result && (
            <p className="text-sm text-destructive">{errors.result.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="technique">Técnica de finalización</Label>
          <Input id="technique" {...register('technique')} placeholder="Armbar, RNC..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duración (segundos)</Label>
          <Input
            id="duration"
            type="number"
            min={0}
            {...register('duration', { valueAsNumber: true })}
            placeholder="180"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Observaciones del match..."
          rows={3}
        />
      </div>

      <button type="submit" disabled={isPending} className="w-full py-2.5 bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-50" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
        {isPending ? 'Guardando...' : 'Añadir match'}
      </button>
    </form>
  )
}
