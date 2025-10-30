import { useEffect } from 'react'
import { authApi } from '@/api/auth.api'
import useAuthStore from './use-auth-store'

// Hook để tự động gia hạn token trước khi hết hạn
export function useTokenRefresh() {
  const { token, login, logout } = useAuthStore()

  useEffect(() => {
    if (!token) return

    // Kiểm tra token có sắp hết hạn không
    const checkTokenExpiry = () => {
      try {
        // Decode JWT token để lấy thời gian hết hạn
        const payload = token.split('.')[1]
        if (!payload) return

        const decoded = JSON.parse(atob(payload))
        const expiry = decoded.exp * 1000 // Convert to milliseconds
        const now = Date.now()
        const timeToExpiry = expiry - now

        // Nếu token sắp hết hạn trong vòng 5 phút, thử refresh
        if (timeToExpiry < 5 * 60 * 1000 && timeToExpiry > 0) {
          console.log('Token sắp hết hạn, đang thử refresh...')
          refreshTokenIfNeeded()
        }
        
        // Nếu token đã hết hạn, logout
        if (timeToExpiry <= 0) {
          console.log('Token đã hết hạn, đang logout...')
          logout()
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra token expiry:', error)
      }
    }

    // Thử refresh token
    const refreshTokenIfNeeded = async () => {
      try {
        const refreshResponse = await authApi.refreshToken()
        if (refreshResponse.access_token) {
          // Fetch user data với token mới
          const userData = await authApi.getCurrentUser()
          login(userData, refreshResponse.access_token)
          console.log('Token đã được refresh thành công')
        }
      } catch (error) {
        console.error('Không thể refresh token:', error)
        logout()
      }
    }

    // Kiểm tra ngay lập tức
    checkTokenExpiry()

    // Kiểm tra định kỳ mỗi phút
    const interval = setInterval(checkTokenExpiry, 60 * 1000)

    return () => clearInterval(interval)
  }, [token, login, logout])
}