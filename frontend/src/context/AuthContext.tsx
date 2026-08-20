/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { LoginPayload, RegisterPayload, User } from '@/types/auth'
import { ApiError, clearSession, getAuthToken, USER_STORAGE_KEY } from '@/services/api'
import * as authService from '@/services/authService'
import { authKeys, taskKeys } from '@/lib/queryKeys'

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

async function fetchCurrentUser(): Promise<User> {
  try {
    return await authService.getMe()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSession()
    }
    throw error
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const hasToken = Boolean(getAuthToken())
  const storedUser = useMemo(
    () => (hasToken ? readStoredUser() ?? undefined : undefined),
    [hasToken],
  )

  const meQuery = useQuery({
    queryKey: authKeys.me,
    queryFn: fetchCurrentUser,
    enabled: hasToken,
    initialData: storedUser,
    staleTime: 0,
    retry: false,
  })

  const user =
    meQuery.error instanceof ApiError && meQuery.error.status === 401
      ? null
      : (meQuery.data ?? null)

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await authService.login(payload)
      queryClient.setQueryData(authKeys.me, response.user)
    },
    [queryClient],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await authService.register(payload)
      queryClient.setQueryData(authKeys.me, response.user)
    },
    [queryClient],
  )

  const logout = useCallback(async () => {
    await authService.logout()
    queryClient.removeQueries({ queryKey: authKeys.all })
    queryClient.removeQueries({ queryKey: taskKeys.all })
  }, [queryClient])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading: meQuery.isLoading && hasToken,
      login,
      register,
      logout,
    }),
    [user, meQuery.isLoading, hasToken, login, register, logout],
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
