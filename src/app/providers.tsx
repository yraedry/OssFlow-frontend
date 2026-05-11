import { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { ConfirmDialogProvider } from '@/shared/components/ui/confirm-dialog'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      networkMode: 'always',
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
})

function ThemeInitializer() {
  useEffect(() => {
    const stored = localStorage.getItem('ossflow-theme') ?? 'dark'
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(stored)
  }, [])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeInitializer />
      <ConfirmDialogProvider>
        {children}
        <Toaster richColors position="top-right" />
        <ReactQueryDevtools initialIsOpen={false} />
      </ConfirmDialogProvider>
    </QueryClientProvider>
  )
}
