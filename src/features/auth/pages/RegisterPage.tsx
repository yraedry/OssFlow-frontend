import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useRegister } from '../hooks'
import { GoogleLoginButton } from '../components/GoogleLoginButton'
import { AuthLayout, AuthCard, AuthField, AuthDivider } from '../components/AuthLayout'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { MONO } from '@/shared/lib/typography'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const registerMutation = useRegister()
  const [registered, setRegistered] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    // displayName se establece en onboarding tras login (A6 plan).
    registerMutation.mutate(
      { email: data.email, password: data.password },
      { onSuccess: () => setRegistered(true) },
    )
  }

  if (registered) {
    return (
      <AuthLayout title="Verifica tu email" subtitle="Último paso">
        <AuthCard>
          <p className="text-sm text-muted-foreground text-center" style={MONO}>
            Te hemos enviado un enlace de verificación. Revisa tu bandeja de entrada y haz clic en el enlace antes de iniciar sesión.
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full">Volver al inicio de sesión</Button>
          </Link>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Empieza gratis">
      <AuthCard>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <AuthField label="Email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" placeholder="tu@email.com" {...register('email')} />
          </AuthField>
          <AuthField label="Contraseña" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="new-password" placeholder="Mín. 8 chars, 1 mayúscula, 1 número" {...register('password')} />
          </AuthField>
          <AuthField label="Confirmar contraseña" error={errors.confirmPassword?.message}>
            <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Repite tu contraseña" {...register('confirmPassword')} />
          </AuthField>
          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <AuthDivider label="o regístrate con" />
        <GoogleLoginButton />

        <p className="text-center text-xs text-muted-foreground" style={MONO}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors">
            Iniciar sesión
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
