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
        // Lưu token vào cookie - sử dụng cùng tên với backend
        Cookies.set('access_token', token, { 
          expires: 1, // 1 day để khớp với backend JWT expiry
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        // Cleanup old cookie name nếu có
        Cookies.remove('auth-token')
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
        // Lưu token vào cookie - sử dụng cùng tên với backend
        Cookies.set('access_token', token, { 
          expires: 1, // 1 day để khớp với backend JWT expiry
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        })
        // Cleanup old cookie name nếu có
        Cookies.remove('auth-token')
      },

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          error: null
        })
        // Xóa token khỏi cookie - xóa cả 2 tên cookie để đảm bảo
        Cookies.remove('access_token')
        Cookies.remove('auth-token')
      },

      clearError: () => {
        set({ error: null })
      },

      initAuth: () => {
        // Khôi phục token từ cookie khi khởi tạo app - sử dụng tên cookie đúng
        const token = Cookies.get('access_token') || Cookies.get('auth-token') // fallback cho compatibility
        if (token) {
          set({ token })
          // Cleanup old cookie name nếu có
          if (Cookies.get('auth-token')) {
            Cookies.remove('auth-token')
          }
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
