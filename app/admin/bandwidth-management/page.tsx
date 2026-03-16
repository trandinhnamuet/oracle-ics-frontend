'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  AlertTriangle,
  ArrowUpDown,
  CheckCircle,
  Database,
  Filter,
  Info,
  RefreshCw,
  Server,
  TrendingUp,
  Users,
} from 'lucide-react'
import { getAllVmsBandwidth } from '@/api/bandwidth.api'
import { useTranslation } from 'react-i18next'

interface BandwidthData {
  egressTB: number
  ingressTB: number
  usagePercentage: number
  remainingTB: number
  exceededTB: number
  limitTB: number
  isOverLimit: boolean
  isNearLimit: boolean
  bytesIn: number
  bytesOut: number
  dataSource: 'oci' | 'archived' | 'none' | 'error'
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
  month: string
}

interface BandwidthSummary {
  totalVMs: number
  overLimitVMs: number
  nearLimitVMs: number
  totalEgressTB: number
  averageUsagePercentage: number
}

interface BandwidthResponse {
  summary: BandwidthSummary
  vms: VmBandwidth[]
}

export default function BandwidthManagementPage() {
  const { t } = useTranslation()

  // Generate last 6 months (current + 5 previous)
  const monthOptions = useMemo(() => {
    const options: { value: string; label: string }[] = []
    const now = new Date()
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
      options.push({
        value,
        label: i === 0 ? `${label} ${t('admin.bandwidth.month.current')}` : label,
      })
    }
    return options
  }, [t])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [data, setData] = useState<BandwidthResponse | null>(null)
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [filterStatus, setFilterStatus] = useState<'all' | 'over' | 'near' | 'normal'>('all')
  const [sortBy, setSortBy] = useState<'usage' | 'name' | 'user'>('usage')

  useEffect(() => {
    fetchBandwidthData()
  }, [month])

  const fetchBandwidthData = async () => {
    try {
      setLoading(true)
      const response = await getAllVmsBandwidth(month)
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
    const i = Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusBadge = (bandwidth: BandwidthData) => {
    if (bandwidth.dataSource === 'error') {
      return <Badge variant="secondary">{t('admin.bandwidth.status.error')}</Badge>
    }
    if (bandwidth.isOverLimit) {
      return <Badge variant="destructive" className="animate-pulse">{t('admin.bandwidth.status.overLimit')}</Badge>
    }
    if (bandwidth.isNearLimit) {
      return <Badge variant="default" className="bg-orange-500">{t('admin.bandwidth.status.warning')}</Badge>
    }
    return <Badge variant="default" className="bg-green-500">{t('admin.bandwidth.status.normal')}</Badge>
  }

  const getSourceBadge = (source: string) => {
    if (source === 'oci') {
      return <Badge variant="outline" className="text-green-600 border-green-500">{t('admin.bandwidth.source.oci')}</Badge>
    }
    if (source === 'archived') {
      return <Badge variant="outline" className="text-blue-600 border-blue-500">{t('admin.bandwidth.source.archived')}</Badge>
    }
    return <Badge variant="outline" className="text-gray-500">{t('admin.bandwidth.source.none')}</Badge>
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
    if (sortBy === 'usage') return (b.bandwidth.usagePercentage || 0) - (a.bandwidth.usagePercentage || 0)
    if (sortBy === 'name') return a.instanceName.localeCompare(b.instanceName)
    if (sortBy === 'user') return a.userName.localeCompare(b.userName)
    return 0
  })

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg">{t('admin.bandwidth.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('admin.bandwidth.title')}</h1>
          <p className="text-muted-foreground">
            {t('admin.bandwidth.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{t('admin.bandwidth.month.label')}</span>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-4 py-2 border rounded-md bg-background"
          >
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {t('admin.bandwidth.refresh')}
          </Button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-700 dark:text-blue-300">{t('admin.bandwidth.info.text')}</p>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{t('admin.bandwidth.summary.totalVMs')}</p>
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
                  <p className="text-sm opacity-90">{t('admin.bandwidth.summary.overLimit')}</p>
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
                  <p className="text-sm opacity-90">{t('admin.bandwidth.summary.nearLimit')}</p>
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
                  <p className="text-sm opacity-90">{t('admin.bandwidth.summary.totalEgress')}</p>
                  <p className="text-3xl font-bold">{data.summary.totalEgressTB.toFixed(2)} TB</p>
                </div>
                <Database className="h-12 w-12 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{t('admin.bandwidth.summary.average')}</p>
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
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">{t('admin.bandwidth.filter.label')}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                {t('admin.bandwidth.filter.all')} ({data?.vms.length || 0})
              </Button>
              <Button
                variant={filterStatus === 'over' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('over')}
              >
                {t('admin.bandwidth.filter.over')} ({data?.summary.overLimitVMs || 0})
              </Button>
              <Button
                variant={filterStatus === 'near' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('near')}
              >
                {t('admin.bandwidth.filter.near')} ({data?.summary.nearLimitVMs || 0})
              </Button>
              <Button
                variant={filterStatus === 'normal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('normal')}
              >
                {t('admin.bandwidth.filter.normal')}
              </Button>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              <span className="font-medium">{t('admin.bandwidth.sort.label')}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'usage' | 'name' | 'user')}
                className="px-3 py-1 border rounded-md bg-background"
              >
                <option value="usage">{t('admin.bandwidth.sort.usage')}</option>
                <option value="name">{t('admin.bandwidth.sort.name')}</option>
                <option value="user">{t('admin.bandwidth.sort.user')}</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* VM List */}
      <div className="space-y-4">
        {sortedVMs.map((vm) => (
          <Card
            key={vm.vmId}
            className={
              vm.bandwidth.isOverLimit ? 'border-red-500 border-2' :
              vm.bandwidth.isNearLimit ? 'border-orange-500 border-2' : ''
            }
          >
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* VM Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-xl font-bold">{vm.instanceName}</h3>
                      {getStatusBadge(vm.bandwidth)}
                      <Badge variant="outline">{vm.lifecycleState}</Badge>
                      {getSourceBadge(vm.bandwidth.dataSource)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{vm.userName}</span>
                      </div>
                      <div>Email: {vm.userEmail}</div>
                      <div>IP: {vm.publicIp || 'N/A'}</div>
                      <div>{t('admin.bandwidth.details.package')}: {vm.packageName}</div>
                      {vm.companyName && <div>{t('admin.bandwidth.details.company')}: {vm.companyName}</div>}
                    </div>
                  </div>
                </div>

                {/* Egress Usage Bar */}
                {vm.bandwidth.dataSource !== 'error' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {t('admin.bandwidth.details.egress')}: {(vm.bandwidth.egressTB ?? 0).toFixed(4)} TB / {vm.bandwidth.limitTB} TB
                      </span>
                      <span className="font-bold text-lg">
                        {(vm.bandwidth.usagePercentage ?? 0).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                      <div
                        className={`h-full ${getProgressBarColor(vm.bandwidth.usagePercentage || 0)} transition-all duration-500 flex items-center justify-center text-white text-xs font-bold`}
                        style={{ width: `${Math.min(vm.bandwidth.usagePercentage || 0, 100)}%` }}
                      >
                        {(vm.bandwidth.usagePercentage || 0) >= 10 && `${(vm.bandwidth.usagePercentage || 0).toFixed(1)}%`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Bandwidth Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t('admin.bandwidth.details.ingress')}</p>
                    <p className="text-lg font-bold">{formatBytes(vm.bandwidth.bytesIn || 0)}</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-950 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t('admin.bandwidth.details.egress')}</p>
                    <p className="text-lg font-bold">{formatBytes(vm.bandwidth.bytesOut || 0)}</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t('admin.bandwidth.details.remaining')}</p>
                    <p className="text-lg font-bold">
                      {(vm.bandwidth.remainingTB || 0) > 0 ? `${(vm.bandwidth.remainingTB || 0).toFixed(4)} TB` : '0 TB'}
                    </p>
                  </div>
                  {vm.bandwidth.isOverLimit ? (
                    <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg border-2 border-red-500">
                      <p className="text-xs text-muted-foreground mb-1">{t('admin.bandwidth.details.exceeded')}</p>
                      <p className="text-lg font-bold text-red-600 dark:text-red-400">
                        +{(vm.bandwidth.exceededTB || 0).toFixed(4)} TB
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t('admin.bandwidth.details.dataSource')}</p>
                      <p className="text-sm font-medium">
                        {vm.bandwidth.dataSource === 'oci' ? t('admin.bandwidth.source.oci') :
                         vm.bandwidth.dataSource === 'archived' ? t('admin.bandwidth.source.archived') :
                         t('admin.bandwidth.source.none')}
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
                        {t('admin.bandwidth.warning.overLimitTitle')}
                      </p>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        {t('admin.bandwidth.warning.overLimitMessage', { exceeded: (vm.bandwidth.exceededTB || 0).toFixed(4) })}
                      </p>
                    </div>
                  </div>
                )}
                {vm.bandwidth.isNearLimit && !vm.bandwidth.isOverLimit && (
                  <div className="bg-orange-50 dark:bg-orange-950 border border-orange-500 rounded-lg p-4 flex items-start gap-3">
                    <Activity className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-orange-700 dark:text-orange-400">
                        {t('admin.bandwidth.warning.nearLimitTitle')}
                      </p>
                      <p className="text-sm text-orange-600 dark:text-orange-300">
                        {t('admin.bandwidth.warning.nearLimitMessage', { usage: (vm.bandwidth.usagePercentage || 0).toFixed(2), remaining: (vm.bandwidth.remainingTB || 0).toFixed(4) })}
                      </p>
                    </div>
                  </div>
                )}
                {vm.bandwidth.dataSource === 'error' && (
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-300 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      {t('admin.bandwidth.warning.errorMessage', { error: vm.bandwidth.error })}
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
              <p className="text-lg text-muted-foreground">{t('admin.bandwidth.noVms')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
