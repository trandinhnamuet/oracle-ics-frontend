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

import { authApi, RegisterRequest } from '@/api/auth.api'
import { useAuth } from '@/lib/auth-context'
import { useTranslation } from 'react-i18next'

export default function RegisterPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/

  const registerSchema = z.object({
    firstName: z
      .string()
      .min(1, t('register.validation.firstNameRequired'))
      .max(50, t('register.validation.firstNameMaxLength')),
    lastName: z
      .string()
      .min(1, t('register.validation.lastNameRequired'))
      .max(50, t('register.validation.lastNameMaxLength')),
    email: z
      .string()
      .min(1, t('register.validation.emailRequired'))
      .email(t('register.validation.emailInvalid')),
    password: z
      .string()
      .min(8, t('register.validation.passwordMinLength'))
      .max(100, t('register.validation.passwordMaxLength'))
      .regex(passwordRegex, t('register.validation.passwordStrong')),
    confirmPassword: z
      .string()
      .min(1, t('register.validation.confirmPasswordRequired')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('register.validation.passwordsMismatch'),
    path: ["confirmPassword"],
  })

  type RegisterFormData = z.infer<typeof registerSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const registerData: RegisterRequest = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      }
      
      const response = await authApi.register(registerData)
      
      // Reset form
      reset()
      
      // Redirect to OTP verification page with email
      localStorage.setItem('pendingVerificationEmail', data.email)
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`)
      
    } catch (error: any) {
      const msg: string = error.message || ''
      if (msg.includes('đã được đăng ký') || msg.includes('already registered') || msg.includes('already exists') || msg.includes('Conflict')) {
        setError(t('register.errorEmailAlreadyExists'))
      } else {
        setError(msg || t('register.errorDefault'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // TODO: Implement Google OAuth
      // Hiện tại chỉ hiển thị thông báo
      setError(t('register.googleComingSoon'))
      
    } catch (error: any) {
      setError(error.message || t('register.errorDefault'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('register.title')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('register.subtitle')}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('register.firstName')}</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder={t('register.firstNamePlaceholder')}
                  {...register('firstName')}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{t('register.lastName')}</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder={t('register.lastNamePlaceholder')}
                  {...register('lastName')}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('register.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('register.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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
                <div className="space-y-1">
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                  <div className="text-xs text-red-400 mt-1">
                    <p>{t('register.passwordRules.title')}</p>
                    <ul className="list-disc list-inside space-y-0.5 mt-1">
                      <li>{t('register.passwordRules.minLength')}</li>
                      <li>{t('register.passwordRules.lowercase')}</li>
                      <li>{t('register.passwordRules.uppercase')}</li>
                      <li>{t('register.passwordRules.digit')}</li>
                      <li>{t('register.passwordRules.special')}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('register.confirmPassword')}</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? t('register.registering') : t('register.registerButton')}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                {t('register.or')}
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignup}
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
            {t('register.registerWithGoogle')}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center">
          {t('register.haveAccount')}{' '}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              {t('register.loginNow')}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
