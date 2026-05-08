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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
      <ConfirmDialogProvider />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
