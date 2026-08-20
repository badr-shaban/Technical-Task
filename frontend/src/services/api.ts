import axios, { isAxiosError } from 'axios'

export const TOKEN_STORAGE_KEY = 'taskflow.token'
export const USER_STORAGE_KEY = 'taskflow.user'

export class ApiError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (!isAxiosError(error)) {
      return Promise.reject(
        new ApiError('Something went wrong. Please try again.', 500),
      )
    }

    const status = error.response?.status ?? 500
    const message =
      (error.response?.data as { message?: string } | undefined)?.message ??
      error.message ??
      'Something went wrong. Please try again.'

    return Promise.reject(new ApiError(message, status))
  },
)

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function persistSession(token: string, userJson: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  localStorage.setItem(USER_STORAGE_KEY, userJson)
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Something went wrong. Please try again.'
}
