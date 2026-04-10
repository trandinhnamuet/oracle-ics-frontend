'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Camera,
  Upload,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  CreditCard,
  MailPlus,
  UserCircle,
  Shield,
  CheckCircle2,
  XCircle,
  Hash,
  CalendarDays,
  Pencil,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react'

import { useAuth } from '@/lib/auth-context'
import { imageApi } from '@/api/image.api'
import { updateUserAvatar, updateUserProfile, changePassword } from '@/api/user.api'
import { useToast } from '@/hooks/use-toast'
import { formatDateOnly } from '@/lib/utils'

type ProfileFormData = {
  firstName: string
  lastName: string
  phoneNumber: string
  company: string
  gender: string
  idCard: string
  backupEmail: string
  address: string
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType
  label: string
  value?: string | null
  mono?: boolean
}) {
  const { t } = useTranslation()
  return (
    <div className="group flex items-start gap-3 py-3.5 transition-all duration-200">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/10 to-red-500/5 text-red-600 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:scale-105">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
          {label}
        </p>
        <p
          className={`text-sm font-medium leading-relaxed ${mono ? 'font-mono text-xs' : ''} ${
            !value
              ? 'text-muted-foreground/60 italic'
              : 'text-foreground break-words'
          }`}
        >
          {value || t('profile.notProvided')}
        </p>
      </div>
    </div>
  )
}

