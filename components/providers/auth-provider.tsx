'use client'

import { useEffect, ReactNode } from 'react'
import useAuthStore from '@/hooks/use-auth-store'
import { useTokenRefresh } from '@/hooks/use-token-refresh'
import { authApi } from '@/api/auth.api'
import { useToast } from '@/hooks/use-toast'
import { isTokenExpired } from '@/lib/token-expiry'
import { AuthDebugPanel } from '@/components/auth/auth-debug-panel'
import '@/lib/cookie-migration' // Auto-run cookie migration

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token, user, login, logout, initAuth, setLoading } = useAuthStore()
  const { toast } = useToast()
  
  // Sử dụng hook tự động refresh token
  useTokenRefresh()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Initialize auth (load token from cookie)
        initAuth()
      } catch (error) {
        console.error('❌ Auth initialization failed:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [initAuth, setLoading])

  // Separate effect để fetch user data khi cần
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Nếu đã có user data, không cần fetch lại
        if (user) {
          console.log('✅ User data already available, skip fetching')
          return
        }
        
        // Chỉ fetch nếu không có user nhưng có token (tức là sau khi reload)
        // Không fetch ngay sau login vì user đã có từ login response
        if (token === 'token-in-httponly-cookie' && !user) {
          try {
            console.log('📥 Fetching user data to verify session...')
            const userData = await authApi.getCurrentUser()
            login(userData, token)
            console.log('✅ User data loaded and verified successfully')
          } catch (error: any) {
            console.error('❌ Failed to fetch user data:', error)
            // Nếu 401, backend cookie không hợp lệ -> logout
            if (error.response?.status === 401) {
              console.log('🔴 Session không hợp lệ (401), đang logout...')
              logout()
              
              if (toast) {
                toast({
                  title: 'Phiên đăng nhập hết hạn',
                  description: 'Vui lòng đăng nhập lại',
                  variant: 'destructive',
                  duration: 5000,
                })
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ User data fetch failed:', error)
      }
    }

    // Chỉ fetch khi không có user
    if (!user && token) {
      fetchUserData()
    }
  }, [token, user, login, logout, toast])

  return (
    <>
      {children}
      <AuthDebugPanel />
    </>
  )
}

export default AuthProvider