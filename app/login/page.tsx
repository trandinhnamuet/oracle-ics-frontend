'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'

import { authApi, LoginRequest } from '@/api/auth.api'
import useAuthStore from '@/hooks/use-auth-store'

// Schema validation cho form đăng nhập
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Mật khẩu không được để trống')
    .min(process.env.NODE_ENV === 'development' ? 3 : 6, 
         `Mật khẩu phải có ít nhất ${process.env.NODE_ENV === 'development' ? 3 : 6} ký tự`),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, setLoading, setError, error, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    clearErrors
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // Validate on change
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true)
      setError(null)
      clearErrors() // Clear any previous form errors
      
      console.log('Submitting login data:', data) // Debug log
      
      const response = await authApi.login(data)
      
      // Lưu user và token vào store
      login(response.user, response.access_token)
      
      // Reset form
      reset()
      
      // Redirect về trang chủ hoặc trang trước đó
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl')
      router.push(returnUrl || '/')
      
    } catch (error: any) {
      console.error('Login error:', error) // Debug log
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Implement Google OAuth
      // Hiện tại chỉ hiển thị thông báo
      setError('Tính năng đăng nhập bằng Google sẽ được cập nhật sớm')
      
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-center">
            Nhập email và mật khẩu để truy cập tài khoản
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                Form valid: {isValid ? 'Yes' : 'No'}<br/>
                Errors: {Object.keys(errors).length}<br/>
                Test data: test@gmail.com / 123123
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                autoComplete="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
            
            {/* Test button - remove in production */}
            {process.env.NODE_ENV === 'development' && (
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  // Fill test data
                  const event = new Event('input', { bubbles: true })
                  const emailInput = document.getElementById('email') as HTMLInputElement
                  const passwordInput = document.getElementById('password') as HTMLInputElement
                  
                  if (emailInput && passwordInput) {
                    emailInput.value = 'test@gmail.com'
                    emailInput.dispatchEvent(event)
                    passwordInput.value = '123123'
                    passwordInput.dispatchEvent(event)
                  }
                }}
              >
                Fill Test Data (test@gmail.com / 123123)
              </Button>
            )}
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg
              className="mr-2 h-4 w-4"
              aria-hidden="true"
              focusable="false"
              data-prefix="fab"
              data-icon="google"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 488 512"
            >
              <path
                fill="currentColor"
                d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h240z"
              ></path>
            </svg>
            Đăng nhập bằng Google
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="text-sm text-center">
            Chưa có tài khoản?{' '}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Đăng ký ngay
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
