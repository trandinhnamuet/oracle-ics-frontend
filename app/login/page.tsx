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
import { useTranslation } from 'react-i18next'

import { authApi, LoginRequest } from '@/api/auth.api'
import useAuthStore from '@/hooks/use-auth-store'

export default function LoginPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { login, setLoading, setError, error, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, t('login.validationEmailRequired'))
      .email(t('login.validationEmailInvalid')),
    password: z
      .string()
      .min(1, t('login.validationPasswordRequired'))
      .min(process.env.NODE_ENV === 'development' ? 3 : 6, 
           t('login.validationPasswordMinLength', { length: process.env.NODE_ENV === 'development' ? 3 : 6 })),
  })

  type LoginFormData = z.infer<typeof loginSchema>

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    clearErrors
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true)
      setError(null)
      clearErrors()
      const response = await authApi.login(data)
      login(response.user, response.access_token)
      reset()
      const returnUrl = new URLSearchParams(window.location.search).get('returnUrl')
      router.push(returnUrl || '/')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)
      setError(t('login.googleLoginComingSoon'))
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
            {t('login.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('login.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                Form valid: {isValid ? 'Yes' : 'No'}<br/>
                Errors: {Object.keys(errors).length}<br/>
                Test data: test@gmail.com / 123123
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                autoComplete="email"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
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
              {isLoading ? t('login.loggingIn') : t('login.loginButton')}
            </Button>
            
            {process.env.NODE_ENV === 'development' && (
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  const event = new Event('input', { bubbles: true })
                  const emailInput = document.getElementById('email') as HTMLInputElement
                  const passwordInput = document.getElementById('password') as HTMLInputElement
                  if (emailInput && passwordInput) {
                    if (emailInput.value == 'tranngocphong@gmail.com') emailInput.value = 'khucthuadu@gmail.com'
                    else emailInput.value = 'tranngocphong@gmail.com'
                    emailInput.dispatchEvent(event)
                    passwordInput.value = '123123'
                    passwordInput.dispatchEvent(event)
                  }
                }}
              >
                {t('login.fillTestData')}
              </Button>
            )}
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('login.or')}
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
            {t('login.loginWithGoogle')}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center">
            <Link
              href="/forgot-password"
              className="text-primary hover:underline"
            >
              {t('login.forgotPassword')}
            </Link>
          </div>
          <div className="text-sm text-center">
            {t('login.noAccount')}{' '}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              {t('login.registerNow')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}