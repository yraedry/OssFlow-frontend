import { useState } from 'react'
import { ApiClientError } from '@/shared/api/client'
import { useRedeemCode } from '../hooks'
import { Spinner } from '@/shared/components/ui/spinner'

const MONO = { fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' } as const

export function RedeemCodeCard() {
  const [code, setCode] = useState('')
  const [linkError, setLinkError] = useState('')
  const redeemCode = useRedeemCode()

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
    <div className="space-y-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
        Vincularse a un maestro
      </p>
      <p className="text-xs text-muted-foreground" style={MONO}>
        Introduce el código de 6 dígitos que te ha dado tu maestro
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
  )
}
