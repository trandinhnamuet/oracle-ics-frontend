'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CustomSelect } from '@/components/ui/custom-select'
import { 
  ArrowLeft, 
  Server, 
  Monitor,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  Copy,
  Download,
  Key,
  CheckCircle,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth-context'
import { getSubscriptionById } from '@/api/subscription.api'
import { configureSubscriptionVm, getSubscriptionVm } from '@/api/vm-subscription.api'
import { getComputeImages, type ComputeImage } from '@/api/oci.api'

// OS Icon mapping
const OS_ICONS: Record<string, string> = {
  'Ubuntu': '/image-logo/Ubuntu.png',
  'CentOS': '/image-logo/CentOS.png',
  'Oracle Linux': '/image-logo/Oracle-Linux.png',
  'Windows': '/image-logo/Window.png',
  'Red Hat Enterprise Linux': '/image-logo/Red-Hat.svg',
  'Rocky Linux': '/image-logo/Rocky-Linux.svg',
  'Alma Linux': '/image-logo/Alma-Linux.png',
}

// Chuẩn hóa tên OS từ API về tên hiển thị trong OS_ICONS
// VD: "Canonical Ubuntu" → "Ubuntu", "Oracle Autonomous Linux" → "Oracle Linux"
const normalizeOsName = (apiOs: string): string => {
  if (apiOs === 'Canonical Ubuntu') return 'Ubuntu'
  if (
    apiOs === 'Oracle Autonomous Linux' ||
    apiOs === 'Oracle Linux Cloud Developer' ||
    apiOs === 'Oracle Linux STIG'
  ) return 'Oracle Linux'
  return apiOs
}

// Auto-determine shape based on OS selection
const getShapeForOS = (os: string) => 
  os === 'Windows' ? 'VM.Standard.E4.Flex' : 'VM.Standard.A2.Flex'

// Static OS options list
const OS_LIST = Object.keys(OS_ICONS)

export default function CloudConfigurationBySubscriptionPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const subscriptionId = params?.subscriptionId as string
  
  const [computeImages, setComputeImages] = useState<ComputeImage[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [selectedOS, setSelectedOS] = useState('')
  const [selectedImageId, setSelectedImageId] = useState('')
  const [imageSearchTerm, setImageSearchTerm] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [availableOsList, setAvailableOsList] = useState<string[]>([])  // Danh sách OS có image thực tế

  // Credential dialog state (shown once after VM creation)
  const [vmCredentials, setVmCredentials] = useState<{
    type: 'linux' | 'windows' | 'windows-pending'
    instanceName: string
    publicIp?: string
    privateKey?: string
    username?: string
    password?: string
    subscriptionId?: string
  } | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const windowsPasswordPollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Auto-poll for Windows password when in pending state
  useEffect(() => {
    if (vmCredentials?.type !== 'windows-pending' || !vmCredentials.subscriptionId) return

    const sid = vmCredentials.subscriptionId
    windowsPasswordPollRef.current = setInterval(async () => {
      try {
        const vmData = await getSubscriptionVm(sid)
        const vm = vmData?.vm
        if (vm?.windowsInitialPassword) {
          clearInterval(windowsPasswordPollRef.current!)
          windowsPasswordPollRef.current = null
          setVmCredentials(prev => prev ? {
            ...prev,
            type: 'windows',
            username: prev.username || 'opc',
            password: vm.windowsInitialPassword,
            publicIp: prev.publicIp || vm.publicIp,
          } : null)
        }
      } catch {
        // Ignore polling errors, keep trying
      }
    }, 10000)

    return () => {
      if (windowsPasswordPollRef.current) clearInterval(windowsPasswordPollRef.current)
    }
  }, [vmCredentials?.type, vmCredentials?.subscriptionId])

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    })
  }

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  // Load compute images when OS selection changes
  useEffect(() => {
    if (!selectedOS) {
      setComputeImages([])
      return
    }

    const fetchImages = async () => {
      try {
        setIsLoadingImages(true)
        setSelectedImageId('')
        setImageSearchTerm('')
        // Auto-determine shape based on OS and fetch compatible images
        const shape = getShapeForOS(selectedOS)
        const images = await getComputeImages(undefined, undefined, shape)
        setComputeImages(images)
      } catch (error: any) {
        console.error('Error fetching compute images:', error)
        toast({
          title: 'Error',
          description: 'Failed to load available operating systems',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingImages(false)
      }
    }

    fetchImages()
  }, [selectedOS]) // Re-fetch when OS changes

  // Load subscription details
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!subscriptionId) return
      
      try {
        setIsLoadingSubscription(true)
        const data = await getSubscriptionById(subscriptionId)
        setSubscription(data)
      } catch (error: any) {
        console.error('Error fetching subscription:', error)
        toast({
          title: 'Error',
          description: 'Failed to load subscription details',
          variant: 'destructive'
        })
      } finally {
        setIsLoadingSubscription(false)
      }
    }

    fetchSubscription()
  }, [subscriptionId])

  // Load available OS options (những OS có image thực tế)
  useEffect(() => {
    if (!subscriptionId) return

    const loadAvailableOsList = async () => {
      try {
        // Fetch images cho cả 2 shape (Windows và non-Windows) để biết OS nào có sẵn
        const [windowsImages, linuxImages] = await Promise.all([
          getComputeImages(undefined, undefined, 'VM.Standard.E4.Flex'),
          getComputeImages(undefined, undefined, 'VM.Standard.A2.Flex'),
        ])

        const allImages = [...windowsImages, ...linuxImages]
        const uniqueOsList = Array.from(
          new Set(allImages.map(img => normalizeOsName(img.operatingSystem)))
        ).filter(os => OS_ICONS[os]) // Chỉ lấy OS có icon
          .sort()

        setAvailableOsList(uniqueOsList)
      } catch (error) {
        console.error('Error loading available OS list:', error)
        // Fallback: dùng toàn bộ OS_LIST nếu load thất bại
        setAvailableOsList(OS_LIST)
      }
    }

    loadAvailableOsList()
  }, [subscriptionId])

  // Validate form
  const isFormValid = () => {
    return (
      selectedOS &&
      selectedImageId &&
      !!user?.email
    )
  }

  // Filter images for selected OS with search filter
  const availableImages = selectedOS 
    ? computeImages.filter(image => {
        return normalizeOsName(image.operatingSystem) === selectedOS
      }).filter(image => 
        imageSearchTerm === '' || 
        image.displayName.toLowerCase().includes(imageSearchTerm.toLowerCase()) ||
        image.operatingSystemVersion.toLowerCase().includes(imageSearchTerm.toLowerCase())
      )
    : []

  // Handle VM configuration submission
  const handleConfigureVM = async () => {
    if (!isFormValid()) {
      toast({
        title: t('cloudConfig.validationError'),
        description: t('cloudConfig.validationErrorDesc'),
        variant: 'destructive'
      })
      return
    }

    setIsProcessing(true)

    try {
      if (!selectedImageId) {
        throw new Error('Please select an operating system image')
      }

      const response = await configureSubscriptionVm(subscriptionId, {
        imageId: selectedImageId,
        shape: getShapeForOS(selectedOS),
        notificationEmail: user?.email || ''
      })

      const isWindows = response.vm?.operatingSystem?.toLowerCase().includes('windows')
      const instanceName = response.vm?.instanceName || 'VM'
      const publicIp = response.vm?.publicIp

      if (isWindows && response.vm?.windowsInitialPassword) {
        // Windows - password available immediately
        setVmCredentials({
          type: 'windows',
          instanceName,
          publicIp,
          username: 'opc',
          password: response.vm.windowsInitialPassword,
        })
      } else if (isWindows) {
        // Windows - password pending async retrieval, start polling
        setVmCredentials({
          type: 'windows-pending',
          instanceName,
          publicIp,
          username: 'opc',
          subscriptionId,
        })
      } else if (response.sshKey?.privateKey) {
        // Linux - SSH key available
        setVmCredentials({
          type: 'linux',
          instanceName,
          publicIp,
          privateKey: response.sshKey.privateKey,
        })
      } else {
        // Fallback: just redirect
        toast({
          title: t('cloudConfig.configSuccess'),
          description: response.message,
          variant: 'default'
        })
        setTimeout(() => router.push(`/package-management/${subscriptionId}`), 2000)
      }

    } catch (error: any) {
      console.error('Error configuring VM:', error)
      const errorMessage = error.response?.data?.message || t('cloudConfig.configFailedDesc')
      
      // Check if it's a capacity error
      const isCapacityError = errorMessage.toLowerCase().includes('out of host capacity')
      const isArchitectureMismatch = errorMessage.toLowerCase().includes('architecture mismatch')
      
      let displayMessage = errorMessage
      let title = t('cloudConfig.configFailed')
      
      if (isCapacityError && isArchitectureMismatch) {
        title = t('cloudConfig.armCapacityUnavailable')
        displayMessage = t('cloudConfig.armCapacityUnavailableDesc')
      } else if (isCapacityError) {
        title = t('cloudConfig.capacityUnavailable')
        displayMessage = t('cloudConfig.capacityUnavailableDesc', { shape: getShapeForOS(selectedOS) })
      }
      
      toast({
        title,
        description: displayMessage,
        variant: 'destructive',
        duration: 8000
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoadingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-muted-foreground">{t('cloudConfig.loadingSubscription')}</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">{t('cloudConfig.subscriptionNotFound')}</p>
            <Button className="mt-4" onClick={() => router.push('/package-management')}>
              {t('cloudConfig.subscriptionNotFoundBtn')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background py-12 px-4">
      {/* VM Provisioning Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Animated Spinner */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <Loader2 className="w-24 h-24 text-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Server className="w-10 h-10 text-blue-600 animate-pulse" />
                </div>
              </div>
              
              {/* Main Message */}
              <h3 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-3">
                {t('cloudConfig.creatingVM')}
              </h3>
              
              {/* Submessage */}
              <p className="text-gray-600 dark:text-muted-foreground mb-4">
                {t('cloudConfig.creatingVMDesc')}
              </p>
              
              {/* Progress Steps */}
              <div className="space-y-3 text-left bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 mb-4">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-gray-700 dark:text-foreground">{t('cloudConfig.provisionStep1')}</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-gray-700 dark:text-foreground">{t('cloudConfig.provisionStep2')}</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-gray-700 dark:text-foreground">{t('cloudConfig.provisionStep3')}</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  <span className="text-gray-700 dark:text-foreground">{t('cloudConfig.provisionStep4')}</span>
                </div>
              </div>
              
              {/* Estimated Time */}
              <div className="flex items-center justify-center text-sm text-gray-500 dark:text-muted-foreground">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>{t('cloudConfig.timeEstimate')}</span>
              </div>
              
              {/* Warning */}
              <p className="text-xs text-amber-600 mt-4">
                {t('cloudConfig.doNotClose')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/package-management')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('cloudConfig.back')}
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">{t('cloudConfig.title')}</h1>
              <p className="text-gray-600 dark:text-muted-foreground mt-2">
                {t('cloudConfig.subscriptionLabel', { id: subscription.id })}
              </p>
            </div>
            <Badge variant="default">
              {subscription.cloud_package?.name || 'Cloud Package'}
            </Badge>
          </div>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: VM Details + Notification */}
          <div className="lg:col-span-1 space-y-6">
            {/* VM Instance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="h-5 w-5 mr-2" />
                  {t('cloudConfig.vmDetails')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('cloudConfig.vmInstanceName')}</Label>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border border-blue-200 dark:border-blue-900">
                    ℹ️ {t('cloudConfig.vmNameNote')} <code className="font-mono text-xs bg-white dark:bg-muted px-1 py-0.5 rounded">email-vm-{'{id}'}</code>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notification Email - Removed */}

          </div>

          {/* Column 2: OS Selection */}
          <div className="lg:col-span-1 space-y-6">

            {/* Operating System Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  {t('cloudConfig.operatingSystem')}
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                  {t('cloudConfig.selectOSNote', 'Chọn hệ điều hành cho máy ảo của bạn. Cấu hình sẽ được tự động thiết lập theo gói đăng ký.')}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('cloudConfig.selectOS')}</Label>
                  <div className="grid grid-cols-1 gap-3 mt-2">
                    {availableOsList.length === 0 ? (
                      <p className="text-xs text-gray-500 dark:text-muted-foreground text-center py-4">
                        {t('cloudConfig.loadingOsImages', 'Đang tải danh sách hệ điều hành...')}
                      </p>
                    ) : (
                      availableOsList.map(os => {
                        const icon = OS_ICONS[os] || '/image-logo/Oracle-Linux.png'
                        const isSelected = selectedOS === os
                        
                        return (
                          <div key={os} className="flex flex-col">
                            <button
                              onClick={() => {
                                if (selectedOS === os) {
                                  // Toggle: deselect if already selected
                                  setSelectedOS('')
                                  setSelectedImageId('')
                                  setImageSearchTerm('')
                                } else {
                                  // Select new OS
                                  setSelectedOS(os)
                                  setSelectedImageId('')
                                  setImageSearchTerm('')
                                }
                              }}
                              className={`px-4 py-2 border-2 rounded-lg transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                  : 'border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-border/80'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 relative flex-shrink-0">
                                    <Image
                                      src={icon}
                                      alt={os}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                <div className="font-medium text-sm text-left">{os}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isSelected && (
                                  <ChevronDown className="h-4 w-4 text-blue-500" />
                                )}
                              </div>
                            </div>
                          </button>

                          {/* Dropdown for versions */}
                          {isSelected && (
                            <div className="mt-2 p-3 border-2 border-blue-200 dark:border-blue-900 rounded-lg bg-white dark:bg-card">
                              {isLoadingImages ? (
                                <div className="flex items-center justify-center py-4">
                                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                  <span className="ml-2 text-sm text-gray-600 dark:text-muted-foreground">{t('cloudConfig.loadingOsImages')}</span>
                                </div>
                              ) : (
                                <>
                                  {/* Search box */}
                                  <Input
                                    placeholder={t('cloudConfig.searchVersion')}
                                    value={imageSearchTerm}
                                    onChange={(e) => setImageSearchTerm(e.target.value)}
                                    className="mb-2 text-sm"
                                  />
                                  
                                  {/* Version list */}
                                  <div className="max-h-60 overflow-y-auto space-y-2">
                                    {availableImages.length === 0 ? (
                                      <p className="text-xs text-gray-500 dark:text-muted-foreground text-center py-2">{t('cloudConfig.noImagesFound')}</p>
                                    ) : (
                                      availableImages.map(image => (
                                        <button
                                          key={image.id}
                                          onClick={() => setSelectedImageId(image.id)}
                                          className={`w-full p-2 border rounded text-left transition-all text-xs ${
                                            selectedImageId === image.id
                                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                              : 'border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-border/80'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                              <div className="font-medium truncate">{image.displayName}</div>
                                            </div>
                                          </div>
                                        </button>
                                      ))
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 3: Configuration Summary + Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>{t('cloudConfig.configSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* OS */}
                <div className="border-b dark:border-border pb-3">
                  <p className="text-xs text-gray-600 dark:text-muted-foreground uppercase tracking-wide">{t('cloudConfig.osLabel')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-foreground mt-1">
                    {selectedOS || t('cloudConfig.notSelected')}
                    {selectedImageId && availableImages.find(img => img.id === selectedImageId) && (
                    <span className="block text-xs text-gray-600 dark:text-muted-foreground mt-1">
                        {availableImages.find(img => img.id === selectedImageId)?.displayName}
                      </span>
                    )}
                  </p>
                </div>

                {/* Package Specs */}
                {subscription?.cloudPackage && (
                  <>
                    <div className="border-b dark:border-border pb-3">
                      <p className="text-xs text-gray-600 dark:text-muted-foreground uppercase tracking-wide">CPU</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-foreground mt-1">{subscription.cloudPackage.cpu || t('cloudConfig.notSpecified')}</p>
                    </div>

                    <div className="border-b dark:border-border pb-3">
                      <p className="text-xs text-gray-600 dark:text-muted-foreground uppercase tracking-wide">RAM</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-foreground mt-1">{subscription.cloudPackage.ram || t('cloudConfig.notSpecified')}</p>
                    </div>

                    <div className="border-b dark:border-border pb-3">
                      <p className="text-xs text-gray-600 dark:text-muted-foreground uppercase tracking-wide">{t('cloudConfig.bootVolume')}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-foreground mt-1">{subscription.cloudPackage.memory || t('cloudConfig.notSpecified')}</p>
                    </div>
                  </>
                )}

                {/* Email */}
                <div className="border-b dark:border-border pb-3">
                  <p className="text-xs text-gray-600 dark:text-muted-foreground uppercase tracking-wide">{t('cloudConfig.notificationEmail')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-foreground mt-1">{user?.email || t('cloudConfig.notSpecified')}</p>
                </div>

                {/* Validation Status */}
                <div className="mt-6 pt-4">
                  {isFormValid() ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <Check className="h-4 w-4 mr-2" />
                      <span>{t('cloudConfig.allFieldsCompleted')}</span>
                    </div>
                  ) : (
                    <div className="text-red-600 text-sm">
                      <p>{t('cloudConfig.incompleteFields')}</p>
                      <ul className="text-xs mt-2 space-y-1">
                        {!selectedOS && <li>• {t('cloudConfig.needOS')}</li>}
                        {!selectedImageId && <li>• {t('cloudConfig.needOSVersion')}</li>}
                        {!user?.email && <li>• {t('cloudConfig.needEmail')}</li>}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-6 pt-4 border-t dark:border-border">
                  <Button
                    onClick={() => {
                      if (subscription?.vm_instance_id) {
                        setShowConfirmDialog(true)
                      } else {
                        handleConfigureVM()
                      }
                    }}
                    disabled={!isFormValid() || isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('cloudConfig.configuring')}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        {t('cloudConfig.configureVM')}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/package-management')}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    {t('cloudConfig.cancelBtn')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('cloudConfig.confirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('cloudConfig.confirmDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>{t('cloudConfig.confirmCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowConfirmDialog(false)
                handleConfigureVM()
              }}
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {t('cloudConfig.confirmOk')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* One-time Credential Dialog */}
      <AlertDialog open={!!vmCredentials} onOpenChange={() => {}}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="h-6 w-6 text-green-500" />
              {t('cloudConfig.vmCreated.title')}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4 text-left pt-2">

                {/* Warning: one-time display */}
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <p className="font-semibold text-red-900 text-sm">
                    {t('cloudConfig.vmCreated.warningTitle')}
                  </p>
                  <p className="text-red-800 text-sm mt-1">
                    {t('cloudConfig.vmCreated.warningDesc')}
                  </p>
                </div>

                {/* VM Info */}
                <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
                  <p><strong>VM:</strong> {vmCredentials?.instanceName}</p>
                  {vmCredentials?.publicIp && <p><strong>IP:</strong> {vmCredentials.publicIp}</p>}
                </div>

                {/* Linux SSH Key */}
                {vmCredentials?.type === 'linux' && vmCredentials.privateKey && (
                  <div className="space-y-2">
                    <p className="font-semibold flex items-center gap-2">
                      <Key className="h-4 w-4" /> {t('cloudConfig.vmCreated.sshKeyLabel')}
                    </p>
                    <div className="relative">
                      <textarea
                        readOnly
                        value={vmCredentials.privateKey}
                        className="w-full h-40 font-mono text-xs p-3 bg-gray-900 text-green-400 rounded border resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(vmCredentials.privateKey!, 'key')}
                        className="flex-1"
                      >
                        {copiedField === 'key' ? <Check className="h-4 w-4 mr-1 text-green-500" /> : <Copy className="h-4 w-4 mr-1" />}
                        {copiedField === 'key' ? t('cloudConfig.vmCreated.copied') : t('cloudConfig.vmCreated.copyKey')}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => downloadFile(vmCredentials.privateKey!, `${vmCredentials.instanceName}-key.pem`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        {t('cloudConfig.vmCreated.downloadPem')}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadFile(
                        `============================\nVM CREDENTIALS - KEEP SAFE\n============================\nVM Name: ${vmCredentials.instanceName}\nPublic IP: ${vmCredentials.publicIp || '(available after a few minutes)'}\nUsername: opc\nSSH Key File: ${vmCredentials.instanceName}-key.pem\n\nConnect command:\n  ssh -i ${vmCredentials.instanceName}-key.pem opc@${vmCredentials.publicIp || '<YOUR_IP>'}\n\n----\nPrivate Key (save as ${vmCredentials.instanceName}-key.pem):\n${vmCredentials.privateKey}\n============================`,
                        `${vmCredentials.instanceName}-ssh-info.txt`
                      )}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {t('cloudConfig.vmCreated.downloadFullCredentials')}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      {t('cloudConfig.vmCreated.connectLabel')}<code className="bg-gray-100 px-1 rounded">ssh -i {vmCredentials.instanceName}-key.pem opc@{vmCredentials.publicIp || 'YOUR_IP'}</code>
                    </p>
                  </div>
                )}

                {/* Windows Password (available immediately) */}
                {vmCredentials?.type === 'windows' && vmCredentials.password && (
                  <div className="space-y-2">
                    <p className="font-semibold">{t('cloudConfig.vmCreated.windowsRdpTitle')}</p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded space-y-2 text-sm font-mono">
                      <div className="flex items-center justify-between">
                        <span><strong>{t('cloudConfig.vmCreated.username')}:</strong> {vmCredentials.username}</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(vmCredentials.username!, 'user')}>
                          {copiedField === 'user' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span><strong>{t('cloudConfig.vmCreated.initialPassword')}:</strong> {vmCredentials.password}</span>
                        <Button size="sm" variant="ghost" onClick={() => copyToClipboard(vmCredentials.password!, 'pass')}>
                          {copiedField === 'pass' ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {t('cloudConfig.vmCreated.windowsHint')}
                    </p>
                    <Button
                      size="sm"
                      onClick={() => downloadFile(
                        `============================\nVM CREDENTIALS - KEEP SAFE\n============================\nVM Name: ${vmCredentials.instanceName}\nPublic IP: ${vmCredentials.publicIp || '(available after a few minutes)'}\nUsername: ${vmCredentials.username}\nPassword: ${vmCredentials.password}\n\nRDP Connection:\n  Host: ${vmCredentials.publicIp || '<YOUR_IP>'}\n  Username: ${vmCredentials.username}\n  Password: ${vmCredentials.password}\n============================`,
                        `${vmCredentials.instanceName}-rdp-credentials.txt`
                      )}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {t('cloudConfig.vmCreated.downloadCredentials')}
                    </Button>
                  </div>
                )}

                {/* Windows Password Pending — auto-polling every 10s */}
                {vmCredentials?.type === 'windows-pending' && (
                  <div className="space-y-3">
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                      <p className="font-semibold text-yellow-900 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t('cloudConfig.vmCreated.windowsPendingTitle')}
                      </p>
                      <p className="text-yellow-800 text-sm mt-2">
                        {t('cloudConfig.vmCreated.windowsPendingDesc1')}
                      </p>
                      <p className="text-yellow-800 text-sm mt-1">
                        {t('cloudConfig.vmCreated.windowsPendingDesc2')}
                      </p>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm font-mono">
                      <p><strong>{t('cloudConfig.vmCreated.username')}:</strong> {vmCredentials.username}</p>
                      {vmCredentials.publicIp && <p className="mt-1"><strong>IP:</strong> {vmCredentials.publicIp}</p>}
                      <p className="mt-1 text-muted-foreground italic">{t('cloudConfig.vmCreated.windowsPendingGeneratingNote')}</p>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {t('cloudConfig.vmCreated.autoCheckEvery10s')}
                    </p>
                  </div>
                )}

              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                if (windowsPasswordPollRef.current) {
                  clearInterval(windowsPasswordPollRef.current)
                  windowsPasswordPollRef.current = null
                }
                setVmCredentials(null)
                router.push(`/package-management/${subscriptionId}`)
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              {t('cloudConfig.vmCreated.savedGotoVM')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
