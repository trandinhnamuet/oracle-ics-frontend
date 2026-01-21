'use client'

import { useState, useEffect } from 'react'
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
  MapPin, 
  Shield, 
  Monitor,
  ChevronDown,
  Eye,
  EyeOff,
  Check,
  Loader2,
  Mail,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/lib/auth-context'
import { getSubscriptionById } from '@/api/subscription.api'
import { configureSubscriptionVm } from '@/api/vm-subscription.api'
import { getComputeImages, type ComputeImage } from '@/api/oci.api'

// OS Icon mapping
const OS_ICONS: Record<string, string> = {
  'Ubuntu': '/image-logo/Ubuntu.png',
  'CentOS': '/image-logo/CentOS.png',
  'Oracle Linux': '/image-logo/Oracle-Linux.png',
  'Oracle Autonomous Linux': '/image-logo/Oracle-Linux.png',
  'Windows': '/image-logo/Window.png',
  'Red Hat Enterprise Linux': '/image-logo/Red-Hat.svg',
  'Rocky Linux': '/image-logo/Rocky-Linux.svg',
  'Alma Linux': '/image-logo/Alma-Linux.png',
}

// Shapes (VM configurations)
const VM_SHAPES = [
  {
    id: 'VM.Standard.A1.Flex',
    name: 'ARM Flexible - A1',
    description: 'ARM-based, Flexible CPU and Memory (Always Free)',
    cpu: { min: 1, max: 4, default: 1 },
    memory: { min: 1, max: 24, default: 4 },
    recommended: true
  },
  {
    id: 'VM.Standard.E2.1.Micro',
    name: 'Micro - E2',
    description: 'x86-based, 1 OCPU, 1GB RAM (Always Free)',
    cpu: { min: 1, max: 1, default: 1 },
    memory: { min: 1, max: 1, default: 1 }
  },
  {
    id: 'VM.Standard3.Flex',
    name: 'Flexible - E4',
    description: 'AMD EPYC 4th Gen, Flexible CPU and Memory',
    cpu: { min: 1, max: 64, default: 2 },
    memory: { min: 1, max: 1024, default: 16 }
  },
  {
    id: 'VM.Standard.E3.Flex',
    name: 'Flexible - E3',
    description: 'AMD EPYC 3rd Gen, Flexible CPU and Memory',
    cpu: { min: 1, max: 64, default: 1 },
    memory: { min: 1, max: 1024, default: 4 }
  },
  {
    id: 'VM.Standard2.1',
    name: 'Standard 2.1',
    description: 'Intel Xeon, 1 OCPU, 15GB RAM',
    cpu: { min: 1, max: 1, default: 1 },
    memory: { min: 15, max: 15, default: 15 }
  }
]

export default function CloudConfigurationBySubscriptionPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const subscriptionId = params?.subscriptionId as string
  
  const [computeImages, setComputeImages] = useState<ComputeImage[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(true)
  const [selectedOS, setSelectedOS] = useState('')
  const [selectedImageId, setSelectedImageId] = useState('')
  const [imageSearchTerm, setImageSearchTerm] = useState('')
  const [selectedShape, setSelectedShape] = useState('VM.Standard.A1.Flex')
  const [ocpus, setOcpus] = useState(1)
  const [memoryInGBs, setMemoryInGBs] = useState(4)
  const [bootVolumeSize, setBootVolumeSize] = useState(50)
  const [notificationEmail, setNotificationEmail] = useState(user?.email || '')
  const [isProcessing, setIsProcessing] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)

  // Auto-fill notification email from user data
  useEffect(() => {
    if (user?.email && !notificationEmail) {
      setNotificationEmail(user.email)
    }
  }, [user?.email])

  // Load compute images
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoadingImages(true)
        // Filter images by selected shape for compatibility
        const images = await getComputeImages(undefined, undefined, selectedShape)
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
  }, [selectedShape]) // Re-fetch when shape changes

  // Reset OS selection when shape changes
  useEffect(() => {
    setSelectedOS('')
    setSelectedImageId('')
    setImageSearchTerm('')
  }, [selectedShape])

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

  // Validate form
  const isFormValid = () => {
    return (
      selectedOS &&
      selectedImageId &&
      selectedShape &&
      notificationEmail.trim() &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)
    )
  }

  // Get grouped images by operating system (merge Oracle Linux variants)
  const groupedImages = computeImages.reduce((acc, image) => {
    let os = image.operatingSystem
    // Group Oracle Autonomous Linux with Oracle Linux
    if (os === 'Oracle Autonomous Linux') {
      os = 'Oracle Linux'
    }
    if (!acc[os]) {
      acc[os] = []
    }
    acc[os].push(image)
    return acc
  }, {} as Record<string, ComputeImage[]>)

  // Get images for selected OS with search filter
  const availableImages = selectedOS 
    ? (groupedImages[selectedOS] || []).filter(image => 
        imageSearchTerm === '' || 
        image.displayName.toLowerCase().includes(imageSearchTerm.toLowerCase()) ||
        image.operatingSystemVersion.toLowerCase().includes(imageSearchTerm.toLowerCase())
      )
    : []

  // Get selected shape config
  const selectedShapeConfig = VM_SHAPES.find(s => s.id === selectedShape)

  // Handle VM configuration submission
  const handleConfigureVM = async () => {
    if (!isFormValid()) {
      toast({
        title: 'Validation Error',
        description: 'Please fill all required fields with valid values',
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
        shape: selectedShape,
        ocpus: ocpus,
        memoryInGBs: memoryInGBs,
        bootVolumeSizeInGBs: bootVolumeSize,
        notificationEmail: notificationEmail
      })

      toast({
        title: 'Thành công',
        description: 'Máy ảo đã tạo thành công! SSH keys đã được gửi đến email của bạn.',
        variant: 'default'
      })

      // Redirect to subscription detail page after 2 seconds
      setTimeout(() => {
        router.push(`/package-management/${subscriptionId}`)
      }, 2000)

    } catch (error: any) {
      console.error('Error configuring VM:', error)
      const errorMessage = error.response?.data?.message || 'Failed to configure VM. Please try again.'
      
      // Check if it's a capacity error
      const isCapacityError = errorMessage.toLowerCase().includes('out of host capacity')
      const isArchitectureMismatch = errorMessage.toLowerCase().includes('architecture mismatch')
      
      let displayMessage = errorMessage
      let title = 'Configuration Failed'
      
      if (isCapacityError && isArchitectureMismatch) {
        title = 'ARM Capacity Unavailable'
        displayMessage = `OCI currently has no available capacity for ARM instances (A1.Flex) in this region. Please try again later or select a different shape (e.g., E2.1.Micro, E3.Flex) with x86-compatible images.`
      } else if (isCapacityError) {
        title = 'Capacity Unavailable'
        displayMessage = `OCI has no available capacity for ${selectedShape}. Please try again later or select a different shape.`
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">Subscription not found</p>
            <Button className="mt-4" onClick={() => router.push('/package-management')}>
              Back to Package Management
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      {/* VM Provisioning Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Animated Spinner */}
              <div className="relative w-24 h-24 mx-auto mb-6">
                <Loader2 className="w-24 h-24 text-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Server className="w-10 h-10 text-blue-600 animate-pulse" />
                </div>
              </div>
              
              {/* Main Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Creating Your VM Instance
              </h3>
              
              {/* Submessage */}
              <p className="text-gray-600 mb-4">
                Your virtual machine is being provisioned...
              </p>
              
              {/* Progress Steps */}
              <div className="space-y-3 text-left bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-gray-700">Provisioning compartment and network</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-gray-700">Launching compute instance</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-gray-700">Configuring networking and security</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                  <span className="text-gray-700">Generating SSH keys</span>
                </div>
              </div>
              
              {/* Estimated Time */}
              <div className="flex items-center justify-center text-sm text-gray-500">
                <AlertCircle className="w-4 h-4 mr-2" />
                <span>This may take 1-3 minutes</span>
              </div>
              
              {/* Warning */}
              <p className="text-xs text-amber-600 mt-4">
                ⚠️ Please do not close this window or navigate away
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
            Back to Package Management
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Configure VM Instance</h1>
              <p className="text-gray-600 mt-2">
                Subscription: {subscription.id}
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
                  VM Instance Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>VM Instance Name</Label>
                  <p className="text-sm text-gray-600 mt-2 p-3 bg-blue-50 rounded-md border border-blue-200">
                    ℹ️ VM name will be auto-generated based on your email address in format: <code className="font-mono text-xs bg-white px-1 py-0.5 rounded">email-vm-{'{id}'}</code>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Notification Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="email">
                    Email Address * (SSH keys will be sent here)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="mt-2 bg-white"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Your SSH private key will be sent to this email address. Please keep it secure.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 2: VM Shape + OS Selection */}
          <div className="lg:col-span-1 space-y-6">

            {/* VM Shape Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  VM Shape *
                </CardTitle>
                <p className="text-xs text-gray-500 mt-1">
                  Select VM shape first - OS options will be filtered by compatibility
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {VM_SHAPES.map(shape => (
                    <button
                      key={shape.id}
                      onClick={() => setSelectedShape(shape.id)}
                      className={`w-full p-3 border-2 rounded-lg text-left transition-all ${
                        selectedShape === shape.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{shape.name}</span>
                            {shape.recommended && (
                              <Badge variant="default" className="text-xs">Recommended</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{shape.description}</p>
                          <div className="flex gap-3 mt-2 text-xs text-gray-500">
                            <span>CPU: {shape.cpu.default} OCPU</span>
                            <span>RAM: {shape.memory.default} GB</span>
                          </div>
                        </div>
                        {selectedShape === shape.id && (
                          <Check className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* ARM Capacity Warning */}
            {selectedShape === 'VM.Standard.A1.Flex' && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      ⚠️ ARM Capacity Limited
                    </h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      A1.Flex (ARM) instances often have limited capacity in Singapore region. If provisioning fails due to capacity, please try again later or switch to x86 shapes (E2.1.Micro, E3.Flex) which have better availability.
                    </p>
                    <p className="text-xs text-amber-700 mt-2 font-medium">
                      Note: ARM images (🔷) only work with A1.Flex. x86 images (🔵) work with E2, E3, E4, Standard shapes.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Operating System Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  Operating System
                </CardTitle>
                {selectedShape && (
                  <p className="text-xs text-gray-500 mt-1">
                    Showing compatible images for {selectedShape}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-4">{isLoadingImages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-sm text-gray-600">Loading OS images...</span>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label>Select Operating System *</Label>
                      <div className="grid grid-cols-1 gap-3 mt-2">
                        {Object.keys(groupedImages).sort().map(os => {
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
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
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
                                    <div className="text-xs text-gray-500">
                                      {groupedImages[os].length} version(s)
                                    </div>
                                    {isSelected && (
                                      <ChevronDown className="h-4 w-4 text-blue-500" />
                                    )}
                                  </div>
                                </div>
                              </button>

                              {/* Dropdown for versions */}
                              {isSelected && (
                                <div className="mt-2 p-3 border-2 border-blue-200 rounded-lg bg-white">
                                  {/* Search box */}
                                  <Input
                                    placeholder="Search version..."
                                    value={imageSearchTerm}
                                    onChange={(e) => setImageSearchTerm(e.target.value)}
                                    className="mb-2 text-sm"
                                  />
                                  
                                  {/* Version list */}
                                  <div className="max-h-60 overflow-y-auto space-y-2">
                                    {availableImages.length === 0 ? (
                                      <p className="text-xs text-gray-500 text-center py-2">No images found</p>
                                    ) : (
                                      availableImages.map(image => {
                                        const isArm = image.architecture?.toUpperCase() === 'AARCH64'
                                        const archBadgeColor = isArm ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                        const archBadgeText = isArm ? '🔷 ARM' : '🔵 x86'
                                        
                                        return (
                                          <button
                                            key={image.id}
                                            onClick={() => setSelectedImageId(image.id)}
                                            className={`w-full p-2 border rounded text-left transition-all text-xs ${
                                              selectedImageId === image.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between gap-2">
                                              <div className="flex-1 min-w-0">
                                                <div className="font-medium truncate">{image.displayName}</div>
                                              </div>
                                              <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0 ${archBadgeColor}`}>
                                                {archBadgeText}
                                              </span>
                                            </div>
                                          </button>
                                        )
                                      })
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Column 3: Configuration Summary + Actions */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Configuration Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* OS */}
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Operating System</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">
                    {selectedOS || 'Not selected'}
                    {selectedImageId && availableImages.find(img => img.id === selectedImageId) && (
                      <span className="block text-xs text-gray-600 mt-1">
                        {availableImages.find(img => img.id === selectedImageId)?.displayName}
                      </span>
                    )}
                  </p>
                </div>

                {/* VM Shape */}
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">VM Shape</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{selectedShape}</p>
                </div>

                {/* Resources */}
                {selectedShapeConfig?.id.includes('Flex') && (
                  <>
                    <div className="border-b pb-3">
                      <p className="text-xs text-gray-600 uppercase tracking-wide">OCPUs</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{ocpus}</p>
                    </div>

                    <div className="border-b pb-3">
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Memory</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{memoryInGBs} GB</p>
                    </div>
                  </>
                )}

                {/* Boot Volume */}
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Boot Volume</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{bootVolumeSize} GB</p>
                </div>

                {/* Email */}
                <div className="border-b pb-3">
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Notification Email</p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{notificationEmail || 'Not specified'}</p>
                </div>

                {/* Validation Status */}
                <div className="mt-6 pt-4">
                  {isFormValid() ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <Check className="h-4 w-4 mr-2" />
                      <span>All required fields completed</span>
                    </div>
                  ) : (
                    <div className="text-red-600 text-sm">
                      <p>Please complete all required fields:</p>
                      <ul className="text-xs mt-2 space-y-1">
                        {!selectedOS && <li>• Select Operating System</li>}
                        {!selectedImageId && <li>• Select OS Version</li>}
                        {!notificationEmail.trim() && <li>• Enter Email Address</li>}
                        {notificationEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail) && <li>• Enter valid Email Address</li>}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
                  <Button
                    onClick={handleConfigureVM}
                    disabled={!isFormValid() || isProcessing}
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Configuring...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Configure VM
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/package-management')}
                    disabled={isProcessing}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
