import { useState } from 'react'
import { Spinner } from '@/shared/components/ui/spinner'
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
    <div className="space-y-8">

      {/* Coaches list */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Spinner />
        </div>
      )}

      {!isLoading && coaches && coaches.length === 0 && (
        <div className="border border-dashed border-border px-6 py-10 text-center">
          <p className="font-serif text-base text-muted-foreground/60 italic">
            Sin maestros vinculados todavía
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 mt-2">
            Introduce el código de tu maestro abajo
          </p>
        </div>
      )}

      {coaches && coaches.length > 0 && (
        <div className="divide-y divide-border border border-border">
          {coaches.map((coach, i) => (
            <div key={coach.coachId} className="flex items-center gap-5 px-5 py-4 group">

              {/* Index + initial */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-[9px] text-muted-foreground/40 w-4 text-right">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="h-10 w-10 border border-border flex items-center justify-center bg-muted/20">
                  <span className="font-serif text-lg font-bold text-foreground/70 uppercase">
                    {coach.displayName.charAt(0)}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-serif text-[15px] font-bold text-foreground leading-tight">
                  {coach.displayName}
                </p>
                {coach.academy && (
                  <p className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground mt-0.5">
                    {coach.academy}
                  </p>
                )}
              </div>

              {/* Unlink */}
              <button
                type="button"
                onClick={() => leaveCoach.mutate(coach.coachId)}
                className="shrink-0 px-3 py-1.5 border border-border/50 font-mono text-[9px] uppercase tracking-wide text-muted-foreground/50 hover:border-destructive hover:text-destructive transition-all cursor-pointer bg-transparent"
                style={MONO}
              >
                Desvincular
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Redeem code */}
      <div className="space-y-3">
        <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
          Código de vinculación
        </p>
        <div className="flex gap-0">
          <input
            type="text"
            value={code}
            onChange={e => {
              setCode(e.target.value.toUpperCase().slice(0, 6))
              setLinkError('')
            }}
            onKeyDown={e => e.key === 'Enter' && handleRedeem()}
            placeholder="XXXXXX"
            maxLength={6}
            className={`flex-1 px-4 py-2.5 text-sm bg-background focus:outline-none border-y border-l ${
              linkError ? 'border-destructive' : 'border-border'
            }`}
            style={{ ...MONO, letterSpacing: '0.2em', fontSize: '14px' }}
          />
          <button
            type="button"
            onClick={handleRedeem}
            disabled={redeemCode.isPending || code.trim().length === 0}
            className="px-5 py-2.5 bg-foreground text-background font-mono text-[10px] uppercase tracking-wide hover:bg-foreground/85 transition-colors disabled:opacity-30 cursor-pointer border border-foreground"
          >
            {redeemCode.isPending ? <Spinner /> : 'Vincular'}
          </button>
        </div>
        {linkError && (
          <p className="font-mono text-[10px] text-destructive">{linkError}</p>
        )}
      </div>

    </div>
  )
}
