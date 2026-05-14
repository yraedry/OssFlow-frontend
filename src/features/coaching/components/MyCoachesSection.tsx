import { useState } from 'react'
import { Spinner } from '@/shared/components/ui/spinner'
import { cn } from '@/shared/lib/utils'
import { ApiClientError } from '@/shared/api/client'
import { useCoaches, useRedeemCode, useLeaveCoach } from '../hooks'

const MONO = { fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' } as const

export function MyCoachesSection() {
  const [code, setCode] = useState('')
  const [linkError, setLinkError] = useState('')
  const redeemCode = useRedeemCode()
  const leaveCoach = useLeaveCoach()
  const { data: coaches, isLoading } = useCoaches()

  async function handleRedeem() {
    setLinkError('')
    if (code.trim().length === 0) return
    redeemCode.mutate(code.trim().toUpperCase(), {
      onSuccess: () => setCode(''),
      onError: (error) => {
        if (error instanceof ApiClientError && (error.status === 400 || error.status === 404)) {
          setLinkError('Código inválido o expirado.')
        } else {
          setLinkError('Error al canjear el código. Inténtalo de nuevo.')
        }
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* Link by code */}
      <div className="space-y-2">
        <div className="flex gap-0">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().slice(0, 6))
              setLinkError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
            placeholder="CÓDIGO DE 6 CARACTERES"
            maxLength={6}
            className={cn(
              'flex-1 px-3 py-2 text-sm border-y border-l bg-background focus:outline-none focus:ring-1 focus:ring-foreground/30',
              linkError ? 'border-destructive' : 'border-border',
            )}
            style={{ ...MONO, letterSpacing: '0.15em' }}
          />
          <button
            type="button"
            onClick={handleRedeem}
            disabled={redeemCode.isPending || code.trim().length === 0}
            className="px-4 py-2 bg-foreground text-background text-xs font-bold hover:bg-foreground/90 transition-colors disabled:opacity-40 border border-foreground"
            style={{ ...MONO, textTransform: 'uppercase' }}
          >
            {redeemCode.isPending ? '...' : 'Vincular'}
          </button>
        </div>
        {linkError && (
          <p className="text-xs text-destructive" style={MONO}>{linkError}</p>
        )}
      </div>

      {/* Coaches list */}
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Spinner />
        </div>
      )}
      {!isLoading && coaches && coaches.length === 0 && (
        <p className="text-xs text-muted-foreground/60" style={MONO}>
          Aún no tienes maestros vinculados.
        </p>
      )}
      {coaches && coaches.length > 0 && (
        <div className="border border-border/60 divide-y divide-border/40">
          {coaches.map((coach) => (
            <div key={coach.coachId} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{coach.displayName}</p>
                {coach.academy && (
                  <p className="text-xs text-muted-foreground truncate" style={MONO}>{coach.academy}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => leaveCoach.mutate(coach.coachId)}
                className="shrink-0 px-3 py-1 border border-border text-xs text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                style={{ ...MONO, textTransform: 'uppercase' }}
              >
                Desvincular
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