function ProfilePage() {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isChangePwOpen, setIsChangePwOpen] = useState(false)
  const [isChangingPw, setIsChangingPw] = useState(false)
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
  }, [])

  const profileSchema = z.object({
    firstName: z
      .string()
      .min(1, t('profile.validation.firstNameRequired'))
      .max(50, t('profile.validation.firstNameMax')),
    lastName: z
      .string()
      .min(1, t('profile.validation.lastNameRequired'))
      .max(50, t('profile.validation.lastNameMax')),
    phoneNumber: z.string().max(20).optional().or(z.literal('')),
    company: z.string().max(255).optional().or(z.literal('')),
    gender: z.string().optional().or(z.literal('')),
    idCard: z.string().max(20).optional().or(z.literal('')),
    backupEmail: z
      .string()
      .email(t('profile.validation.backupEmailInvalid'))
      .optional()
      .or(z.literal('')),
    address: z.string().max(500).optional().or(z.literal('')),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  })

  const watchedGender = watch('gender')

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        company: user.company || '',
        gender: user.gender || '',
        idCard: user.idCard || '',
        backupEmail: user.backupEmail || '',
        address: user.address || '',
      })
    }
  }, [user, reset])

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/

  const changePwSchema = z
    .object({
      currentPassword: z.string().min(1, t('profile.validation.currentPasswordRequired')),
      newPassword: z.string().min(8, t('profile.validation.newPasswordMin')).regex(passwordRegex, t('profile.validation.newPasswordStrong')),
      confirmNewPassword: z.string().min(1, t('profile.validation.confirmPasswordRequired')),
    })
    .refine((data) => data.newPassword !== data.currentPassword, {
      message: t('profile.validation.passwordSameAsCurrent'),
      path: ['newPassword'],
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: t('profile.passwordsNotMatch'),
      path: ['confirmNewPassword'],
    })

  type ChangePwFormData = {
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
  }

  const {
    register: registerPw,
    handleSubmit: handleSubmitPw,
    formState: { errors: pwErrors },
    reset: resetPw,
  } = useForm<ChangePwFormData>({
    resolver: zodResolver(changePwSchema),
  })

  const onSubmitChangePw = async (data: ChangePwFormData) => {
    try {
      setIsChangingPw(true)
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      setIsChangePwOpen(false)
      resetPw()
      toast({
        title: t('profile.changePasswordSuccess'),
        variant: 'default',
      })
    } catch (error: any) {
      const msg = error?.message || error?.response?.message || t('profile.changePasswordFailed')
      toast({
        title: t('profile.changePasswordFailed'),
        description: msg,
        variant: 'destructive',
      })
    } finally {
      setIsChangingPw(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsSaving(true)
      const updatedUser = await updateUserProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber || undefined,
        company: data.company || undefined,
        gender: data.gender || undefined,
        idCard: data.idCard || undefined,
        backupEmail: data.backupEmail || undefined,
        address: data.address || undefined,
      })
      updateUser(updatedUser)
      setIsEditOpen(false)
      toast({
        title: t('profile.updateSuccess'),
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: t('profile.updateFailed'),
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return
    if (!file.type.startsWith('image/')) {
      toast({ title: t('profile.avatarTypeError'), variant: 'destructive' })
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: t('profile.avatarSizeError'), variant: 'destructive' })
      return
    }
    try {
      setIsUploadingAvatar(true)
      const uploadedImage = await imageApi.uploadImage(file)
      await updateUserAvatar(user.id, uploadedImage.url)
      updateUser({ avatarUrl: uploadedImage.url })
      toast({ title: t('profile.avatarUploadSuccess'), variant: 'default' })
    } catch {
      toast({ title: t('profile.avatarUploadError'), variant: 'destructive' })
    } finally {
      setIsUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    if (firstName) return firstName.charAt(0).toUpperCase()
    if (email) return email.charAt(0).toUpperCase()
    return 'U'
  }

  const formatDate = (dateString: string) => formatDateOnly(dateString)

  const genderLabel = (g?: string) => {
    if (!g) return undefined
    if (g === 'male') return t('profile.genderMale')
    if (g === 'female') return t('profile.genderFemale')
    return t('profile.genderOther')
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <UserCircle className="h-16 w-16 animate-pulse opacity-30" />
          <p className="text-sm font-medium">{t('profile.loadingUser')}</p>
        </div>
      </div>
    )
  }

  const fullName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || user.email

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Hero Banner with animated gradient */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-r from-red-500 via-red-600 to-rose-600">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-transparent to-rose-500/20 animate-pulse" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className="relative -mt-20 mb-8 animate-fadeIn">
          <Card className="overflow-hidden border-none bg-white/80 shadow-2xl backdrop-blur-xl dark:bg-slate-900/80 transition-all duration-300 hover:shadow-3xl">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                {/* Avatar and Name Section */}
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                  {/* Avatar with advanced styling */}
                  <div className="group relative">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-red-600 opacity-75 blur transition duration-300 group-hover:opacity-100" />
                    <div className="relative overflow-hidden rounded-full ring-4 ring-white dark:ring-slate-900">
                      <Avatar className="h-32 w-32 transition-transform duration-300 group-hover:scale-105">
                        <AvatarImage
                          src={user.avatarUrl ? imageApi.getImageUrl(user.avatarUrl) : undefined}
                          alt={fullName}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-red-500 to-rose-600 text-3xl font-bold text-white">
                          {getInitials(user.firstName, user.lastName, user.email)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg ring-4 ring-white transition-all duration-200 hover:scale-110 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed dark:ring-slate-900"
                    >
                      {isUploadingAvatar ? (
                        <Upload className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>

                  {/* Name and Badges */}
                  <div className="flex flex-col items-center gap-3 sm:items-start">
                    <div>
                      <h1 className="mb-1 text-center text-2xl font-bold tracking-tight text-foreground sm:text-left sm:text-3xl">
                        {fullName}
                      </h1>
                      <p className="text-center text-sm text-muted-foreground sm:text-left">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <Badge
                        className={`gap-1.5 px-3 py-1 text-xs font-medium transition-all duration-200 hover:scale-105 ${
                          user.isActive
                            ? 'border-0 bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-sm hover:shadow-md'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {user.isActive ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {user.isActive ? t('profile.accountActive') : t('profile.accountInactive')}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="gap-1.5 border-red-500/20 bg-red-500/5 px-3 py-1 text-xs font-medium text-red-600 transition-all duration-200 hover:scale-105 hover:bg-red-500/10"
                      >
                        <Shield className="h-3 w-3" />
                        {user.role === 'admin' ? t('profile.adminBadge') : t('profile.userBadge')}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setIsChangePwOpen(true)}
                    className="gap-2 border-orange-500/30 text-orange-600 px-6 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg hover:bg-orange-50 hover:border-orange-500 dark:hover:bg-orange-950/20"
                  >
                    <Lock className="h-4 w-4" />
                    {t('profile.changePasswordButton')}
                  </Button>
                <Dialog
                  open={isEditOpen}
                  onOpenChange={(open) => {
                    if (!open && user) {
                      reset({
                        firstName: user.firstName || '',
                        lastName: user.lastName || '',
                        phoneNumber: user.phoneNumber || '',
                        company: user.company || '',
                        gender: user.gender || '',
                        idCard: user.idCard || '',
                        backupEmail: user.backupEmail || '',
                        address: user.address || '',
                      })
                    }
                    setIsEditOpen(open)
                  }}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="lg"
                      className="gap-2 bg-gradient-to-r from-red-500 to-rose-600 px-6 shadow-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                      <Pencil className="h-4 w-4" />
                      {t('profile.edit')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="h-5 w-5 text-red-600" />
                        {t('profile.editDialogTitle')}
                      </DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        {t('profile.editDialogDesc')}
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
                      {/* Basic Info Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-red-600" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t('profile.sections.basicInfo')}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="e-firstName" className="text-sm font-medium">
                              {t('profile.firstName')}
                            </Label>
                            <Input
                              id="e-firstName"
                              {...register('firstName')}
                              placeholder={t('profile.firstName')}
                              className={`transition-all duration-200 ${errors.firstName ? 'border-destructive ring-destructive/20' : 'focus:ring-red-500/20'}`}
                            />
                            {errors.firstName && (
                              <p className="text-xs text-destructive">{errors.firstName.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="e-lastName" className="text-sm font-medium">
                              {t('profile.lastName')}
                            </Label>
                            <Input
                              id="e-lastName"
                              {...register('lastName')}
                              placeholder={t('profile.lastName')}
                              className={`transition-all duration-200 ${errors.lastName ? 'border-destructive ring-destructive/20' : 'focus:ring-red-500/20'}`}
                            />
                            {errors.lastName && (
                              <p className="text-xs text-destructive">{errors.lastName.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="e-gender" className="text-sm font-medium">
                              {t('profile.gender')}
                            </Label>
                            <Select
                              value={watchedGender || ''}
                              onValueChange={(val) => setValue('gender', val)}
                            >
                              <SelectTrigger id="e-gender" className="transition-all duration-200">
                                <SelectValue placeholder={t('profile.notProvided')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="male">{t('profile.genderMale')}</SelectItem>
                                <SelectItem value="female">{t('profile.genderFemale')}</SelectItem>
                                <SelectItem value="other">{t('profile.genderOther')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="e-idCard" className="text-sm font-medium">
                              {t('profile.idCard')}
                            </Label>
                            <Input
                              id="e-idCard"
                              {...register('idCard')}
                              placeholder="012345678901"
                              className="font-mono text-sm transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Contact Info Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-1 rounded-full bg-emerald-600" />
                          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {t('profile.sections.contactInfo')}
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="e-phone" className="text-sm font-medium">
                              {t('profile.phoneNumber')}
                            </Label>
                            <Input
                              id="e-phone"
                              type="tel"
                              {...register('phoneNumber')}
                              placeholder="0987 654 321"
                              className="transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="e-backupEmail" className="text-sm font-medium">
                              {t('profile.backupEmail')}
                            </Label>
                            <Input
                              id="e-backupEmail"
                              type="email"
                              {...register('backupEmail')}
                              placeholder="backup@example.com"
                              className={`transition-all duration-200 ${errors.backupEmail ? 'border-destructive ring-destructive/20' : 'focus:ring-red-500/20'}`}
                            />
                            {errors.backupEmail && (
                              <p className="text-xs text-destructive">{errors.backupEmail.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="e-company" className="text-sm font-medium">
                              {t('profile.company')}
                            </Label>
                            <Input
                              id="e-company"
                              {...register('company')}
                              placeholder="Company ABC"
                              className="transition-all duration-200"
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="e-address" className="text-sm font-medium">
                              {t('profile.address')}
                            </Label>
                            <Input
                              id="e-address"
                              {...register('address')}
                              placeholder="123 Street, District 1, Ho Chi Minh City"
                              className="transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditOpen(false)}
                          disabled={isSaving}
                          className="transition-all duration-200 hover:scale-105"
                        >
                          {t('profile.cancel')}
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSaving}
                          className="min-w-[140px] gap-2 bg-gradient-to-r from-red-500 to-rose-600 transition-all duration-200 hover:scale-105"
                        >
                          {isSaving ? (
                            <>
                              <Upload className="h-4 w-4 animate-spin" />
                              {t('profile.saving')}
                            </>
                          ) : (
                            t('profile.saveChanges')
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Content */}
        <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Sidebar - Account Meta */}
              <div className="space-y-6">
                <Card className="overflow-hidden border-none bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl dark:bg-slate-900/80">
                  <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />
                  <CardHeader className="pb-3 pt-5">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      {t('profile.accountStatus')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0 divide-y divide-border/50">
                    <InfoRow icon={Hash} label={t('profile.id')} value={String(user.id)} mono />
                    <InfoRow
                      icon={CalendarDays}
                      label={t('profile.createdAt')}
                      value={formatDate(user.createdAt)}
                    />
                    <InfoRow
                      icon={CalendarDays}
                      label={t('profile.updatedAt')}
                      value={formatDate(user.updatedAt)}
                    />
                    <InfoRow
                      icon={CheckCircle2}
                      label={t('profile.accountStatus')}
                      value={user.isActive ? t('profile.accountActive') : t('profile.accountInactive')}
                    />
                    <InfoRow
                      icon={Shield}
                      label="Role"
                      value={user.role === 'admin' ? t('profile.adminBadge') : t('profile.userBadge')}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Content - Profile Details */}
              <div className="space-y-6 lg:col-span-2">
                {/* Basic Information Card */}
                <Card className="overflow-hidden border-none bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl dark:bg-slate-900/80">
                  <div className="h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500" />
                  <CardHeader className="pb-3 pt-5">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <User className="h-4 w-4" />
                      {t('profile.sections.basicInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0 divide-y divide-border/50">
                    <div className="grid grid-cols-1 divide-y divide-border/50 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                      <div className="sm:pr-3">
                        <InfoRow icon={User} label={t('profile.firstName')} value={user.firstName} />
                      </div>
                      <div className="sm:pl-3">
                        <InfoRow icon={User} label={t('profile.lastName')} value={user.lastName} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 divide-y divide-border/50 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                      <div className="sm:pr-3">
                        <InfoRow
                          icon={UserCircle}
                          label={t('profile.gender')}
                          value={genderLabel(user.gender)}
                        />
                      </div>
                      <div className="sm:pl-3">
                        <InfoRow
                          icon={CreditCard}
                          label={t('profile.idCard')}
                          value={user.idCard}
                          mono
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information Card */}
                <Card className="overflow-hidden border-none bg-white/80 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl dark:bg-slate-900/80">
                  <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                  <CardHeader className="pb-3 pt-5">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {t('profile.sections.contactInfo')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-0 divide-y divide-border/50">
                    <InfoRow icon={Mail} label={t('profile.email')} value={user.email} />
                    <div className="grid grid-cols-1 divide-y divide-border/50 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                      <div className="sm:pr-3">
                        <InfoRow
                          icon={Phone}
                          label={t('profile.phoneNumber')}
                          value={user.phoneNumber}
                        />
                      </div>
                      <div className="sm:pl-3">
                        <InfoRow
                          icon={MailPlus}
                          label={t('profile.backupEmail')}
                          value={user.backupEmail}
                        />
                      </div>
                    </div>
                    <InfoRow icon={Building2} label={t('profile.company')} value={user.company} />
                    <InfoRow icon={MapPin} label={t('profile.address')} value={user.address} />
                  </CardContent>
                </Card>
              </div>
            </div>
        </div>

        {/* Change Password Dialog */}
        <Dialog open={isChangePwOpen} onOpenChange={(open) => { setIsChangePwOpen(open); if (!open) resetPw(); }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Lock className="h-5 w-5 text-orange-600" />
                {t('profile.changePasswordDialogTitle')}
              </DialogTitle>
              <DialogDescription>
                {t('profile.changePasswordDialogDesc')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmitPw(onSubmitChangePw)} className="mt-4 space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="cp-current" className="text-sm font-medium">
                  {t('profile.currentPassword')}
                </Label>
                <div className="relative">
                  <Input
                    id="cp-current"
                    type={showCurrentPw ? 'text' : 'password'}
                    {...registerPw('currentPassword')}
                    placeholder="••••••••"
                    className={`pr-10 transition-all duration-200 ${pwErrors.currentPassword ? 'border-destructive ring-destructive/20' : 'focus:ring-orange-500/20'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwErrors.currentPassword && (
                  <p className="text-xs text-destructive">{pwErrors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="cp-new" className="text-sm font-medium">
                  {t('profile.newPassword')}
                </Label>
                <div className="relative">
                  <Input
                    id="cp-new"
                    type={showNewPw ? 'text' : 'password'}
                    {...registerPw('newPassword')}
                    placeholder="••••••••"
                    className={`pr-10 transition-all duration-200 ${pwErrors.newPassword ? 'border-destructive ring-destructive/20' : 'focus:ring-orange-500/20'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwErrors.newPassword && (
                  <div className="space-y-1">
                    <p className="text-xs text-destructive">{pwErrors.newPassword.message}</p>
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

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label htmlFor="cp-confirm" className="text-sm font-medium">
                  {t('profile.confirmNewPassword')}
                </Label>
                <div className="relative">
                  <Input
                    id="cp-confirm"
                    type={showConfirmPw ? 'text' : 'password'}
                    {...registerPw('confirmNewPassword')}
                    placeholder="••••••••"
                    className={`pr-10 transition-all duration-200 ${pwErrors.confirmNewPassword ? 'border-destructive ring-destructive/20' : 'focus:ring-orange-500/20'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {pwErrors.confirmNewPassword && (
                  <p className="text-xs text-destructive">{pwErrors.confirmNewPassword.message}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsChangePwOpen(false); resetPw(); }}
                  disabled={isChangingPw}
                >
                  {t('profile.cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={isChangingPw}
                  className="min-w-[140px] gap-2 bg-gradient-to-r from-orange-500 to-red-600 transition-all duration-200 hover:scale-105"
                >
                  {isChangingPw ? (
                    <>
                      <Upload className="h-4 w-4 animate-spin" />
                      {t('profile.changingPassword')}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      {t('profile.changePasswordButton')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export default ProfilePage
