import axios from 'axios'
import Cookies from 'js-cookie'
import { User } from '@/hooks/use-auth-store'

// Cấu hình base URL cho API backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

// Function để clear auth khi 401 xảy ra
const handleUnauthorized = () => {
  console.log('🔴 Unauthorized (401), clearing auth...')
  Cookies.remove('access_token')
  Cookies.remove('auth-token')
  if (typeof window !== 'undefined') {
    // Clear Zustand persisted state
    localStorage.removeItem('auth-storage')
    // Redirect về login
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }
}

// Tạo axios instance với config mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Để gửi cookies
})

// Interceptor để tự động thêm auth token vào mọi request
api.interceptors.request.use(
  (config) => {
    // Backend sẽ tự động đọc token từ httpOnly cookie
    // Không cần thêm Authorization header
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor để xử lý response và tự động gia hạn token
api.interceptors.response.use(
  (response) => {
    // Kiểm tra xem có token mới trong response headers không
    const newToken = response.headers['x-new-token']
    if (newToken) {
      Cookies.set('access_token', newToken, {
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized()
    }
    return Promise.reject(error)
  }
)

// Types cho API requests
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface RegisterResponse {
  message: string
  email: string
  requiresVerification: boolean
}

export interface VerifyOtpRequest {
  email: string
  otp: string
}

export interface VerifyOtpResponse {
  message: string
  success: boolean
}

export interface ResendOtpRequest {
  email: string
}

export interface ResendOtpResponse {
  message: string
  success: boolean
}

export interface LoginResponse {
  user: User
  access_token?: string // Optional vì backend set httpOnly cookie thay vì return trong body
}

export interface ApiError {
  message: string
  statusCode?: number
  error?: string
}

// Auth API functions
export const authApi = {
  // Đăng nhập
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      // Backend response chỉ return { user }, token đã được set trong httpOnly cookie
      const response = await api.post<{ user: User }>('/auth/login', data)
      
      // Return với access_token giả để giữ compatibility với code cũ
      // Token thật nằm trong httpOnly cookie
      return {
        user: response.data.user,
        access_token: 'token-in-httponly-cookie'
      }
    } catch (error: any) {
      console.error('Login API error:', error)
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng.')
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Đăng nhập thất bại')
    }
  },

  // Đăng ký
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await api.post<RegisterResponse>('/auth/register', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại')
    }
  },

  // Verify OTP
  verifyOtp: async (data: VerifyOtpRequest): Promise<VerifyOtpResponse> => {
    try {
      const response = await api.post<VerifyOtpResponse>('/auth/verify-otp', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Xác thực OTP thất bại')
    }
  },

  // Resend OTP
  resendOtp: async (data: ResendOtpRequest): Promise<ResendOtpResponse> => {
    try {
      const response = await api.post<ResendOtpResponse>('/auth/resend-otp', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Gửi lại OTP thất bại')
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<User>('/auth/profile')
      console.log('------------------------------------------------------------------');
      console.log('Current user data:', response.data);
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể lấy thông tin người dùng')
    }
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } catch (error: any) {
      // Vẫn xóa token local dù API call thất bại
      console.error('Logout API failed:', error)
    } finally {
      Cookies.remove('access_token')
      Cookies.remove('auth-token') // cleanup legacy cookie
    }
  },

  // Refresh token (nếu backend hỗ trợ)
  refreshToken: async (): Promise<{ access_token: string }> => {
    try {
      const response = await api.post<{ access_token: string }>('/auth/refresh')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể làm mới token')
    }
  },

  // Đăng nhập bằng Google (sẽ implement sau)
  googleLogin: async (googleToken: string): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/google', {
        token: googleToken
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng nhập Google thất bại')
    }
  },

  // Quên mật khẩu - Gửi OTP
  forgotPassword: async (email: string): Promise<{ message: string; email: string; success: boolean }> => {
    try {
      const response = await api.post<{ message: string; email: string; success: boolean }>('/auth/forgot-password', {
        email
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể gửi email reset mật khẩu')
    }
  },

  // Xác thực OTP đặt lại mật khẩu
  verifyResetOtp: async (email: string, otp: string): Promise<{ message: string; success: boolean }> => {
    try {
      const response = await api.post<{ message: string; success: boolean }>('/auth/verify-reset-otp', {
        email,
        otp
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Xác thực OTP thất bại')
    }
  },

  // Reset mật khẩu với OTP
  resetPassword: async (email: string, otp: string, newPassword: string): Promise<{ message: string; success: boolean }> => {
    try {
      const response = await api.post<{ message: string; success: boolean }>('/auth/reset-password', {
        email,
        otp,
        newPassword
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể reset mật khẩu')
    }
  }
}

export default api