import type { AuthResponse, LoginPayload, RegisterPayload, User } from '@/types/auth'
import {
  clearSession,
  delay,
  getAuthToken,
  persistSession,
} from '@/services/api'
import { loginUser, registerUser, requireUser } from '@/services/mockStore'

function storeSession(response: AuthResponse): AuthResponse {
  persistSession(response.token, JSON.stringify(response.user))
  return response
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  await delay()
  return storeSession(loginUser(payload.email, payload.password))
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  await delay()
  return storeSession(registerUser(payload))
}

export async function getMe(): Promise<User> {
  await delay(200)
  return requireUser(getAuthToken())
}

export async function logout(): Promise<void> {
  await delay(150)
  clearSession()
}
