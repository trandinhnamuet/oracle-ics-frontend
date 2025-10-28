'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import useAuthStore from '@/hooks/use-auth-store'
import { getUserSubscriptions, getActiveSubscriptions, updateSubscription, cancelSubscription, suspendSubscription, reactivateSubscription, Subscription } from '@/api/subscription.api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, Calendar, Banknote, Settings, Play, Pause, Trash2, Eye } from 'lucide-react'
import BalanceDisplay from '@/components/wallet/balance-display'

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
  // Thông tin từ bảng cloud_packages
  cloud_package?: {
    id: number
    name: string
    type: string
    cost: number
    cost_vnd: number
    cpu: string
    ram: string
    memory: string
    feature: string
    bandwidth: string
  }
}

export default function PackageManagementPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuthStore()
  const [subscriptions, setSubscriptions] = useState<PackageSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isVisible, setIsVisible] = useState(false)

  // Fetch user subscriptions
  const fetchUserSubscriptions = async () => {
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
        ? 'Lỗi hệ thống khi tải danh sách subscription. Vui lòng thử lại sau.'
        : 'Không thể tải danh sách subscription. Vui lòng kiểm tra kết nối mạng.'
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserSubscriptions()
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
    const packageName = sub.cloud_package?.name || 'N/A'
    const packageType = sub.cloud_package?.type || 'N/A'
    
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

  // Handle subscription actions
  const toggleSubscriptionStatus = async (id: string) => {
    try {
      const subscription = subscriptions.find(s => s.id === id)
      if (!subscription) return

      let updatedSubscription
      if (subscription.status === 'active') {
        updatedSubscription = await suspendSubscription(id)
      } else {
        updatedSubscription = await reactivateSubscription(id)
      }
      
      setSubscriptions(prev => prev.map(s => 
        s.id === id ? updatedSubscription : s
      ))
    } catch (error) {
      console.error('Error toggling subscription status:', error)
      alert('Có lỗi xảy ra khi cập nhật trạng thái subscription')
    }
  }

  const cancelUserSubscription = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn hủy subscription này?')) {
      try {
        await cancelSubscription(id)
        setSubscriptions(prev => prev.filter(sub => sub.id !== id))
      } catch (error) {
        console.error('Error canceling subscription:', error)
      }
    }
  }

  // Statistics
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    inactive: subscriptions.filter(s => ['pending', 'suspended', 'cancelled', 'expired'].includes(s.status)).length,
    totalRevenue: subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + (s.cloud_package?.cost_vnd || 0), 0)
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Balance Bar */}
      <div className="w-full flex items-center justify-between bg-white rounded-lg shadow p-4 mb-4 border border-gray-100">
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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
            <CardTitle className="text-sm font-medium">{t('packageManagement.stats.inactive')}</CardTitle>
            <Pause className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('packageManagement.stats.revenue')}</CardTitle>
            <Banknote className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-blue-600">
              {formatPrice(stats.totalRevenue)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Table */}
      <Card className={`transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
      }`} style={{ transitionDelay: '600ms' }}>
        <CardHeader>
          <CardTitle>{t('packageManagement.table.title', { count: filteredSubscriptions.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-muted-foreground">Đang tải danh sách subscription...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>{t('packageManagement.table.packageName')}</TableHead>
                  <TableHead>{t('packageManagement.table.type')}</TableHead>
                  <TableHead>{t('packageManagement.table.paidAmount')}</TableHead>
                  <TableHead>{t('packageManagement.table.createdAt')}</TableHead>
                  <TableHead>{t('packageManagement.table.updatedAt')}</TableHead>
                  <TableHead>{t('packageManagement.table.status')}</TableHead>
                  <TableHead>{t('packageManagement.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                        ? t('packageManagement.table.noMatch')
                        : t('packageManagement.table.noPackage')
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscriptions.map(sub => {
                    const packageName = sub.cloud_package?.name || t('packageManagement.table.customPackage')
                    const packageType = sub.cloud_package?.type || 'custom'
                    
                    return (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.id}</TableCell>
                        <TableCell className="font-medium">
                          <span
                            className="text-blue-600 hover:underline cursor-pointer"
                            onClick={() => router.push(`/package-management/${sub.id}`)}
                          >
                            {packageName}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getTypeVariant(packageType)}>
                            {packageType.charAt(0).toUpperCase() + packageType.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatPrice(sub.cloud_package?.cost_vnd || 0)}
                        </TableCell>
                        <TableCell>
                          {new Date(sub.created_at).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          {new Date(sub.updated_at).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            sub.status === 'active' ? 'default' : 
                            sub.status === 'pending' ? 'secondary' :
                            sub.status === 'suspended' ? 'secondary' :
                            sub.status === 'cancelled' ? 'destructive' :
                            sub.status === 'expired' ? 'outline' : 'secondary'
                          }>
                            {sub.status === 'active' ? t('packageManagement.table.active') : 
                             sub.status === 'pending' ? 'Pending' :
                             sub.status === 'suspended' ? 'Suspended' :
                             sub.status === 'cancelled' ? 'Cancelled' :
                             sub.status === 'expired' ? 'Expired' :
                             t('packageManagement.table.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div title="View Details">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/package-management/${sub.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                            {(sub.status === 'active' || sub.status === 'suspended') && (
                              <div title={sub.status === 'active' ? t('packageManagement.table.pauseTitle') : t('packageManagement.table.activateTitle')}>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toggleSubscriptionStatus(sub.id)}
                                >
                                  {sub.status === 'active' ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            )}
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
  )
}
