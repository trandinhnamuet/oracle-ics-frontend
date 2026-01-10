'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Pause, RotateCcw, Trash2, Download, RefreshCw, Terminal, MonitorUp } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { getSubscriptionById, Subscription } from '@/api/subscription.api'
import { getSubscriptionVm, performVmAction, requestNewSshKey, VmDetails } from '@/api/vm-subscription.api'
import { getInstanceMetrics, InstanceMetrics, MetricsData } from '@/api/oci.api'
import { toast } from '@/hooks/use-toast'

// Demo data for charts
const cpuData = [
  { time: '17:10', usage: 0 },
  { time: '17:20', usage: 5 },
  { time: '17:30', usage: 15 },
  { time: '17:40', usage: 25 },
  { time: '17:50', usage: 55 },
  { time: '18:00', usage: 100 },
]

const memoryData = [
  { time: '17:10', usage: 0 },
  { time: '17:20', usage: 10 },
  { time: '17:30', usage: 20 },
  { time: '17:40', usage: 30 },
  { time: '17:50', usage: 85 },
  { time: '18:00', usage: 75 },
]

interface CloudPackageDetail {
  id: string
  vmName: string
  packageName: string
  status: 'active' | 'inactive' | 'expired' | 'suspended' | 'cancelled' | 'pending'
  cpu: string
  memory: string
  storage: string
  bandwidth: string
  feature: string
  ipAddress: string
  createdAt: string
  startDate: string
  endDate: string
  nextBilling: string
  monthlyPrice: number
  autoRenew: boolean
  user?: {
    firstName: string
    lastName: string
    email: string
  }
}

