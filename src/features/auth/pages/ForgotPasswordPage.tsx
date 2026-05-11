import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useForgotPassword } from '../hooks'
import { AuthLayout, AuthCard, AuthField, AuthLink } from '../components/AuthLayout'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'

const MONO = { fontFamily: 'var(--font-mono)' } as const

const schema = z.object({
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const forgotPasswordMutation = useForgotPassword()
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => setSubmitted(true),
      onError: () => setSubmitted(true),
    })
  }

  if (submitted) {
    return (
      <AuthLayout title="Revisa tu email" subtitle="Enlace enviado">
        <AuthCard>
          <p className="text-sm text-muted-foreground text-center" style={MONO}>
            Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
          </p>
          <AuthLink to="/login">Volver al inicio de sesión</AuthLink>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Te enviamos un enlace">
      <AuthCard>
        <p className="text-sm text-muted-foreground text-center" style={MONO}>
          Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <AuthField label="Email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" placeholder="tu@email.com" {...register('email')} />
          </AuthField>
          <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
            {forgotPasswordMutation.isPending ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </Button>
        </form>
        <p className="text-center">
          <AuthLink to="/login">Volver al inicio de sesión</AuthLink>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
