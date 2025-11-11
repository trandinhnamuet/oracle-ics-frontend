import { useEffect } from 'react'
import { authApi } from '@/api/auth.api'
import useAuthStore from './use-auth-store'
import { isTokenExpired, getTokenTimeRemaining, getTokenTimeRemainingFormatted, isTokenExpiringSoon } from '@/lib/token-expiry'

// Hook để tự động gia hạn token trước khi hết hạn
export function useTokenRefresh() {
  const { token, login, logout } = useAuthStore()

  useEffect(() => {
    if (!token) return

    // Kiểm tra token có sắp hết hạn không
    const checkTokenExpiry = () => {
      try {
        // Kiểm tra token đã hết hạn chưa
        if (isTokenExpired(token)) {
          console.log('🔴 Token đã hết hạn, đang logout...')
          logout()
          return
        }

        // Kiểm tra token sắp hết hạn không (< 5 phút)
        if (isTokenExpiringSoon(token, 5 * 60 * 1000)) {
          const remaining = getTokenTimeRemainingFormatted(token)
          console.log(`⚠️ Token sắp hết hạn (còn ${remaining}), đang thử refresh...`)
          refreshTokenIfNeeded()
        } else {
          const remaining = getTokenTimeRemaining(token)
          console.log(`✅ Token còn hạn (${getTokenTimeRemainingFormatted(token)})`)
        }
      } catch (error) {
        console.error('❌ Lỗi khi kiểm tra token expiry:', error)
        logout()
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
          console.log('✅ Token đã được refresh thành công')
        }
      } catch (error) {
        console.error('❌ Không thể refresh token:', error)
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