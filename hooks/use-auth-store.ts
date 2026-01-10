import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface User {
  id: number
  email: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  company?: string
  avatar?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
  role?: string
  isActive?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  setToken: (token: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (user: User, token: string) => void
  logout: () => void
  clearError: () => void
  initAuth: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,

      // Actions
      setUser: (user: User) => {
        set({ user, isAuthenticated: true })
      },

      setToken: (token: string) => {
        set({ token })
        // Token đã được backend set trong httpOnly cookie, không cần set lại
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      login: (user: User, token: string) => {
        console.log('🔐 Login action called with user:', user, 'token:', token)
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          error: null
        })
        console.log('✅ Auth state updated in store')
        // Token đã được backend set trong httpOnly cookie, không cần set lại từ frontend
      },

      logout: () => {
        console.log('🔓 Logout action called')
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          error: null,
          isLoading: false
        })
        // Backend httpOnly cookie sẽ được xóa bởi API call logout
        // Chỉ cần xóa các cookie/storage từ frontend
        Cookies.remove('access_token') // Cleanup nếu có
        Cookies.remove('auth-token') // Cleanup legacy
      },

      clearError: () => {
        set({ error: null })
      },

      initAuth: () => {
        // Backend đã set httpOnly cookie, frontend chỉ cần check xem có user data trong localStorage không
        // Token sẽ được backend validate qua cookie khi gọi API
        const storedState = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null
        if (storedState) {
          try {
            const parsed = JSON.parse(storedState)
            if (parsed.state?.user && parsed.state?.isAuthenticated) {
              // Set một token placeholder vì token thật nằm trong httpOnly cookie
              set({ 
                user: parsed.state.user,
                isAuthenticated: parsed.state.isAuthenticated,
                token: 'token-in-httponly-cookie'
              })
              console.log('✅ Auth state restored from localStorage')
            }
          } catch (error) {
            console.error('❌ Failed to parse auth-storage:', error)
          }
        }
      }
    }),
    {
      name: 'auth-storage',
      // Chỉ persist user info, không persist token vì đã có trong cookie
      partialize: (state: any) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)

export default useAuthStore
export type { User, AuthState }
