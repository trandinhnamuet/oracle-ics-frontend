import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  avatar?: string
  createdAt: string
  updatedAt: string
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
        // Lưu token vào cookie
        Cookies.set('auth-token', token, { 
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      login: (user: User, token: string) => {
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          error: null
        })
        // Lưu token vào cookie
        Cookies.set('auth-token', token, { 
          expires: 7, // 7 days
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
      },

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          error: null
        })
        // Xóa token khỏi cookie
        Cookies.remove('auth-token')
      },

      clearError: () => {
        set({ error: null })
      },

      initAuth: () => {
        // Khôi phục token từ cookie khi khởi tạo app
        const token = Cookies.get('auth-token')
        if (token) {
          set({ token })
          // Token có sẵn nhưng chưa có user info
          // Sẽ được fetch ở component cao hơn
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
