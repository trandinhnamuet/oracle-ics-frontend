'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import useAuthStore, { User } from '@/hooks/use-auth-store'
import withAuth from '@/components/auth/with-auth'
import { authApi } from '@/api/auth.api'

// Schema validation cho form cập nhật profile
const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Họ không được để trống')
    .max(50, 'Họ không được quá 50 ký tự'),
  lastName: z
    .string()
    .min(1, 'Tên không được để trống')
    .max(50, 'Tên không được quá 50 ký tự'),
  email: z
    .string()
    .min(1, 'Email không được để trống')
    .email('Email không hợp lệ'),
})

type ProfileFormData = z.infer<typeof profileSchema>

function ProfilePage() {
  const { user, setUser, setLoading, setError, error, isLoading } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  // Set form values when user data is available
  useEffect(() => {
    if (user) {
      setValue('firstName', user.firstName || '')
      setValue('lastName', user.lastName || '')
      setValue('email', user.email)
    }
  }, [user, setValue])

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setLoading(true)
      setError(null)
      setUpdateSuccess(false)
      
      // TODO: Implement update profile API call
      // const updatedUser = await authApi.updateProfile(data)
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const updatedUser: User = {
        ...user!,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        updatedAt: new Date().toISOString()
      }
      
      setUser(updatedUser)
      setIsEditing(false)
      setUpdateSuccess(true)
      
      // Hide success message after 3 seconds
      setTimeout(() => setUpdateSuccess(false), 3000)
      
    } catch (error: any) {
      setError(error.message || 'Cập nhật thông tin thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email
      })
    }
    setIsEditing(false)
    setError(null)
  }

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    if (email) {
      return email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div>Đang tải thông tin người dùng...</div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.firstName, user.lastName, user.email)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.email
                    }
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                <Badge variant="secondary">Người dùng</Badge>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">ID:</span>
                  <p className="text-gray-500 font-mono">{user.id}</p>
                </div>
                <div>
                  <span className="font-medium">Ngày tạo:</span>
                  <p className="text-gray-500">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium">Cập nhật cuối:</span>
                  <p className="text-gray-500">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Chỉnh sửa thông tin</CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {updateSuccess && (
                <Alert>
                  <AlertDescription>
                    Thông tin đã được cập nhật thành công!
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Họ</Label>
                    <Input
                      id="firstName"
                      type="text"
                      {...register('firstName')}
                      disabled={!isEditing || isLoading}
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Tên</Label>
                    <Input
                      id="lastName"
                      type="text"
                      {...register('lastName')}
                      disabled={!isEditing || isLoading}
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    disabled={!isEditing || isLoading}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Email được sử dụng để đăng nhập và nhận thông báo
                  </p>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                      >
                        Hủy
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Password Change Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <CardDescription>
              Cập nhật mật khẩu để bảo mật tài khoản
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              Đổi mật khẩu (Sắp có)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAuth(ProfilePage, { requireAuth: true })