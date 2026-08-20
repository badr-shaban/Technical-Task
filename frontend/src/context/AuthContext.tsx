/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { LoginPayload, RegisterPayload, User } from '@/types/auth'
import { clearSession, getAuthToken, USER_STORAGE_KEY, ApiError } from '@/services/api'
import * as authService from '@/services/authService'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredUser(): User | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

function getInitialUser(): User | null {
  return getAuthToken() ? readStoredUser() : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getInitialUser)
  const [isLoading, setIsLoading] = useState(() => Boolean(getAuthToken()))

  useEffect(() => {
    const token = getAuthToken()
    if (!token) {
      return
    }

    let cancelled = false

    authService
      .getMe()
      .then((currentUser) => {
        if (!cancelled) {
          setUser(currentUser)
        }
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          clearSession()
          if (!cancelled) {
            setUser(null)
          }
          return
        }

        if (!cancelled) {
          setUser(readStoredUser())
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (payload: LoginPayload) => {
    const response = await authService.login(payload)
    setUser(response.user)
  }, [])

  const register = useCallback(async (payload: RegisterPayload) => {
    const response = await authService.register(payload)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
