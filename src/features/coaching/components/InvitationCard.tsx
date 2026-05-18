import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Copy, RotateCw, X, Plus } from 'lucide-react'
import { useState } from 'react'
import { Spinner } from '@/shared/components/ui/spinner'
import { useActiveInvitation, useGenerateInvitation, useRevokeInvitation } from '../hooks'
import { useConfirm } from '@/shared/hooks/useConfirm'

function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
  } else {
    fallbackCopy(text)
  }
}

function fallbackCopy(text: string) {
  const el = document.createElement('textarea')
  el.value = text
  el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
  document.body.appendChild(el)
  el.focus()
  el.select()
  try { document.execCommand('copy') } catch { void 0 }
  document.body.removeChild(el)
}

export function InvitationCard() {
  const { data: invitation, isLoading } = useActiveInvitation()
  const generate = useGenerateInvitation()
  const revoke = useRevokeInvitation()
  const confirm = useConfirm()
  const [copied, setCopied] = useState(false)

  function handleCopy(code: string) {
    copyToClipboard(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleRevoke() {
    const ok = await confirm({
      title: 'Revocar código',
      description: 'El código quedará inválido y nadie más podrá usarlo para vincularse. ¿Continuar?',
      confirmLabel: 'Revocar',
      cancelLabel: 'Cancelar',
      variant: 'destructive',
    })
    if (ok) revoke.mutate()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="flex items-center justify-between gap-4 py-1">
        <p className="text-xs text-muted-foreground font-mono">
          Sin código activo
        </p>
        <button
          type="button"
          onClick={() => generate.mutate()}
          disabled={generate.isPending}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-[10px] font-mono uppercase tracking-widest hover:bg-foreground/85 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {generate.isPending ? <Spinner /> : <Plus className="h-3 w-3" strokeWidth={2} />}
          {generate.isPending ? 'Generando...' : 'Generar código'}
        </button>
      </div>
    )
  }

  const expiresIn = formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true, locale: es })

  return (
    <div className="space-y-3">
      {/* Code display */}
      <div className="flex items-center justify-between gap-3 bg-muted/30 border border-border px-4 py-3">
        <span className="text-sm font-bold tracking-[0.35em] text-foreground select-all font-mono tabular-nums uppercase">
          {invitation.code}
        </span>
        <button
          type="button"
          onClick={() => handleCopy(invitation.code)}
          className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest border transition-all cursor-pointer ${
            copied
              ? 'bg-foreground text-background border-foreground'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/50'
          }`}
          aria-label="Copiar código"
        >
          <Copy className="h-3 w-3" strokeWidth={2} />
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>

      {/* Meta + actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-[10px] text-muted-foreground font-mono">
          Expira {expiresIn}
          {invitation.usedCount > 0 && (
            <span className="ml-2">· {invitation.usedCount} uso{invitation.usedCount !== 1 ? 's' : ''}</span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => generate.mutate()}
            disabled={generate.isPending || revoke.isPending}
            title="Generar nuevo código"
            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase tracking-widest border border-border text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors disabled:opacity-40 cursor-pointer"
          >
            {generate.isPending ? <Spinner /> : <RotateCw className="h-3 w-3" strokeWidth={2} />}
            Nuevo
          </button>
          <button
            type="button"
            onClick={handleRevoke}
            disabled={revoke.isPending || generate.isPending}
            title="Revocar código"
            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono uppercase tracking-widest border border-destructive/40 text-destructive/70 hover:text-destructive hover:border-destructive transition-colors disabled:opacity-40 cursor-pointer"
          >
            {revoke.isPending ? <Spinner /> : <X className="h-3 w-3" strokeWidth={2} />}
            Revocar
          </button>
        </div>
      </div>
    </div>
  )
}
