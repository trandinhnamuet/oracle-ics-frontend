'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '@/lib/auth-context'
import { getUserSubscriptions, getActiveSubscriptions, updateSubscription, deleteSubscription, suspendSubscription, reactivateSubscription, renewSubscription, toggleAutoRenew, Subscription } from '@/api/subscription.api'
import { performVmAction, getSubscriptionVm } from '@/api/vm-subscription.api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, Calendar, Clock, AlertTriangle, Settings, Play, Pause, Trash2, Eye, Loader2, RefreshCw } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { formatDateOnly } from '@/lib/utils'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import BalanceDisplay from '@/components/wallet/balance-display'
import WalletSidebar from '@/components/wallet/wallet-sidebar'

interface PackageSubscription {
  id: string
  user_id: number
  cloud_package_id: number
  start_date: string
  end_date: string
  status: 'active' | 'inactive' | 'pending' | 'expired' | 'suspended' | 'cancelled'
  auto_renew: boolean
  created_at: string
  updated_at: string
  vm_instance_id?: number | null // Foreign key to VM instance
  // Thông tin từ bảng cloud_packages
  cloudPackage?: {
    id: number
    name: string
    type: string
    cost: string | number
    cost_vnd: string | number
    cpu: string
    ram: string
    memory: string
    feature: string
    bandwidth: string
  }
  // Thông tin từ bảng vm_instances
  vmInstance?: {
    id: number
    instance_name: string
    instance_id?: string
    public_ip?: string | null
    private_ip?: string | null
    lifecycle_state: string
    region?: string
    shape?: string
    operating_system?: string
    operating_system_version?: string
    image_name?: string
    created_at?: string
  } | null
}

