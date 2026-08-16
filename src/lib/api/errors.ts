import { AxiosError } from 'axios'

import type { ApiError } from '@/types/api'

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError | undefined
    if (data && !data.success) return data.error.message
  }
  return fallback
}
