'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Camera, Upload } from 'lucide-react'

import useAuthStore, { User } from '@/hooks/use-auth-store'
import withAuth from '@/components/auth/with-auth'
import { authApi } from '@/api/auth.api'
import { imageApi } from '@/api/image.api'
import { updateUserAvatar } from '@/api/user.api'
import { useToast } from '@/hooks/use-toast'

type ProfileFormData = {
  firstName: string
  lastName: string
  email: string
}

function ProfilePage() {
  const { t } = useTranslation()
  const { user, setUser, setLoading, setError, error, isLoading } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [updateSuccess, setUpdateSuccess] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [showAvatarDialog, setShowAvatarDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Schema validation cho form cập nhật profile
  const profileSchema = z.object({
    firstName: z
      .string()
      .min(1, t('profile.validation.firstNameRequired'))
      .max(50, t('profile.validation.firstNameMax')),
    lastName: z
      .string()
      .min(1, t('profile.validation.lastNameRequired'))
      .max(50, t('profile.validation.lastNameMax')),
    email: z
      .string()
      .min(1, t('profile.validation.emailRequired'))
      .email(t('profile.validation.emailInvalid')),
  })

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
      setError(error.message || t('profile.updateFailed'))
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn file ảnh',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Lỗi',
        description: 'Kích thước file không được vượt quá 5MB',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsUploadingAvatar(true)
      
      // Upload image
      const uploadedImage = await imageApi.uploadImage(file)
      
      // Update user avatar
      const updatedUser = await updateUserAvatar(user.id, uploadedImage.url)
      
      // Update local user state
      setUser({ ...user, avatarUrl: uploadedImage.url })
      
      toast({
        title: 'Thành công',
        description: 'Cập nhật ảnh đại diện thành công',
        variant: 'default'
      })
      
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật ảnh đại diện',
        variant: 'destructive'
      })
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
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
        <div>{t('profile.loadingUser')}</div>
      </div>
    )
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
          <p className="text-gray-600">{t('profile.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Info Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
                    <DialogTrigger asChild>
                      <div className="cursor-pointer">
                        <Avatar className="w-24 h-24 hover:opacity-80 transition-opacity">
                          <AvatarImage 
                            src={user.avatarUrl ? imageApi.getImageUrl(user.avatarUrl) : undefined} 
                            alt={`${user.firstName} ${user.lastName}`} 
                          />
                          <AvatarFallback className="text-lg">
                            {getInitials(user.firstName, user.lastName, user.email)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <div className="flex justify-center">
                        <Avatar className="w-64 h-64">
                          <AvatarImage 
                            src={user.avatarUrl ? imageApi.getImageUrl(user.avatarUrl) : undefined} 
                            alt={`${user.firstName} ${user.lastName}`} 
                          />
                          <AvatarFallback className="text-4xl">
                            {getInitials(user.firstName, user.lastName, user.email)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <Upload className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user.email
                    }
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                <Badge variant="secondary">{t('profile.userBadge')}</Badge>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">{t('profile.id')}:</span>
                  <p className="text-gray-500 font-mono">{user.id}</p>
                </div>
                <div>
                  <span className="font-medium">{t('profile.createdAt')}:</span>
                  <p className="text-gray-500">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <span className="font-medium">{t('profile.updatedAt')}:</span>
                  <p className="text-gray-500">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Form Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('profile.editInfo')}</CardTitle>
              <CardDescription>
                {t('profile.editDescription')}
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
                    {t('profile.updateSuccess')}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('profile.firstName')}</Label>
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
                    <Label htmlFor="lastName">{t('profile.lastName')}</Label>
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
                  <Label htmlFor="email">{t('profile.email')}</Label>
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
                    {t('profile.emailDescription')}
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
                        {t('profile.cancel')}
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? t('profile.saving') : t('profile.saveChanges')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => setIsEditing(true)}
                    >
                      {t('profile.edit')}
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
            <CardTitle>{t('profile.changePassword')}</CardTitle>
            <CardDescription>
              {t('profile.changePasswordDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              {t('profile.changePasswordButton')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAuth(ProfilePage, { requireAuth: true })