export default function PackageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { t } = useTranslation()
  const subscriptionId = params.subscription_id as string

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [packageDetail, setPackageDetail] = useState<CloudPackageDetail | null>(null)
  const [vmDetails, setVmDetails] = useState<VmDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [isLoadingVm, setIsLoadingVm] = useState(false)
  const [metrics, setMetrics] = useState<InstanceMetrics | null>(null)
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h')
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setIsDataLoading(true)
        const data = await getSubscriptionById(subscriptionId)
        setSubscription(data)
        
        // Transform subscription data to package detail format
        const detail: CloudPackageDetail = {
          id: data.id,
          vmName: `VM-${data.id.slice(-8)}`, // Generate VM name from subscription ID
          packageName: data.cloudPackage?.name || 'Unknown Package',
          status: data.status,
          cpu: data.cloudPackage?.cpu || 'N/A',
          memory: data.cloudPackage?.ram || 'N/A', 
          storage: data.cloudPackage?.memory || 'N/A',
          bandwidth: data.cloudPackage?.bandwidth || 'N/A',
          feature: data.cloudPackage?.feature || 'N/A',
          ipAddress: '', // Will be populated from vmDetails
          createdAt: new Date(data.created_at).toLocaleDateString('vi-VN'),
          startDate: new Date(data.start_date).toLocaleDateString('vi-VN'),
          endDate: new Date(data.end_date).toLocaleDateString('vi-VN'),
          nextBilling: new Date(data.end_date).toLocaleDateString('vi-VN'),
          monthlyPrice: data.cloudPackage?.cost_vnd ? parseFloat(data.cloudPackage.cost_vnd) : 0,
          autoRenew: data.auto_renew,
          user: data.user
        }
        setPackageDetail(detail)
        
      } catch (error: any) {
        console.error('Error fetching subscription:', error)
        toast({
          title: t('packageDetail.toast.error'),
          description: t('packageDetail.toast.loadError'),
          variant: "destructive"
        })
      } finally {
        setIsDataLoading(false)
      }
    }

    if (subscriptionId) {
      fetchSubscription()
    }
  }, [subscriptionId])

  // Fetch VM details if subscription has VM
  useEffect(() => {
    const fetchVmDetails = async () => {
      if (!subscription?.vm_instance_id) {
        console.log('No vm_instance_id, skipping fetch:', subscription?.vm_instance_id)
        return
      }

      try {
        setIsLoadingVm(true)
        console.log('Fetching VM details for subscription:', subscriptionId)
        const vmData = await getSubscriptionVm(subscriptionId)
        console.log('VM data received:', vmData)
        setVmDetails(vmData)
      } catch (error: any) {
        console.error('Error fetching VM details:', error)
        // Don't show error toast as VM might not be configured yet
      } finally {
        setIsLoadingVm(false)
      }
    }

    if (subscription) {
      fetchVmDetails()
    }
  }, [subscription, subscriptionId])

  // Fetch metrics when VM details are available
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!vmDetails?.vm?.instanceId || vmDetails?.vm?.lifecycleState !== 'RUNNING') return

      try {
        setIsLoadingMetrics(true)
        const metricsData = await getInstanceMetrics(vmDetails.vm.instanceId, timeRange)
        setMetrics(metricsData)
      } catch (error: any) {
        console.error('Error fetching metrics:', error)
        // Don't show error for metrics as it's not critical
      } finally {
        setIsLoadingMetrics(false)
      }
    }

    if (vmDetails?.vm?.instanceId && vmDetails.vm.lifecycleState === 'RUNNING') {
      fetchMetrics()
      // Refresh metrics every 60 seconds
      const interval = setInterval(fetchMetrics, 60000)
      return () => clearInterval(interval)
    }
  }, [vmDetails?.vm?.instanceId, vmDetails?.vm?.lifecycleState, timeRange])

  // Calculate network combined data (bytes in + out)
  const getNetworkData = () => {
    if (!metrics?.network.in || !metrics?.network.out) return []
    
    const combined = metrics.network.in.map((inData, index) => ({
      time: inData.time,
      in: inData.value / 1024 / 1024, // Convert to MB
      out: (metrics.network.out[index]?.value || 0) / 1024 / 1024,
    }))
    
    return combined
  }

  // Calculate disk combined data (read + write)
  const getDiskData = () => {
    if (!metrics?.disk.read || !metrics?.disk.write) return []
    
    const combined = metrics.disk.read.map((readData, index) => ({
      time: readData.time,
      read: readData.value / 1024 / 1024, // Convert to MB
      write: (metrics.disk.write[index]?.value || 0) / 1024 / 1024,
    }))
    
    return combined
  }

  const handleVmAction = async (action: 'START' | 'STOP' | 'RESTART' | 'TERMINATE') => {
    if (!subscription?.vm_instance_id) {
      toast({
        title: 'VM Not Configured',
        description: 'Please configure your VM first',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      await performVmAction(subscriptionId, action)
      toast({
        title: 'Success',
        description: `VM ${action.toLowerCase()} command sent successfully`,
        variant: 'default'
      })
      
      // Refresh VM details after action
      setTimeout(async () => {
        try {
          const vmData = await getSubscriptionVm(subscriptionId)
          setVmDetails(vmData)
        } catch (error) {
          console.error('Error refreshing VM details:', error)
        }
      }, 2000)
    } catch (error: any) {
      console.error(`Error performing VM ${action}:`, error)
      toast({
        title: 'Action Failed',
        description: error.response?.data?.message || `Failed to ${action.toLowerCase()} VM`,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequestNewKey = async () => {
    if (!subscription?.vm_instance_id) {
      toast({
        title: 'VM Not Configured',
        description: 'Please configure your VM first',
        variant: 'destructive'
      })
      return
    }

    const email = subscription.user?.email || prompt('Enter email to receive new SSH key:')
    if (!email) return

    setIsLoading(true)
    try {
      await requestNewSshKey(subscriptionId, email)
      toast({
        title: 'Success',
        description: 'New SSH key has been generated and sent to your email',
        variant: 'default'
      })
    } catch (error: any) {
      console.error('Error requesting new SSH key:', error)
      toast({
        title: 'Request Failed',
        description: error.response?.data?.message || 'Failed to generate new SSH key',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async (action: string) => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      console.log(`Executing action: ${action}`)
      setIsLoading(false)
    }, 2000)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('packageDetail.status.active')
      case 'inactive': return t('packageDetail.status.inactive')  
      case 'expired': return t('packageDetail.status.expired')
      case 'suspended': return t('packageDetail.status.suspended')
      case 'cancelled': return t('packageDetail.status.cancelled')
      case 'pending': return t('packageDetail.status.pending')
      default: return status.toUpperCase()
    }
  }

  if (isDataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <div className="text-lg">{t('packageDetail.loading.subscription')}</div>
        </div>
      </div>
    )
  }

  if (!subscription || !packageDetail) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-600">{t('packageDetail.error.notFound')}</div>
          <Button 
            onClick={() => router.back()} 
            className="mt-4"
            variant="outline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('packageDetail.buttons.back')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('packageDetail.buttons.back')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('packageDetail.title')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('packageDetail.subtitle')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge className={getStatusColor(packageDetail.status)}>
              {getStatusLabel(packageDetail.status)}
            </Badge>
          </div>
        </div>
          {/* Server Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin máy ảo của bạn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!subscription?.vm_instance_id ? (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm text-yellow-700">
                      VM not configured yet. Configure your VM to see server details.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">{t('packageDetail.serverDetails.status')}</p>
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          vmDetails?.vm?.lifecycleState === 'RUNNING' 
                            ? 'bg-green-100 text-green-700'
                            : vmDetails?.vm?.lifecycleState === 'STOPPED'
                            ? 'bg-gray-100 text-gray-700'
                            : vmDetails?.vm?.lifecycleState === 'PROVISIONING'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {vmDetails?.vm?.lifecycleState || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('packageDetail.serverDetails.hostname')}</p>
                      <p className="font-semibold">{vmDetails?.vm?.instanceName || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('packageDetail.serverDetails.username')}</p>
                      <p className="font-semibold">root</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{t('packageDetail.serverDetails.ip')}</p>
                      {vmDetails?.vm?.publicIp ? (
                        <a href={`http://${vmDetails.vm.publicIp}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 underline">
                          {vmDetails.vm.publicIp}
                        </a>
                      ) : (
                        <p className="font-semibold text-gray-400">-</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Instance ID <span className="text-xs text-gray-400">(will be hide in production)</span></p>
                      <p className="font-semibold text-xs break-all">{vmDetails?.vm?.instanceId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Compartment ID <span className="text-xs text-gray-400">(will be hide in production)</span></p>
                      <p className="font-semibold text-xs break-all">{vmDetails?.vm?.compartmentId || 'N/A'}</p>
                    </div>
                    {vmDetails?.vm?.startedAt && (
                      <>
                        <div>
                          <p className="text-sm text-gray-600">Thời điểm bắt đầu chạy</p>
                          <p className="font-semibold">{new Date(vmDetails.vm.startedAt).toLocaleString('vi-VN')}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Uptime</p>
                          <p className="font-semibold">
                            {(() => {
                              const startTime = new Date(vmDetails.vm.startedAt).getTime()
                              const now = new Date().getTime()
                              const diff = now - startTime
                              const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                              const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
                              const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                              return `${days}d ${hours}h ${minutes}m`
                            })()}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        {/* Control Panel */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              {subscription?.vm_instance_id ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('packageDetail.controls.vmName')}
                    </label>
                    <div className="px-3 py-2 border rounded bg-gray-50">
                      <p className="text-sm font-semibold">{vmDetails?.vm?.instanceName || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shape
                    </label>
                    <div className="px-3 py-2 border rounded bg-gray-50">
                      <p className="text-sm font-semibold">{vmDetails?.vm?.shape || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region
                    </label>
                    <div className="px-3 py-2 border rounded bg-gray-50">
                      <p className="text-sm font-semibold">{vmDetails?.vm?.region || vmDetails?.vm?.availabilityDomain?.split(':')[0] || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                      onClick={() => {
                        if (vmDetails?.vm?.instanceId) {
                          window.open(`https://cloud.oracle.com/compute/instances/${vmDetails.vm.instanceId}`, '_blank')
                        }
                      }}
                      disabled={!vmDetails?.vm}
                    >
                      {t('packageDetail.controls.showPerformance')}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="col-span-4">
                  <p className="text-sm text-gray-600 mb-4">
                    No VM configured. Please configure your VM first.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        {subscription?.vm_instance_id && vmDetails?.vm?.lifecycleState === 'RUNNING' ? (
          <>
            {/* Time Range Selector */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Time Range:</span>
                    <div className="flex gap-2">
                      {(['1h', '6h', '24h', '7d'] as const).map((range) => (
                        <Button
                          key={range}
                          variant={timeRange === range ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTimeRange(range)}
                          disabled={isLoadingMetrics}
                        >
                          {range}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (vmDetails?.vm?.instanceId) {
                        setIsLoadingMetrics(true)
                        try {
                          const metricsData = await getInstanceMetrics(vmDetails.vm.instanceId, timeRange)
                          setMetrics(metricsData)
                        } finally {
                          setIsLoadingMetrics(false)
                        }
                      }
                    }}
                    disabled={isLoadingMetrics}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CPU Usage Chart */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">CPU Utilization (%)</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoadingMetrics ? (
                      <div className="flex items-center justify-center h-full">
                        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
                      </div>
                    ) : metrics?.cpu && metrics.cpu.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metrics.cpu}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="time" 
                            axisLine={false}
                            tickLine={false}
                            className="text-sm"
                          />
                          <YAxis 
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            className="text-sm"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#ef4444" 
                            fill="#fecaca" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Memory Usage Chart */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Memory Utilization (%)</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoadingMetrics ? (
                      <div className="flex items-center justify-center h-full">
                        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
                      </div>
                    ) : metrics?.memory && metrics.memory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={metrics.memory}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="time" 
                            axisLine={false}
                            tickLine={false}
                            className="text-sm"
                          />
                          <YAxis 
                            domain={[0, 100]}
                            axisLine={false}
                            tickLine={false}
                            className="text-sm"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#8b5cf6" 
                            fill="#ddd6fe" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Network Traffic Chart */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Network Traffic (MB/s)</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoadingMetrics ? (
                      <div className="flex items-center justify-center h-full">
                        <RefreshCw className="h-8 w-8 animate-spin text-green-500" />
                      </div>
                    ) : getNetworkData().length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getNetworkData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="time" 
                            axisLine={false}
                            tickLine={false}
                            className="text-sm"
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            className="text-sm"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="in" 
                            stackId="1"
                            stroke="#10b981" 
                            fill="#d1fae5" 
                            strokeWidth={2}
                            name="In"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="out" 
                            stackId="1"
                            stroke="#3b82f6" 
                            fill="#bfdbfe" 
                            strokeWidth={2}
                            name="Out"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Disk I/O Chart */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Disk I/O (MB/s)</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoadingMetrics ? (
                      <div className="flex items-center justify-center h-full">
                        <RefreshCw className="h-8 w-8 animate-spin text-orange-500" />
                      </div>
                    ) : getDiskData().length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getDiskData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="time" 
                            axisLine={false}
                            tickLine={false}
                            className="text-sm"
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            className="text-sm"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="read" 
                            stackId="1"
                            stroke="#f59e0b" 
                            fill="#fed7aa" 
                            strokeWidth={2}
                            name="Read"
                          />
                          <Area 
                            type="monotone" 
                            dataKey="write" 
                            stackId="1"
                            stroke="#ef4444" 
                            fill="#fecaca" 
                            strokeWidth={2}
                            name="Write"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <p>No data available</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 text-gray-500">
                <p>
                  {subscription?.vm_instance_id 
                    ? 'Charts available when VM is running' 
                    : 'Charts available after VM configuration'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Package Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Package Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t('packageDetail.packageInfo.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.packageName')}</p>
                  <p className="font-semibold">{packageDetail.packageName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.vmName')}</p>
                  <p className="font-semibold">{vmDetails?.vm?.instanceName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.cpu')}</p>
                  <p className="font-semibold">{packageDetail.cpu || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.memory')}</p>
                  <p className="font-semibold">{packageDetail.memory || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.storage')}</p>
                  <p className="font-semibold">{packageDetail.storage || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.bandwidth')}</p>
                  <p className="font-semibold">{packageDetail.bandwidth || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.feature')}</p>
                  <p className="font-semibold">{packageDetail.feature || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.ipAddress')}</p>
                  <p className="font-semibold">{vmDetails?.vm?.publicIp || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.subscriber')}</p>
                  <p className="font-semibold">
                    {packageDetail.user ? 
                      `${packageDetail.user.firstName} ${packageDetail.user.lastName}` : 
                      '-'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.email')}</p>
                  <p className="font-semibold">{packageDetail.user?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.startDate')}</p>
                  <p className="font-semibold">{packageDetail.startDate || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.endDate')}</p>
                  <p className="font-semibold">{packageDetail.endDate || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.autoRenew')}</p>
                  <p className="font-semibold">
                    <Badge variant={packageDetail.autoRenew ? 'default' : 'outline'}>
                      {packageDetail.autoRenew ? t('packageDetail.packageInfo.yes') : t('packageDetail.packageInfo.no')}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.monthlyCost')}</p>
                  <p className="font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(packageDetail.monthlyPrice)}
                  </p>
                </div>
                {vmDetails && vmDetails.vm && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">VM Shape</p>
                      <p className="font-semibold">{vmDetails.vm.shape || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Region</p>
                      <p className="font-semibold">{vmDetails.vm.region || vmDetails.vm.availabilityDomain?.split(':')[0] || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">VM Status</p>
                      <p className="font-semibold">{vmDetails.vm.lifecycleState || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created Date</p>
                      <p className="font-semibold">
                        {vmDetails.vm.createdAt ? new Date(vmDetails.vm.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('packageDetail.actions.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!subscription?.vm_instance_id ? (
                <div className="space-y-3">
                  <p className="text-sm text-yellow-600 mb-3">VM not configured yet</p>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => router.push(`/cloud/configuration/${subscriptionId}`)}
                  >
                    Configure VM
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-3">
                    {vmDetails && vmDetails.vm && (
                      <>
                        <p className="text-sm text-gray-600">
                          <strong>VM State:</strong> {vmDetails.vm.lifecycleState}
                        </p>
                        {vmDetails.vm.publicIp && (
                          <p className="text-sm text-gray-600">
                            <strong>Public IP:</strong> {vmDetails.vm.publicIp}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleVmAction('START')}
                    disabled={isLoading || vmDetails?.vm?.lifecycleState === 'RUNNING' || vmDetails?.vm?.lifecycleState === 'PROVISIONING'}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {t('packageDetail.actions.startVM')}
                  </Button>
                  
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleVmAction('STOP')}
                    disabled={isLoading || vmDetails?.vm?.lifecycleState === 'STOPPED' || vmDetails?.vm?.lifecycleState === 'PROVISIONING'}
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    {t('packageDetail.actions.pauseVM')}
                  </Button>
                  
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleVmAction('RESTART')}
                    disabled={isLoading || vmDetails?.vm?.lifecycleState !== 'RUNNING'}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    {t('packageDetail.actions.restartVM')}
                  </Button>
                  
                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={handleRequestNewKey}
                    disabled={isLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Request New SSH Key
                  </Button>

                  <Button 
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => handleAction('console')}
                    disabled={isLoading}
                  >
                    <Terminal className="h-4 w-4 mr-2" />
                    {t('packageDetail.actions.console')}
                  </Button>
                </>
              )}

              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleAction('backup')}
                disabled={isLoading}
              >
                <MonitorUp className="h-4 w-4 mr-2" />
                {t('packageDetail.actions.changeOS')}
              </Button>
              
              
              <div className="pt-2 border-t">
                <Button 
                  className="w-full justify-start"
                  variant="destructive"
                  onClick={() => handleAction('delete')}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('packageDetail.actions.deletePackage')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('packageDetail.billing.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">{t('packageDetail.billing.createdDate')}</p>
                <p className="text-xl font-bold text-blue-600">{packageDetail.createdAt}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">{t('packageDetail.billing.nextBilling')}</p>
                <p className="text-xl font-bold text-green-600">{packageDetail.nextBilling}</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">{t('packageDetail.billing.monthlyCost')}</p>
                <p className="text-xl font-bold text-purple-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                  }).format(packageDetail.monthlyPrice)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}