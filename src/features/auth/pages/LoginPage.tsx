import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { useLogin } from '../hooks'
import { GoogleLoginButton } from '../components/GoogleLoginButton'
import { AuthLayout, AuthCard, AuthField, AuthDivider, AuthLink } from '../components/AuthLayout'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const loginMutation = useLogin()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => loginMutation.mutate(data)

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Accede a tu cuenta">
      <AuthCard>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <AuthField label="Email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" placeholder="tu@email.com" {...register('email')} />
          </AuthField>
          <AuthField label="Contraseña" error={errors.password?.message}>
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

        <p className="text-center text-xs text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-foreground underline underline-offset-2 hover:text-muted-foreground transition-colors">
            Regístrate
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  )
}
