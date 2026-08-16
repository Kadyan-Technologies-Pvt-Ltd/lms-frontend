import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { useAuthStore } from '@/stores/auth-store'
import type { RefreshResponse } from '@/types/auth'

// Relative by default, which is what the dev server (and any same-origin
// deployment) wants — Vite proxies /api to the backend. When the frontend is
// hosted separately from the API, set VITE_API_BASE_URL at build time to the
// API's absolute base, e.g. https://api.example.com/api/v1. withCredentials
// below is what carries the HttpOnly refresh cookie in either arrangement,
// but cross-origin it additionally requires the cookie to be issued with
// SameSite=None; Secure (see AUTH_COOKIE_SAMESITE in the backend .env).
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let refreshPromise: Promise<string> | null = null

/**
 * Exchanges the HttpOnly refresh cookie for a new access token. No body needed.
 *
 * Deduped here (not just by the interceptor below) because the backend
 * rotates *and blacklists* the refresh token on every use — two calls in
 * flight at once race for the same single-use cookie, and the loser gets
 * rejected and logged out. That's not just theoretical: React 18
 * StrictMode double-invokes effects in dev, so useAuthBootstrap's
 * mount-time call fired this exact race on every page load, occasionally
 * bouncing a just-logged-in user straight back to /login. Guarding inside
 * this function (rather than only where the interceptor calls it) covers
 * every caller, including bootstrap's direct call.
 */
export async function refreshAccessToken(): Promise<string> {
  if (refreshPromise) return refreshPromise

  const { setAccessToken, logout } = useAuthStore.getState()

  refreshPromise = (async () => {
    try {
      // Deliberately a bare axios call, not apiClient — going through the
      // instance would re-enter the 401 interceptor below and recurse. It
      // still has to resolve against the same base as apiClient, though:
      // hardcoding "/api/v1/..." here sent the refresh to the frontend's own
      // origin once the API moved to a separate host, so every session
      // silently died on reload.
      const { data } = await axios.post<RefreshResponse>(
        `${apiClient.defaults.baseURL}/auth/refresh/`,
        null,
        { withCredentials: true },
      )
      setAccessToken(data.access)
      return data.access
    } catch (error) {
      logout()
      throw error
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh/')

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true
      try {
        const newAccessToken = await refreshAccessToken()
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)
