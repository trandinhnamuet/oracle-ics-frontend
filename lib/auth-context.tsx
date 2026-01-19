"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authService, type User } from "@/services/auth.service"
import useAuthStore from "@/hooks/use-auth-store"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Auto-refresh token every 14 minutes (before 15min expiration)
  useEffect(() => {
    if (!user) return

    const interval = setInterval(async () => {
      try {
        await authService.refresh()
      } catch (error) {
        console.error("Auto-refresh failed:", error)
        setUser(null)
        authService.clearAccessToken()
      }
    }, 14 * 60 * 1000) // 14 minutes

    return () => clearInterval(interval)
  }, [user])

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
        // Sync to Zustand store
        if (currentUser) {
          useAuthStore.setState({
            user: currentUser,
            isAuthenticated: true,
            isLoading: false,
            token: 'from-httponly-cookie'
          })
          console.log('✅ User synced to store:', currentUser)
        }
      } catch (error) {
        setUser(null)
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        })
        console.warn('❌ Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      setUser(response.user)
      // Sync to Zustand store
      useAuthStore.setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        token: 'from-httponly-cookie'
      })
      console.log('✅ Login synced to store:', response.user)
      // Redirect to homepage after successful login
      router.push("/")
    } catch (error) {
      throw error
    }
  }, [router])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      setUser(null)
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
      router.push("/")
    }
  }, [router])

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll()
    } finally {
      setUser(null)
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
      router.push("/")
    }
  }, [router])

  const refreshToken = useCallback(async () => {
    try {
      await authService.refresh()
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
      throw error
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        logoutAll,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/login")
      }
    }, [isAuthenticated, isLoading, router])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}
