import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { useAuthBootstrap } from '@/hooks/use-auth-bootstrap'
import { router } from '@/router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // Default staleTime is 0, meaning every component mount (e.g.
      // navigating back to a page you were just on) triggers a background
      // refetch even for data fetched seconds ago. 30s keeps things fresh
      // enough for an admin panel without refetching on every remount.
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
})

function AppContent() {
  const isBootstrapping = useAuthBootstrap()

  if (isBootstrapping) {
    return <div className="flex min-h-screen items-center justify-center bg-background" />
  }

  return <RouterProvider router={router} />
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App
