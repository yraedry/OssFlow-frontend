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

// ThemeInitializer movido a index.html <head> antes del bundle (B12 plan)
// para evitar FOUC entre la entrega del HTML y la hidratación de React.

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfirmDialogProvider>
        {children}
        <Toaster richColors position="top-right" closeButton duration={4000} />
        <ReactQueryDevtools initialIsOpen={false} />
      </ConfirmDialogProvider>
    </QueryClientProvider>
  )
}