export default function PackageManagementPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuth()
  const [subscriptions, setSubscriptions] = useState<PackageSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isVisible, setIsVisible] = useState(false)
  const [togglingVmIds, setTogglingVmIds] = useState<Set<string>>(new Set())
  const [renewingIds, setRenewingIds] = useState<Set<string>>(new Set())
  const [togglingAutoRenewIds, setTogglingAutoRenewIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    title: string
    description: string
    onConfirm: () => Promise<void>
  }>({ open: false, title: '', description: '', onConfirm: async () => {} })
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const pollingAttemptsRef = useRef(0)
  const MAX_POLL_ATTEMPTS = 20 // ~2 phút với interval 6 giây
  const STABLE_STATES = ['RUNNING', 'STOPPED', 'TERMINATED']

  // Fetch user subscriptions
  const fetchUserSubscriptions = useCallback(async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      // Get all subscriptions (not just active ones)
      const allSubscriptions = await getUserSubscriptions(Number(user.id))
      setSubscriptions(allSubscriptions || [])
    } catch (error: any) {
      console.error('Error fetching user subscriptions:', error)
      setSubscriptions([])
      
      // Show user-friendly error message in Vietnamese
      const errorMessage = error?.response?.status === 500 
        ? t('packageManagement.fetchError.system')
        : t('packageManagement.fetchError.network')
      
      toast({ title: t('packageManagement.fetchError.title'), description: errorMessage, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
      pollingAttemptsRef.current = 0
    }
  }

  const startPollingUntilStable = () => {
    stopPolling()
    pollingAttemptsRef.current = 0
    pollingRef.current = setInterval(async () => {
      pollingAttemptsRef.current += 1
      await fetchUserSubscriptions()
      // Kiểm tra xem tất cả VM đã về trạng thái ổn định chưa
      setSubscriptions(prev => {
        const allStable = prev.every(s =>
          !s.vmInstance || STABLE_STATES.includes(s.vmInstance.lifecycle_state)
        )
        if (allStable || pollingAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
          stopPolling()
        }
        return prev
      })
    }, 6000)
  }

  useEffect(() => {
    fetchUserSubscriptions()
    return () => stopPolling()
  }, [user?.id])

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter(sub => {
    const packageName = sub.cloudPackage?.name || 'N/A'
    const packageType = sub.cloudPackage?.type || 'N/A'
    
    const matchesSearch = 
      packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      packageType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    const matchesType = typeFilter === 'all' || packageType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Get package type badge variant
  const getTypeVariant = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'starter': return 'secondary'
      case 'professional': return 'default'
      case 'enterprise': return 'destructive'
      case 'custom': return 'outline'
      default: return 'secondary'
    }
  }

  // Get status badge variant
  const getStatusVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'secondary'
  }

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  // Handle VM start/stop actions
  const toggleVmStatus = async (id: string) => {
    const subscription = subscriptions.find(s => s.id === id)
    if (!subscription) return

    if (!subscription.vm_instance_id) {
      toast({ title: t('packageManagement.toast.vmNotConfigured'), variant: 'destructive' })
      return
    }

    const vmState = subscription.vmInstance?.lifecycle_state
    const action = vmState === 'RUNNING' ? 'STOP' : 'START'
    const isStop = action === 'STOP'
    const optimisticState = isStop ? 'STOPPING' : 'STARTING'

    setConfirmDialog({
      open: true,
      title: isStop ? t('packageManagement.confirmDialog.stopVm.title') : t('packageManagement.confirmDialog.startVm.title'),
      description: isStop ? t('packageManagement.confirmDialog.stopVm.description') : t('packageManagement.confirmDialog.startVm.description'),
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }))
        // Optimistic update: show transitioning state immediately
        setSubscriptions(prev => prev.map(s => {
          if (s.id !== id || !s.vmInstance) return s
          return { ...s, vmInstance: { ...s.vmInstance, lifecycle_state: optimisticState } }
        }))
        setTogglingVmIds(prev => new Set(prev).add(id))

        try {
          await performVmAction(id, action)
          toast({
            title: isStop ? t('packageManagement.toast.vmStopSent') : t('packageManagement.toast.vmStartSent'),
            description: t('packageManagement.toast.vmActionPending'),
          })
          startPollingUntilStable()
        } catch (error: any) {
          console.error('Error toggling VM status:', error)
          // Revert optimistic update on error
          await fetchUserSubscriptions()
          toast({
            title: isStop ? t('packageManagement.toast.vmStopError') : t('packageManagement.toast.vmStartError'),
            description: error?.response?.data?.message || error?.message || 'Vui lòng thử lại sau',
            variant: 'destructive',
          })
        } finally {
          setTogglingVmIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        }
      },
    })
  }

  const handleRenewSubscription = (id: string) => {
    const sub = subscriptions.find(s => s.id === id)
    if (!sub) return
    const pkgName = sub.cloudPackage?.name || t('packageManagement.table.customPackage')
    const cost = Number(sub.cloudPackage?.cost_vnd || 0)
    const fmtCost = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cost)
    setConfirmDialog({
      open: true,
      title: t('packageManagement.confirmDialog.renewSubscription.title'),
      description: t('packageManagement.confirmDialog.renewSubscription.description', { packageName: pkgName, cost: fmtCost }),
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }))
        setRenewingIds(prev => new Set(prev).add(id))
        try {
          await renewSubscription(id)
          toast({
            title: t('packageManagement.toast.renewSuccess'),
            description: t('packageManagement.toast.renewSuccessDesc'),
          })
          await fetchUserSubscriptions()
          startPollingUntilStable()
        } catch (error: any) {
          const msg = error?.response?.data?.message || error?.message || t('packageManagement.toast.renewError')
          const isInsufficientFunds = msg.includes('không đủ tiền') || msg.includes('insufficient')
          toast({
            title: t('packageManagement.toast.renewFailed'),
            description: isInsufficientFunds
              ? t('packageManagement.toast.renewInsufficientFunds')
              : msg,
            variant: 'destructive',
          })
        } finally {
          setRenewingIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        }
      },
    })
  }

  const cancelUserSubscription = (id: string) => {
    setConfirmDialog({
      open: true,
      title: t('packageManagement.confirmDialog.deleteSubscription.title'),
      description: t('packageManagement.confirmDialog.deleteSubscription.description'),
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, open: false }))
        setLoading(true)
        try {
          await deleteSubscription(id)
          setSubscriptions(prev => prev.filter(sub => sub.id !== id))
          toast({ title: t('packageManagement.toast.deleteSuccess') })
        } catch (error: any) {
          console.error('Error deleting subscription:', error)
          toast({
            title: t('packageManagement.toast.deleteError'),
            description: error?.message || 'Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
            variant: 'destructive',
          })
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const handleToggleAutoRenew = async (id: string, newValue: boolean) => {
    setTogglingAutoRenewIds(prev => new Set(prev).add(id))
    // Optimistic update
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, auto_renew: newValue } : s))
    try {
      await toggleAutoRenew(id, newValue)
      toast({
        title: newValue
          ? t('packageManagement.toast.autoRenewEnabled')
          : t('packageManagement.toast.autoRenewDisabled'),
      })
    } catch (error: any) {
      // Revert on failure
      setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, auto_renew: !newValue } : s))
      toast({
        title: t('packageManagement.toast.autoRenewError'),
        description: error?.response?.data?.message || error?.message || t('packageManagement.toast.tryAgain'),
        variant: 'destructive',
      })
    } finally {
      setTogglingAutoRenewIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  // Statistics
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    pending: subscriptions.filter(s => s.status === 'pending').length,
    suspended: subscriptions.filter(s => ['suspended', 'cancelled', 'expired'].includes(s.status)).length,
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      {/* Sidebar */}
      <WalletSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="container mx-auto py-8 px-4 space-y-8 max-w-full lg:max-w-full">
          {/* Balance Bar */}
          <div className="w-full flex items-center justify-between bg-white dark:bg-card rounded-lg shadow p-4 mb-4 border border-gray-100 dark:border-border">
            <BalanceDisplay showAddFunds={true} className="flex items-center gap-2" />
          </div>
          {/* Header Section */}
          <div className={`flex flex-col space-y-4 transition-all duration-700 transform ${
            isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
          }`}>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{t('packageManagement.title')}</h1>
              <p className="text-muted-foreground">{t('packageManagement.subtitle')}</p>
            </div>

            {/* Search and Filters */}
        <div className={`flex flex-col md:flex-row gap-4 transition-all duration-700 transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`} style={{ transitionDelay: '200ms' }}>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('packageManagement.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('packageManagement.status')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('packageManagement.filter.all')}</SelectItem>
              <SelectItem value="active">{t('packageManagement.filter.active')}</SelectItem>
              <SelectItem value="inactive">{t('packageManagement.filter.inactive')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('packageManagement.type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('packageManagement.filter.all')}</SelectItem>
              <SelectItem value="starter">{t('homepage.pricing.plans.starter')}</SelectItem>
              <SelectItem value="professional">{t('homepage.pricing.plans.professional')}</SelectItem>
              <SelectItem value="enterprise">{t('homepage.pricing.plans.enterprise')}</SelectItem>
              <SelectItem value="custom">{t('homepage.pricing.plans.custom')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
      }`} style={{ transitionDelay: '400ms' }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('packageManagement.stats.total')}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('packageManagement.stats.active')}</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('packageManagement.stats.pending')}</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('packageManagement.stats.suspended')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Table */}
      <Card className={`w-full transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
      }`} style={{ transitionDelay: '600ms' }}>
        <CardHeader>
          <CardTitle>{t('packageManagement.table.title', { count: filteredSubscriptions.length })}</CardTitle>
        </CardHeader>
        <CardContent className="w-full p-0 md:p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-muted-foreground">{t('packageManagement.toast.loadingList')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('packageManagement.table.subscriptionId')}</TableHead>
                  <TableHead>{t('packageManagement.table.packageName')}</TableHead>
                  <TableHead>{t('packageManagement.table.imageDetail')}</TableHead>
                  <TableHead>{t('packageManagement.table.vmName')}</TableHead>
                  <TableHead>{t('packageManagement.table.ipv4')}</TableHead>
                  <TableHead>{t('packageManagement.table.createdAt')}</TableHead>
                  <TableHead>{t('packageManagement.table.endDate')}</TableHead>
                  <TableHead>{t('packageManagement.table.status')}</TableHead>
                  <TableHead>{t('packageManagement.table.autoRenew')}</TableHead>
                  <TableHead>{t('packageManagement.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                        ? t('packageManagement.table.noMatch')
                        : t('packageManagement.table.noPackage')
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map(sub => {
                    const packageName = sub.cloudPackage?.name || t('packageManagement.table.customPackage')
                    const packageType = sub.cloudPackage?.type || 'custom'
                    const vmName = sub.vmInstance?.instance_name || ''
                    const vmIpv4 = sub.vmInstance?.public_ip || ''
                    
                    const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
                      // Only navigate if clicking on non-interactive elements
                      const target = e.target as HTMLElement
                      if (target.closest('button') || target.closest('[role="switch"]')) {
                        return
                      }
                      router.push(`/package-management/${sub.id}`)
                    }
                    
                    return (
                      <TableRow key={sub.id} onClick={handleRowClick} className="cursor-pointer">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {sub.id.substring(0, 6)}
                        </TableCell>
                        <TableCell className="font-medium">
                          <span
                            className="text-blue-600 hover:underline cursor-pointer"
                            onClick={() => router.push(`/package-management/${sub.id}`)}
                          >
                            {packageName}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {sub.vmInstance?.operating_system ? (
                            <div>
                              <div className="font-medium">{sub.vmInstance.operating_system}</div>
                              {sub.vmInstance.operating_system_version && (
                                <div className="text-xs text-muted-foreground">{sub.vmInstance.operating_system_version}</div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {vmName || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {vmIpv4 || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          {formatDateOnly(sub.created_at)}
                        </TableCell>
                        <TableCell>
                          {formatDateOnly(sub.end_date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              sub.status === 'active' ? 'default' : 
                              sub.status === 'pending' ? 'secondary' :
                              sub.status === 'suspended' ? 'secondary' :
                              sub.status === 'cancelled' ? 'destructive' :
                              sub.status === 'expired' ? 'outline' : 'secondary'
                            }>
                              {sub.status === 'active' ? t('packageManagement.table.active') : 
                               sub.status === 'pending' ? t('packageManagement.table.pending') :
                               sub.status === 'suspended' ? t('packageManagement.table.suspended') :
                               sub.status === 'cancelled' ? t('packageManagement.table.cancelled') :
                               sub.status === 'expired' ? t('packageManagement.table.expired') :
                               t('packageManagement.table.inactive')}
                            </Badge>
                            {/* VM Configuration Status */}
                            {sub.status === 'active' && !sub.vm_instance_id && (
                              <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-900">
                                {t('packageManagement.notConfigured')}
                              </Badge>
                            )}
                            {sub.vm_instance_id && sub.vmInstance && (() => {
                              const state = sub.vmInstance.lifecycle_state
                              const isRunning = state === 'RUNNING'
                              const isStopped = state === 'STOPPED'
                              const isTerminated = ['TERMINATED', 'TERMINATING'].includes(state)
                              const isStopping = state === 'STOPPING'
                              const isStarting = state === 'STARTING'
                              const className = isRunning
                                ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-900'
                                : isStopped
                                ? 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-muted dark:text-muted-foreground dark:border-border'
                                : isTerminated
                                ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-300 dark:border-red-900'
                                : 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-900'
                              const label = isRunning ? t('packageManagement.table.vmRunning') 
                                : isStopped ? t('packageManagement.table.vmStopped')
                                : isStopping ? t('packageManagement.table.vmStopping')
                                : isStarting ? t('packageManagement.table.vmStarting')
                                : state
                              return (
                                <Badge variant="outline" className={className}>
                                  {label}
                                </Badge>
                              )
                            })()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={sub.auto_renew}
                            onCheckedChange={(checked) => handleToggleAutoRenew(sub.id, checked)}
                            disabled={togglingAutoRenewIds.has(sub.id)}
                            aria-label={t('packageManagement.table.autoRenew')}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div title={t('packageManagement.tooltip.viewDetails')}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/package-management/${sub.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                            {/* Configure VM button for active subscriptions without VM */}
                            {sub.status === 'active' && !sub.vm_instance_id && (
                              <div title={t('packageManagement.table.configure')}>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => router.push(`/cloud/configuration/${sub.id}`)}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Settings className="h-4 w-4 mr-1" />
                                  {t('packageManagement.table.configure')}
                                </Button>
                              </div>
                            )}
                            {/* Renew button for expired subscriptions */}
                            {sub.status === 'expired' && (
                              <div title={t('packageManagement.tooltip.renewSubscription')}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRenewSubscription(sub.id)}
                                  disabled={renewingIds.has(sub.id)}
                                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-300"
                                >
                                  {renewingIds.has(sub.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            )}
                            {/* Stop/Start VM button - only show if VM is configured and subscription is active */}
                            {sub.vm_instance_id && sub.vmInstance && sub.status !== 'expired' && (() => {
                              const state = sub.vmInstance.lifecycle_state
                              const isRunning = state === 'RUNNING'
                              const isStopped = state === 'STOPPED'
                              const isStable = isRunning || isStopped
                              const isToggling = togglingVmIds.has(sub.id)
                              // Show Stop button for RUNNING or STARTING; show Start button for STOPPED or STOPPING
                              const showStopBtn = isRunning || state === 'STARTING'
                              const isDisabled = isToggling || !isStable
                              const title = isRunning ? t('packageManagement.tooltip.stopVm')
                                : isStopped ? t('packageManagement.tooltip.startVm')
                                : state === 'STOPPING' ? t('packageManagement.tooltip.stopping')
                                : state === 'STARTING' ? t('packageManagement.tooltip.starting')
                                : t('packageManagement.tooltip.transitioning')
                              return (
                                <div title={title}>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleVmStatus(sub.id)}
                                    disabled={isDisabled}
                                  >
                                    {!isStable ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : showStopBtn ? (
                                      <Pause className="h-4 w-4" />
                                    ) : (
                                      <Play className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              )
                            })()}
                            <div title={t('packageManagement.table.deleteTitle')}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelUserSubscription(sub.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </div>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, open: false }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('packageManagement.confirmDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDialog.onConfirm()} className="bg-destructive hover:bg-destructive/90">{t('packageManagement.confirmDialog.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
