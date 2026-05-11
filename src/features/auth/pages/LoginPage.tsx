import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useSearchParams } from 'react-router-dom'
import { useLogin } from '../hooks'
import { GoogleLoginButton } from '../components/GoogleLoginButton'
import { AuthLayout, AuthCard, AuthField, AuthDivider, AuthLink } from '../components/AuthLayout'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { MONO } from '@/shared/lib/typography'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

type FormData = z.infer<typeof schema>

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_email_unverified: 'Tu cuenta de Google no tiene el email verificado.',
  oauth_account_exists: 'Ya existe una cuenta con ese email. Inicia sesión con tu contraseña primero.',
  oauth_failed: 'No pudimos completar el inicio de sesión con Google. Inténtalo de nuevo.',
}

export function LoginPage() {
  const loginMutation = useLogin()
  const [searchParams] = useSearchParams()
  const errorCode = searchParams.get('error')
  const errorMessage = errorCode ? OAUTH_ERROR_MESSAGES[errorCode] ?? null : null
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => loginMutation.mutate(data)

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Accede a tu cuenta">
      <AuthCard>
        {errorMessage && (
          <div role="alert" className="border border-destructive/30 bg-destructive/10 text-destructive text-xs px-3 py-2">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <AuthField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" placeholder="tu@email.com" {...register('email')} />
          </AuthField>
          <AuthField label="Contraseña" htmlFor="password" error={errors.password?.message}>
            <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
          </AuthField>
          <div className="flex justify-end">
            <AuthLink to="/forgot-password">¿Olvidaste tu contraseña?</AuthLink>
          </div>
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>

        <AuthDivider label="o continúa con" />
        <GoogleLoginButton />

        <p className="text-center text-xs text-muted-foreground" style={MONO}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors">
            Regístrate
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
