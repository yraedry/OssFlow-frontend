import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { verifyEmail } from '../api'

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
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Verificando tu email...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-3">Email verificado</h2>
            <p className="text-gray-400 mb-6">
              Tu email ha sido verificado correctamente. Ya puedes iniciar sesión.
            </p>
            <Link
              to="/login"
              className="inline-block px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg transition-colors"
            >
              Iniciar sesión
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-3">Enlace inválido</h2>
            <p className="text-gray-400 mb-6">
              El enlace de verificación es inválido o ha expirado. Solicita uno nuevo.
            </p>
            <Link
              to="/login"
              className="inline-block text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </>
        )}

        {status === 'missing' && (
          <>
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-3">Token no encontrado</h2>
            <p className="text-gray-400 mb-6">
              Este enlace de verificación no es válido.
            </p>
            <Link
              to="/login"
              className="inline-block text-violet-400 hover:text-violet-300 font-medium transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
