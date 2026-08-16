import { useEffect } from 'react'

import { authApi } from '@/lib/api/auth'
import { refreshAccessToken } from '@/lib/api/client'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Runs once on app load. Exchanges the HttpOnly refresh cookie (if any) for
 * a fresh access token and rehydrates the current user, so a page reload
 * doesn't bounce an already-logged-in user back to /login.
 */
export function useAuthBootstrap() {
  const setSession = useAuthStore((state) => state.setSession)
  const finishBootstrap = useAuthStore((state) => state.finishBootstrap)
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      try {
        await refreshAccessToken()
        const user = await authApi.me()
        if (!cancelled) setSession(user, useAuthStore.getState().accessToken!)
      } catch {
        // No valid refresh cookie — user is simply logged out.
      } finally {
        if (!cancelled) finishBootstrap()
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [])

  return isBootstrapping
}
