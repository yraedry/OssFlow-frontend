import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useForgotPassword } from '../hooks'

const schema = z.object({
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword()
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => setSubmitted(true),
      onError: () => setSubmitted(true), // Anti-enumeración: siempre mostrar mensaje positivo
    })
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="text-5xl mb-4">✉️</div>
          <h2 className="text-2xl font-bold text-white mb-3">Revisa tu email</h2>
          <p className="text-gray-400 mb-6">
            Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña en
            los próximos minutos.
          </p>
          <Link
            to="/login"
            className="inline-block text-violet-400 hover:text-violet-300 font-medium transition-colors"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/landing" className="inline-block">
            <span className="text-3xl font-black text-white tracking-tight">
              Oss<span className="text-violet-500">Flow</span>
            </span>
          </a>
          <p className="text-gray-400 mt-2 text-sm">Recupera tu contraseña</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          <p className="text-gray-400 text-sm mb-6">
            Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || forgotPasswordMutation.isPending}
              className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {forgotPasswordMutation.isPending ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
