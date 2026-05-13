import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/shared/lib/utils'
import { coachingApi } from '@/features/coaching/api'
import { PROFILE_KEY } from '@/features/identity/profile/hooks'
import type { AccountRole } from '@/features/identity/profile/types'

type Props = { onComplete: () => void }

const ROLES: { value: AccountRole; title: string; description: string }[] = [
  {
    value: 'ATHLETE',
    title: 'Soy atleta',
    description: 'Registro mi entrenamiento, analizo mi progreso y gestiono mi game.',
  },
  {
    value: 'ATHLETE_COACH',
    title: 'Soy maestro',
    description: 'Llevo a mis alumnos y también registro mi propio entrenamiento.',
  },
]

export function RoleSelector({ onComplete }: Props) {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<AccountRole | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (!selected) return
    setLoading(true)
    try {
      await coachingApi.changeRole(selected)
      await qc.invalidateQueries({ queryKey: PROFILE_KEY })
      onComplete()
    } catch {
      // error handling via toast from api layer
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-black" style={{ fontFamily: 'var(--font-serif)' }}>
          ¿Cuál es tu rol?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Puedes cambiarlo más adelante desde configuración.
        </p>
      </div>

      <div className="grid gap-3">
        {ROLES.map(({ value, title, description }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSelected(value)}
            className={cn(
              'flex flex-col gap-1 p-4 border text-left transition-colors',
              selected === value
                ? 'border-purple-600 bg-purple-600/10'
                : 'border-border bg-card hover:border-foreground/40',
            )}
          >
            <span className="font-semibold text-sm">{title}</span>
            <span className="text-xs text-muted-foreground">{description}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleConfirm}
        disabled={!selected || loading}
        className={cn(
          'px-6 py-2 text-sm font-semibold transition-colors',
          'bg-purple-600 text-white hover:bg-purple-700',
          'disabled:opacity-40 disabled:cursor-not-allowed',
        )}
        style={{ fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
      >
        {loading ? 'Guardando...' : 'Confirmar'}
      </button>
    </div>
  )
}
