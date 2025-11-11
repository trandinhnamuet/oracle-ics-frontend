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
        
        // Check if token is expired when app loads
        if (token && isTokenExpired(token)) {
          console.log('🔴 Token đã hết hạn khi khởi động app, đang logout...')
          logout()
          
          // Show toast notification
          if (toast) {
            toast({
              title: 'Phiên đăng nhập hết hạn',
              description: 'Vui lòng đăng nhập lại',
              variant: 'destructive',
              duration: 5000,
            })
          }
          return
        }
        
        // If we have valid token but no user data, fetch user
        if (token && !isTokenExpired(token) && !user) {
          try {
            const userData = await authApi.getCurrentUser()
            login(userData, token)
            console.log('✅ User data loaded successfully')
          } catch (error) {
            console.error('❌ Failed to fetch user data:', error)
            // If token is invalid, logout
            logout()
            
            if (toast) {
              toast({
                title: 'Lỗi xác thực',
                description: 'Vui lòng đăng nhập lại',
                variant: 'destructive',
                duration: 5000,
              })
            }
          }
        }
      } catch (error) {
        console.error('❌ Auth initialization failed:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [token, user, login, logout, initAuth, setLoading, toast])

  return (
    <>
      {children}
      <AuthDebugPanel />
    </>
  )
}

export default AuthProvider