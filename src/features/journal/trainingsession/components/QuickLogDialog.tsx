import { useState } from 'react'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { useCreateTrainingSession } from '../hooks'
import type { Intensity, SessionType } from '../types'

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' }
const LABEL: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: '9px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: 'var(--color-muted-foreground)',
}

const INPUT_CLASS =
  'w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground transition-colors'

const INTENSITIES: { value: Intensity; label: string }[] = [
  { value: 'LIGHT', label: 'Baja' },
  { value: 'MODERATE', label: 'Moderada' },
  { value: 'HARD', label: 'Alta' },
  { value: 'COMPETITION', label: 'Competición' },
]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickLogDialog({ open, onOpenChange }: Props) {
  const qc = useQueryClient()
  const createSession = useCreateTrainingSession()

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const [sessionDate, setSessionDate] = useState(todayStr)
  const [durationMinutes, setDurationMinutes] = useState(90)
  const [intensity, setIntensity] = useState<Intensity>('MODERATE')
  const [sessionType] = useState<SessionType>('BJJ')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createSession.mutate(
      {
        sessionDate,
        durationMinutes,
        intensity,
        sessionType,
        notesMarkdown: notes || undefined,
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: ['weekly-stats'] })
          onOpenChange(false)
          // reset
          setSessionDate(todayStr)
          setDurationMinutes(90)
          setIntensity('MODERATE')
          setNotes('')
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar sesión BJJ</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Fecha */}
          <div className="space-y-1">
            <label style={LABEL}>Fecha</label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className={INPUT_CLASS}
              style={MONO}
              required
            />
          </div>

          {/* Duración */}
          <div className="space-y-1">
            <label style={LABEL}>Duración (minutos)</label>
            <input
              type="number"
              min={1}
              max={480}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className={INPUT_CLASS}
              style={MONO}
              required
            />
          </div>

          {/* Intensidad */}
          <div className="space-y-1">
            <label style={LABEL}>Intensidad</label>
            <div className="grid grid-cols-4 gap-1">
              {INTENSITIES.map((i) => (
                <button
                  key={i.value}
                  type="button"
                  onClick={() => setIntensity(i.value)}
                  className="py-1.5 border text-center transition-colors"
                  style={{
                    ...MONO,
                    fontSize: '9px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    borderColor: intensity === i.value ? 'var(--color-foreground)' : 'var(--color-border)',
                    backgroundColor: intensity === i.value ? 'var(--color-foreground)' : 'transparent',
                    color: intensity === i.value ? 'var(--color-background)' : 'var(--color-muted-foreground)',
                  }}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-1">
            <label style={LABEL}>Notas (opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Técnicas trabajadas, sparring..."
              className={INPUT_CLASS + ' resize-none'}
              style={MONO}
            />
          </div>

          <button
            type="submit"
            disabled={createSession.isPending}
            className="w-full py-2.5 bg-foreground text-background hover:opacity-85 transition-opacity disabled:opacity-50"
            style={{ ...MONO, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}
          >
            {createSession.isPending ? 'Registrando...' : 'Registrar sesión'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
