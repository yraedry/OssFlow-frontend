import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/utils'
import { coachingApi } from '@/features/coaching/api'
import { PROFILE_KEY } from '@/features/identity/profile/hooks'
import { AuthLayout, AuthCard } from '@/features/auth/components/AuthLayout'
import { MONO, MONO_LABEL } from '@/shared/lib/typography'
import type { AccountRole } from '@/features/identity/profile/types'

type Props = { onComplete: () => void }

const ROLES: { value: AccountRole; label: string; description: string; tag: string }[] = [
  {
    value: 'ATHLETE',
    label: 'Soy atleta',
    description: 'Registro mi entrenamiento, analizo mi progreso y gestiono mi game plan.',
    tag: 'Atleta',
  },
  {
    value: 'ATHLETE_COACH',
    label: 'Soy maestro',
    description: 'Llevo a mis alumnos y también registro mi propio entrenamiento.',
    tag: 'Maestro / Coach',
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
      toast.error('No se pudo guardar el rol. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="¿Cómo usarás OssFlow?" subtitle="Puedes cambiarlo más adelante desde configuración">
      <AuthCard>
        <div className="space-y-3">
          {ROLES.map(({ value, label, description, tag }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelected(value)}
              className={cn(
                'w-full flex flex-col gap-2 p-4 border text-left transition-all duration-150',
                selected === value
                  ? 'border-foreground bg-foreground/5'
                  : 'border-border bg-transparent hover:border-foreground/40 hover:bg-foreground/[0.02]',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground text-sm font-semibold" style={MONO}>{label}</span>
                <span
                  className={cn(
                    'text-[9px] uppercase tracking-widest px-2 py-0.5 border transition-colors',
                    selected === value
                      ? 'border-foreground/50 text-foreground'
                      : 'border-border text-muted-foreground',
                  )}
                  style={MONO}
                >
                  {tag}
                </span>
              </div>
              <span className="text-xs text-muted-foreground leading-relaxed" style={MONO}>
                {description}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selected || loading}
          className={cn(
            'w-full py-3 text-xs transition-all duration-150',
            'border border-foreground bg-foreground text-background',
            'hover:bg-foreground/90',
            'disabled:opacity-30 disabled:cursor-not-allowed',
          )}
          style={{ ...MONO_LABEL }}
        >
          {loading ? 'Guardando...' : 'Confirmar rol'}
        </button>
      </AuthCard>
    </AuthLayout>
  )
}
