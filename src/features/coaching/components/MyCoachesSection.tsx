import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Spinner } from '@/shared/components/ui/spinner'
import { Card, CardContent } from '@/shared/components/ui/card'
import { cn } from '@/shared/lib/utils'
import { coachingApi } from '../api'
import { useCoaches, useRedeemCode, COACHING_KEYS } from '../hooks'

const MONO = { fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' } as const

export function MyCoachesSection() {
  const [code, setCode] = useState('')
  const [linkError, setLinkError] = useState('')
  const qc = useQueryClient()
  const redeemCode = useRedeemCode()
  const { data: coaches, isLoading } = useCoaches()

  async function handleRedeem() {
    setLinkError('')
    if (code.trim().length === 0) return
    try {
      await redeemCode.mutateAsync(code.trim().toUpperCase())
      setCode('')
    } catch {
      setLinkError('Código inválido o expirado.')
    }
  }

  async function handleLeave(coachId: number) {
    try {
      await coachingApi.leaveCoach(coachId)
      qc.invalidateQueries({ queryKey: COACHING_KEYS.coaches })
    } catch {
      // error handled at api level
    }
  }

  return (
    <div className="space-y-4">
      {/* Link by code */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground" style={MONO}>
          Vincular con un maestro
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase().slice(0, 6))
              setLinkError('')
            }}
            placeholder="CÓDIGO"
            maxLength={6}
            className={cn(
              'flex-1 px-3 py-1.5 text-sm border bg-background focus:outline-none focus:ring-1 focus:ring-ring',
              linkError ? 'border-destructive' : 'border-border',
            )}
            style={MONO}
          />
          <button
            type="button"
            onClick={handleRedeem}
            disabled={redeemCode.isPending || code.trim().length === 0}
            className="px-4 py-1.5 bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            style={{ ...MONO, textTransform: 'uppercase' }}
          >
            {redeemCode.isPending ? 'Vinculando...' : 'Vincular'}
          </button>
        </div>
        {linkError && (
          <p className="text-xs text-destructive" style={MONO}>{linkError}</p>
        )}
      </div>

      {/* Coaches list */}
      <div>
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Spinner />
          </div>
        )}
        {!isLoading && coaches && coaches.length === 0 && (
          <p className="text-sm text-muted-foreground">No tienes maestros vinculados.</p>
        )}
        {coaches && coaches.length > 0 && (
          <Card>
            <CardContent className="py-0">
              <ul className="divide-y divide-border">
                {coaches.map((coach) => (
                  <li key={coach.coachId} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{coach.displayName}</p>
                      {coach.academy && (
                        <p className="text-xs text-muted-foreground truncate">{coach.academy}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleLeave(coach.coachId)}
                      className="shrink-0 px-3 py-1 border border-destructive text-destructive text-xs hover:bg-destructive/10 transition-colors"
                      style={{ ...MONO, textTransform: 'uppercase' }}
                    >
                      Desvincular
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
