import { create } from 'zustand'

import type { User } from '@/types/auth'

interface AuthState {
  user: User | null
  accessToken: string | null
  /** True until the initial silent-refresh bootstrap (on app load) resolves. */
  isBootstrapping: boolean
  setSession: (user: User, accessToken: string) => void
  setAccessToken: (accessToken: string) => void
  finishBootstrap: () => void
  logout: () => void
}

// No persist middleware here on purpose: the refresh token lives in an
// HttpOnly cookie the browser manages, and the access token is kept in
// memory only so neither is reachable from JS-accessible storage. Session
// state is rehydrated on load via a silent refresh — see useAuthBootstrap.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  isBootstrapping: true,
  setSession: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  finishBootstrap: () => set({ isBootstrapping: false }),
  logout: () => set({ user: null, accessToken: null }),
}))
