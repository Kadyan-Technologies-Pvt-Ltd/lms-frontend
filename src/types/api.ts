export interface ApiSuccess<T> {
  success: true
  data: T
  message: string | null
  pagination?: {
    count: number
    next: string | null
    previous: string | null
  }
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details: Record<string, unknown>
  }
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError
