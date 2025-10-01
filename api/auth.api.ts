import axios from 'axios'
import Cookies from 'js-cookie'
import { User } from '@/hooks/use-auth-store'

// Cấu hình base URL cho API backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

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
    const token = Cookies.get('auth-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor để xử lý response và redirect khi token hết hạn
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      Cookies.remove('auth-token')
      // Có thể redirect về trang login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
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

export interface LoginResponse {
  user: User
  access_token: string
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
      // Mock response for development testing
      if (process.env.NODE_ENV === 'development' && data.email === 'test@gmail.com' && data.password === '123123') {
        console.log('Using mock login response for development')
        return {
          user: {
            id: 'mock-user-id',
            email: 'test@gmail.com',
            firstName: 'Test',
            lastName: 'User',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          access_token: 'mock-jwt-token-for-dev'
        }
      }
      
      const response = await api.post<LoginResponse>('/auth/login', data)
      return response.data
    } catch (error: any) {
      console.error('Login API error:', error)
      
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra lại kết nối mạng.')
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Đăng nhập thất bại')
    }
  },

  // Đăng ký
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    try {
      const response = await api.post<LoginResponse>('/auth/register', data)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Đăng ký thất bại')
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
      Cookies.remove('auth-token')
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

  // Quên mật khẩu
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/forgot-password', {
        email
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể gửi email reset mật khẩu')
    }
  },

  // Reset mật khẩu
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', {
        token,
        password: newPassword
      })
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Không thể reset mật khẩu')
    }
  }
}

export default api