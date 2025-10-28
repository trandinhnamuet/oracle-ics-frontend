'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const [selectedVM, setSelectedVM] = useState('1365442-01')
  const [selectedTime, setSelectedTime] = useState('1 hour ago')
  const [selectedTheme, setSelectedTheme] = useState('Light')
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(true)

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
          ipAddress: '192.168.1.100', // This would come from VM management system
          createdAt: new Date(data.created_at).toLocaleDateString('vi-VN'),
          startDate: new Date(data.start_date).toLocaleDateString('vi-VN'),
          endDate: new Date(data.end_date).toLocaleDateString('vi-VN'),
          nextBilling: new Date(data.end_date).toLocaleDateString('vi-VN'),
          monthlyPrice: data.cloudPackage?.cost_vnd ? parseFloat(data.cloudPackage.cost_vnd) : 0,
          autoRenew: data.auto_renew,
          user: data.user
        }
        setPackageDetail(detail)
        setSelectedVM(`VM-${data.id.slice(-8)}`)
        
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
          {/* Server Details Demo Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <CardTitle>{t('packageDetail.serverDetails.title')}</CardTitle>
                <Badge className="ml-2 bg-blue-500 text-white text-xs font-semibold">{t('packageDetail.serverDetails.demoData')}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">{t('packageDetail.serverDetails.status')}</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">{t('packageDetail.serverDetails.on')}</span>
                      <Button variant="link" size="sm" className="p-0 h-auto min-h-0">{t('packageDetail.serverDetails.refresh')}</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('packageDetail.serverDetails.hostname')}</p>
                    <p className="font-semibold">trandinhnamz.xyz</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('packageDetail.serverDetails.username')}</p>
                    <p className="font-semibold">root</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('packageDetail.serverDetails.password')}</p>
                    <div className="flex items-center gap-2">
                      <input type="password" value="password-demo" readOnly className="border rounded px-2 py-1 text-sm w-32" />
                      <Button variant="ghost" size="icon" className="h-7 w-7"><span role="img" aria-label="eye">👁️</span></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7"><span role="img" aria-label="key">🔑</span></Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('packageDetail.serverDetails.ip')}</p>
                    <a href="http://160.22.161.44" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 underline">160.22.161.44</a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('packageDetail.serverDetails.uptime')}</p>
                    <p className="font-semibold">2 {t('packageDetail.serverDetails.days')} 17:41:14</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Control Panel */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('packageDetail.controls.vmName')}
                </label>
                <Select value={selectedVM} onValueChange={setSelectedVM}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1365442-01">1365442-01</SelectItem>
                    <SelectItem value="1365442-02">1365442-02</SelectItem>
                    <SelectItem value="1365442-03">1365442-03</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('packageDetail.controls.time')}
                </label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 hour ago">{t('packageDetail.controls.timeOptions.oneHour')}</SelectItem>
                    <SelectItem value="6 hours ago">{t('packageDetail.controls.timeOptions.sixHours')}</SelectItem>
                    <SelectItem value="24 hours ago">{t('packageDetail.controls.timeOptions.twentyFourHours')}</SelectItem>
                    <SelectItem value="7 days ago">{t('packageDetail.controls.timeOptions.sevenDays')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('packageDetail.controls.theme')}
                </label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Light">{t('packageDetail.controls.themeOptions.light')}</SelectItem>
                    <SelectItem value="Dark">{t('packageDetail.controls.themeOptions.dark')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button 
                  className="bg-red-500 hover:bg-red-600 text-white px-8"
                  onClick={() => handleAction('show-performance')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  {t('packageDetail.controls.showPerformance')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPU Usage Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">{t('packageDetail.charts.cpuUsage')}</CardTitle>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cpuData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      className="text-sm"
                    />
                    <YAxis 
                      domain={[0, 125]}
                      axisLine={false}
                      tickLine={false}
                      className="text-sm"
                    />
                    <Area 
                      type="stepAfter" 
                      dataKey="usage" 
                      stroke="#ef4444" 
                      fill="#fecaca" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Memory Usage Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">{t('packageDetail.charts.memoryUsage')}</CardTitle>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={memoryData}>
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
                      type="stepAfter" 
                      dataKey="usage" 
                      stroke="#8b5cf6" 
                      fill="#ddd6fe" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  <p className="font-semibold">{packageDetail.packageName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.vmName')}</p>
                  <p className="font-semibold">{packageDetail.vmName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.cpu')}</p>
                  <p className="font-semibold">{packageDetail.cpu}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.memory')}</p>
                  <p className="font-semibold">{packageDetail.memory}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.storage')}</p>
                  <p className="font-semibold">{packageDetail.storage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.bandwidth')}</p>
                  <p className="font-semibold">{packageDetail.bandwidth}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.feature')}</p>
                  <p className="font-semibold">{packageDetail.feature}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.ipAddress')}</p>
                  <p className="font-semibold">{packageDetail.ipAddress}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.subscriber')}</p>
                  <p className="font-semibold">
                    {packageDetail.user ? 
                      `${packageDetail.user.firstName} ${packageDetail.user.lastName}` : 
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.email')}</p>
                  <p className="font-semibold">{packageDetail.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.startDate')}</p>
                  <p className="font-semibold">{packageDetail.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('packageDetail.packageInfo.endDate')}</p>
                  <p className="font-semibold">{packageDetail.endDate}</p>
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
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('packageDetail.actions.title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleAction('start')}
                disabled={isLoading || packageDetail.status === 'active'}
              >
                <Play className="h-4 w-4 mr-2" />
                {t('packageDetail.actions.startVM')}
              </Button>
              
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleAction('pause')}
                disabled={isLoading || packageDetail.status === 'suspended'}
              >
                <Pause className="h-4 w-4 mr-2" />
                {t('packageDetail.actions.pauseVM')}
              </Button>
              
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleAction('restart')}
                disabled={isLoading}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('packageDetail.actions.restartVM')}
              </Button>
              
              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleAction('backup')}
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                {t('packageDetail.actions.createBackup')}
              </Button>

              <Button 
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleAction('backup')}
                disabled={isLoading}
              >
                <Terminal className="h-4 w-4 mr-2" />
                {t('packageDetail.actions.console')}
              </Button>

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

              <div className="pt-4 border-t mt-4">
                <Button 
                  className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                  onClick={() => router.push('/cloud/configuration')}
                >
                  <MonitorUp className="h-5 w-5 mr-2" />
                  {t('packageDetail.actions.configurateVM')}
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