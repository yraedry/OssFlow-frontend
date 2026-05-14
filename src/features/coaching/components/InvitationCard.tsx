import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Copy, RefreshCw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Spinner } from '@/shared/components/ui/spinner'
import { useActiveInvitation, useGenerateInvitation, useRevokeInvitation } from '../hooks'

const MONO = { fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' } as const

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {})
}

export function InvitationCard() {
  const { data: invitation, isLoading } = useActiveInvitation()
  const generate = useGenerateInvitation()
  const revoke = useRevokeInvitation()
  const [copied, setCopied] = useState(false)

  function handleCopy(code: string) {
    copyToClipboard(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Spinner />
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground" style={MONO}>
          Sin código activo. Genera uno para que tus alumnos puedan vincularse contigo.
        </p>
        <button
          type="button"
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-xs font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-50"
          style={{ ...MONO, textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          {generate.isPending ? <Spinner /> : null}
          {generate.isPending ? 'Generando...' : 'Generar código'}
        </button>
      </div>
    )
  }

  const expiresIn = formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true, locale: es })

  return (
    <div className="border border-border/60">
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        <span
          className="text-3xl font-black tracking-[0.25em] text-foreground select-all"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {invitation.code}
        </span>
        <button
          type="button"
          onClick={() => handleCopy(invitation.code)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
          style={{ ...MONO, textTransform: 'uppercase' }}
          aria-label="Copiar código"
        >
          <Copy className="h-3 w-3" strokeWidth={2} />
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <div className="px-4 py-2 border-t border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground" style={MONO}>
          <span>Expira {expiresIn}</span>
          {invitation.usedCount > 0 && (
            <>
              <span className="text-border">·</span>
              <span>{invitation.usedCount} uso{invitation.usedCount !== 1 ? 's' : ''}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            style={{ ...MONO, textTransform: 'uppercase' }}
            title="Generar nuevo código"
          >
            <RefreshCw className="h-3 w-3" strokeWidth={2} />
            Nuevo
          </button>
          <span className="text-border text-xs">·</span>
          <button
            type="button"
            onClick={() => revoke.mutate()}
            disabled={revoke.isPending}
            className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors disabled:opacity-40"
            style={{ ...MONO, textTransform: 'uppercase' }}
            title="Revocar código"
          >
            <Trash2 className="h-3 w-3" strokeWidth={2} />
            Revocar
          </button>
        </div>
      </div>
    </div>
  )
}
