'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Server, 
  Users,
  Database,
  ArrowUpDown,
  RefreshCw,
  Filter,
} from 'lucide-react'
import { getAllVmsBandwidth } from '@/api/bandwidth.api'
import { useTranslation } from 'react-i18next'

interface BandwidthData {
  totalTB: number
  usagePercentage: number
  remainingTB: number
  exceededTB: number
  limitTB: number
  isOverLimit: boolean
  isNearLimit: boolean
  bytesIn: number
  bytesOut: number
  totalBytes: number
  error?: string
}

interface VmBandwidth {
  vmId: number
  instanceId: string
  instanceName: string
  publicIp: string
  lifecycleState: string
  userId: number
  userEmail: string
  userName: string
  companyName: string
  subscriptionId: string
  subscriptionStatus: string
  packageName: string
  vmCreatedAt: string
  bandwidth: BandwidthData
  timeRange: {
    startTime: string
    endTime: string
    range: string
  }
}

interface BandwidthSummary {
  totalVMs: number
  overLimitVMs: number
  nearLimitVMs: number
  totalBandwidthUsedTB: number
  averageUsagePercentage: number
}

interface BandwidthResponse {
  summary: BandwidthSummary
  vms: VmBandwidth[]
}

export default function BandwidthManagementPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<BandwidthResponse | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [filterStatus, setFilterStatus] = useState<'all' | 'over' | 'near' | 'normal'>('all')
  const [sortBy, setSortBy] = useState<'usage' | 'name' | 'user'>('usage')

  useEffect(() => {
    fetchBandwidthData()
  }, [timeRange])

  const fetchBandwidthData = async () => {
    try {
      setLoading(true)
      const response = await getAllVmsBandwidth(timeRange)
      if (response.success) {
        setData(response.data)
      }
    } catch (error) {
      console.error('Error fetching bandwidth data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchBandwidthData()
    setRefreshing(false)
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusBadge = (bandwidth: BandwidthData) => {
    if (bandwidth.error) {
      return <Badge variant="secondary">Error</Badge>
    }
    if (bandwidth.isOverLimit) {
      return <Badge variant="destructive" className="animate-pulse">Vượt giới hạn</Badge>
    }
    if (bandwidth.isNearLimit) {
      return <Badge variant="default" className="bg-orange-500">Cảnh báo</Badge>
    }
    return <Badge variant="default" className="bg-green-500">Bình thường</Badge>
  }

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-orange-500'
    if (percentage >= 60) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const filteredVMs = data?.vms.filter(vm => {
    if (filterStatus === 'all') return true
    if (filterStatus === 'over') return vm.bandwidth.isOverLimit
    if (filterStatus === 'near') return vm.bandwidth.isNearLimit
    if (filterStatus === 'normal') return !vm.bandwidth.isOverLimit && !vm.bandwidth.isNearLimit
    return true
  }) || []

  const sortedVMs = [...filteredVMs].sort((a, b) => {
    if (sortBy === 'usage') {
      return (b.bandwidth.usagePercentage || 0) - (a.bandwidth.usagePercentage || 0)
    }
    if (sortBy === 'name') {
      return a.instanceName.localeCompare(b.instanceName)
    }
    if (sortBy === 'user') {
      return a.userName.localeCompare(b.userName)
    }
    return 0
  })

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg">Đang tải dữ liệu băng thông...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Giám sát Băng thông</h1>
          <p className="text-muted-foreground">
            Theo dõi và kiểm tra băng thông của tất cả các máy ảo
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background"
          >
            <option value="24h">24 giờ</option>
            <option value="7d">7 ngày</option>
            <option value="30d">30 ngày</option>
            <option value="90d">90 ngày</option>
          </select>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Tổng số VM</p>
                  <p className="text-3xl font-bold">{data.summary.totalVMs}</p>
                </div>
                <Server className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Vượt giới hạn</p>
                  <p className="text-3xl font-bold">{data.summary.overLimitVMs}</p>
                </div>
                <AlertTriangle className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Gần giới hạn</p>
                  <p className="text-3xl font-bold">{data.summary.nearLimitVMs}</p>
                </div>
                <Activity className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Tổng băng thông</p>
                  <p className="text-3xl font-bold">{data.summary.totalBandwidthUsedTB.toFixed(2)} TB</p>
                </div>
                <Database className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Trung bình</p>
                  <p className="text-3xl font-bold">{data.summary.averageUsagePercentage.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Lọc:</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                Tất cả ({data?.vms.length || 0})
              </Button>
              <Button
                variant={filterStatus === 'over' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('over')}
              >
                Vượt giới hạn ({data?.summary.overLimitVMs || 0})
              </Button>
              <Button
                variant={filterStatus === 'near' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('near')}
              >
                Cảnh báo ({data?.summary.nearLimitVMs || 0})
              </Button>
              <Button
                variant={filterStatus === 'normal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('normal')}
              >
                Bình thường
              </Button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span className="font-medium">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded-md bg-background"
              >
                <option value="usage">Mức sử dụng</option>
                <option value="name">Tên VM</option>
                <option value="user">Người dùng</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VM List */}
      <div className="space-y-4">
        {sortedVMs.map((vm) => (
          <Card key={vm.vmId} className={`
            ${vm.bandwidth.isOverLimit ? 'border-red-500 border-2' : ''}
            ${vm.bandwidth.isNearLimit ? 'border-orange-500 border-2' : ''}
          `}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* VM Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{vm.instanceName}</h3>
                      {getStatusBadge(vm.bandwidth)}
                      <Badge variant="outline">{vm.lifecycleState}</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{vm.userName}</span>
                      </div>
                      <div>Email: {vm.userEmail}</div>
                      <div>IP: {vm.publicIp || 'N/A'}</div>
                      <div>Gói: {vm.packageName}</div>
                      {vm.companyName && <div>Công ty: {vm.companyName}</div>}
                    </div>
                  </div>
                </div>

                {/* Bandwidth Usage Bar */}
                {!vm.bandwidth.error && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        Băng thông: {vm.bandwidth.totalTB.toFixed(4)} TB / {vm.bandwidth.limitTB} TB
                      </span>
                      <span className="font-bold text-lg">
                        {vm.bandwidth.usagePercentage.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full ${getProgressBarColor(vm.bandwidth.usagePercentage)} transition-all duration-500 flex items-center justify-center text-white text-xs font-bold`}
                        style={{ width: `${Math.min(vm.bandwidth.usagePercentage, 100)}%` }}
                      >
                        {vm.bandwidth.usagePercentage >= 10 && `${vm.bandwidth.usagePercentage.toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bandwidth Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Tải xuống</p>
                    <p className="text-lg font-bold">{formatBytes(vm.bandwidth.bytesIn)}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Tải lên</p>
                    <p className="text-lg font-bold">{formatBytes(vm.bandwidth.bytesOut)}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Còn lại</p>
                    <p className="text-lg font-bold">
                      {vm.bandwidth.remainingTB > 0 ? `${vm.bandwidth.remainingTB.toFixed(4)} TB` : '0 TB'}
                    </p>
                  </div>
                  {vm.bandwidth.isOverLimit && (
                    <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border-2 border-red-500">
                      <p className="text-xs text-muted-foreground mb-1">Vượt quá</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        +{vm.bandwidth.exceededTB.toFixed(4)} TB
                      </p>
                    </div>
                  )}
                </div>

                {/* Warning Messages */}
                {vm.bandwidth.isOverLimit && (
                  <div className="bg-red-50 dark:bg-red-950 border border-red-500 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-red-700 dark:text-red-400">
                        Cảnh báo: Vượt quá giới hạn băng thông!
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        VM này đã sử dụng vượt quá {vm.bandwidth.exceededTB.toFixed(4)} TB so với giới hạn cho phép (10 TB). 
                        Vui lòng liên hệ với người dùng để xử lý.
                      </p>
                    </div>
                  </div>
                )}
                {vm.bandwidth.isNearLimit && !vm.bandwidth.isOverLimit && (
                  <div className="bg-orange-50 dark:bg-orange-950 border border-orange-500 rounded-lg p-4 flex items-start gap-3">
                    <Activity className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-orange-700 dark:text-orange-400">
                        Cảnh báo: Sắp đạt giới hạn băng thông!
                      </p>
                      <p className="text-sm text-orange-600 dark:text-orange-300">
                        VM này đã sử dụng {vm.bandwidth.usagePercentage.toFixed(2)}% băng thông. 
                        Còn lại {vm.bandwidth.remainingTB.toFixed(4)} TB trước khi đạt giới hạn.
                      </p>
                    </div>
                  </div>
                )}

                {vm.bandwidth.error && (
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-300 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      Không thể lấy dữ liệu băng thông: {vm.bandwidth.error}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedVMs.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Không có VM nào phù hợp với bộ lọc hiện tại
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
