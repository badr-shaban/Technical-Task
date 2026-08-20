import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/auth'
import { api, clearSession, persistSession, USER_STORAGE_KEY, type ApiResponse } from '@/services/api'

function storeSession(response: AuthResponse): AuthResponse {
  persistSession(response.token, JSON.stringify(response.user))
  return response
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/login', payload)
  return storeSession(data.data)
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<ApiResponse<AuthResponse>>('/auth/register', payload)
  return storeSession(data.data)
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<ApiResponse<User>>('/auth/me')
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.data))
  return data.data
}

export async function logout(): Promise<void> {
  clearSession()
}
