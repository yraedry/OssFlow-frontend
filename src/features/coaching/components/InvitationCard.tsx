import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Spinner } from '@/shared/components/ui/spinner'
import { useActiveInvitation, useGenerateInvitation, useRevokeInvitation } from '../hooks'

const MONO = { fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' } as const

export function InvitationCard() {
  const { data: invitation, isLoading } = useActiveInvitation()
  const generate = useGenerateInvitation()
  const revoke = useRevokeInvitation()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  if (!invitation) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-muted-foreground text-center">
            Sin código de invitación activo. Genera uno para que tus alumnos puedan vincularse.
          </p>
          <button
            type="button"
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="px-4 py-2 bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50"
            style={{ ...MONO, textTransform: 'uppercase' }}
          >
            {generate.isPending ? 'Generando...' : 'Generar código'}
          </button>
        </CardContent>
      </Card>
    )
  }

  const expiresIn = formatDistanceToNow(new Date(invitation.expiresAt), { addSuffix: true, locale: es })

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <p className="text-xs text-muted-foreground uppercase tracking-widest" style={MONO}>
          Código de invitación
        </p>
        <p className="text-4xl font-black text-purple-400 tracking-[0.3em]" style={{ fontFamily: 'var(--font-mono)' }}>
          {invitation.code}
        </p>
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs text-muted-foreground" style={MONO}>
            Expira {expiresIn}
          </p>
          {invitation.usedCount > 0 && (
            <p className="text-xs text-muted-foreground" style={MONO}>
              Usado {invitation.usedCount} {invitation.usedCount === 1 ? 'vez' : 'veces'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
            className="px-3 py-1.5 border border-border text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
            style={{ ...MONO, textTransform: 'uppercase' }}
          >
            {generate.isPending ? 'Generando...' : 'Generar nuevo'}
          </button>
          <button
            type="button"
            onClick={() => revoke.mutate()}
            disabled={revoke.isPending}
            className="px-3 py-1.5 border border-destructive text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
            style={{ ...MONO, textTransform: 'uppercase' }}
          >
            {revoke.isPending ? 'Revocando...' : 'Revocar'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
