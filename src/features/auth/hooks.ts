import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { login, logout, register, forgotPassword, resetPassword } from './api'
import { useAuthStore } from './store/authStore'
import { getProfile } from '@/features/identity/profile/api'
import { ApiClientError } from '@/shared/api/client'
import type { LoginRequest, RegisterRequest } from './types'

export function useLogin() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: async (response) => {
      setAuth(response.accessToken, response.user)
      try {
        const profile = await getProfile()
        navigate(profile ? '/' : '/onboarding', { replace: true })
      } catch {
        navigate('/', { replace: true })
      }
    },
    onError: (err: unknown) => {
      // Los errores EMAIL_NOT_VERIFIED (422) los gestiona LoginPage con mensaje inline.
      const isUnverified = err instanceof ApiClientError &&
        err.apiError?.code === 'EMAIL_NOT_VERIFIED'
      if (!isUnverified) {
        toast.error('Credenciales incorrectas. Comprueba tu email y contraseña.')
      }
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onError: (err: unknown) => {
      // Los errores 409 (email duplicado) los gestiona el componente — no toast aquí.
      const status = (err as { status?: number })?.status
      if (status !== 409) {
        toast.error('Error al crear la cuenta. Inténtalo de nuevo.')
      }
    },

  })
}

export function useLogout() {
  const { clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => logout(),
    // onSettled: limpiamos estado local incluso si el backend falla
    // para evitar sesión fantasma en cliente cuando el servidor responde error.
    onSettled: () => {
      clearAuth()
      queryClient.clear()
      navigate('/', { replace: true })
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
    onError: () => {
      toast.error('Error al enviar el email. Inténtalo de nuevo.')
    },
  })
}

export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      resetPassword(token, newPassword),
    onSuccess: () => {
      toast.success('Contraseña cambiada correctamente. Ya puedes iniciar sesión.')
      navigate('/login', { replace: true })
    },
    onError: () => {
      toast.error('El enlace de recuperación es inválido o ha expirado.')
    },
  })
}
