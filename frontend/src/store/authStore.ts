import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginCredentials, SignupData } from '@/types/user.types'
import { authService } from '@/services/auth.service'

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (data: SignupData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const { user, accessToken } = await authService.login(credentials)
          localStorage.setItem('fb_access_token', accessToken)
          set({ user, accessToken, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      signup: async (data) => {
        set({ isLoading: true })
        try {
          const { user, accessToken } = await authService.signup(data)
          localStorage.setItem('fb_access_token', accessToken)
          set({ user, accessToken, isAuthenticated: true, isLoading: false })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      logout: async () => {
        try { await authService.logout() } catch { /* ignore */ }
        localStorage.removeItem('fb_access_token')
        set({ user: null, accessToken: null, isAuthenticated: false })
      },

      updateUser: (data) => {
        const current = get().user
        if (current) set({ user: { ...current, ...data } })
      },

      setToken: (token) => {
        localStorage.setItem('fb_access_token', token)
        set({ accessToken: token })
      },
    }),
    {
      name: 'fb-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
      }),
      // On rehydration: if there's no token, clear auth state
      // This prevents stale "logged in" state from a previous session
      onRehydrateStorage: () => (state) => {
        if (state && !state.accessToken) {
          state.isAuthenticated = false
          state.user = null
          state.accessToken = null
        }
      },
    }
  )
)
