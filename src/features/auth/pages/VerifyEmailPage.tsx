import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api'
import { AuthLayout, AuthCard } from '../components/AuthLayout'
import { Button } from '@/shared/components/ui/button'
import { Spinner } from '@/shared/components/ui/spinner'
import { MONO } from '@/shared/lib/typography'

type Status = 'loading' | 'success' | 'error' | 'missing'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<Status>(token ? 'loading' : 'missing')

  useEffect(() => {
    if (!token) return
    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <AuthLayout title="Verificar email">
      <AuthCard>
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-2">
            <Spinner />
            <p className="text-muted-foreground text-xs text-center" style={MONO}>Verificando tu email...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <p className="text-sm text-center" style={MONO}>
              Email verificado correctamente. Ya puedes iniciar sesión.
            </p>
            <Link to="/login">
              <Button className="w-full">Iniciar sesión</Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center" style={MONO}>
              El enlace de verificación es inválido o ha expirado.
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">Volver al inicio de sesión</Button>
            </Link>
          </div>
        )}

        {status === 'missing' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center" style={MONO}>
              Este enlace de verificación no es válido.
            </p>
            <Link to="/login">
              <Button variant="outline" className="w-full">Volver al inicio de sesión</Button>
            </Link>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  )
}
