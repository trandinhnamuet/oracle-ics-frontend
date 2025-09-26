'use client'

import { useEffect, ReactNode } from 'react'
import useAuthStore from '@/hooks/use-auth-store'
import { authApi } from '@/api/auth.api'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token, user, login, logout, initAuth, setLoading } = useAuthStore()

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true)
        
        // Initialize auth (load token from cookie)
        initAuth()
        
        // If we have token but no user data, fetch user
        if (token && !user) {
          try {
            const userData = await authApi.getCurrentUser()
            login(userData, token)
          } catch (error) {
            console.error('Failed to fetch user data:', error)
            // If token is invalid, logout
            logout()
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [token, user, login, logout, initAuth, setLoading])

  return <>{children}</>
}

export default AuthProvider