'use client'

import { useState, useEffect } from 'react'
import { getAllSubscriptions, deleteSubscription, Subscription } from '@/api/subscription.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

export default function AdminSubscriptionsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchAllSubscriptions()
  }, [])

  useEffect(() => {
    filterSubscriptions()
  }, [subscriptions, searchTerm, statusFilter])

  const fetchAllSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await getAllSubscriptions()
      setSubscriptions(data)
    } catch (error: any) {
      console.error('Error fetching subscriptions:', error)
      toast({
        title: t('admin.subscriptions.toast.error'),
        description: t('admin.subscriptions.toast.loadError'),
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const filterSubscriptions = () => {
    let filtered = subscriptions

    // Filter by search term (user_id, package name, user name, etc.)
    if (searchTerm) {
      filtered = filtered.filter(subscription =>
        subscription.user_id.toString().includes(searchTerm) ||
        subscription.cloudPackage?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscription.id.toString().includes(searchTerm) ||
        subscription.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscription.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subscription.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(subscription => subscription.status === statusFilter)
    }

    setFilteredSubscriptions(filtered)
  }

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!confirm(t('admin.subscriptions.confirmDelete'))) {
      return
    }

    try {
      await deleteSubscription(subscriptionId)
      toast({
        title: t('admin.subscriptions.toast.success'),
        description: t('admin.subscriptions.toast.deleteSuccess'),
      })
      // Refresh data
      fetchAllSubscriptions()
    } catch (error: any) {
      console.error('Error deleting subscription:', error)
      toast({
        title: t('admin.subscriptions.toast.error'),
        description: t('admin.subscriptions.toast.deleteError'),
        variant: "destructive"
      })
    }
  }

  const handleViewSubscription = (subscriptionId: string) => {
    // Navigate to package management with subscription ID
    window.open(`http://localhost:3000/package-management/${subscriptionId}`, '_blank')
  }

  const handleEditSubscription = (subscriptionId: string) => {
    // TODO: Implement edit functionality
    toast({
      title: t('admin.subscriptions.toast.info'),
      description: t('admin.subscriptions.toast.editInDevelopment'),
    })
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'expired':
        return 'destructive'
      case 'suspended':
        return 'secondary'
      case 'cancelled':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('admin.subscriptions.status.active')
      case 'pending':
        return t('admin.subscriptions.status.pending')
      case 'inactive':
        return t('admin.subscriptions.status.inactive')
      case 'expired':
        return t('admin.subscriptions.status.expired')
      case 'suspended':
        return t('admin.subscriptions.status.suspended')
      case 'cancelled':
        return t('admin.subscriptions.status.cancelled')
      default:
        return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">{t('common.loading')}</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('admin.subscriptions.backButton')}
          </Button>
          <h1 className="text-3xl font-bold">{t('admin.subscriptions.title')}</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('admin.subscriptions.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder={t('admin.subscriptions.filterByStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.subscriptions.filter.allStatus')}</SelectItem>
              <SelectItem value="active">{t('admin.subscriptions.status.active')}</SelectItem>
              <SelectItem value="pending">{t('admin.subscriptions.status.pending')}</SelectItem>
              <SelectItem value="inactive">{t('admin.subscriptions.status.inactive')}</SelectItem>
              <SelectItem value="expired">{t('admin.subscriptions.status.expired')}</SelectItem>
              <SelectItem value="suspended">{t('admin.subscriptions.status.suspended')}</SelectItem>
              <SelectItem value="cancelled">{t('admin.subscriptions.status.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.subscriptions.stats.total')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.subscriptions.stats.active')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {subscriptions.filter(s => s.status === 'active').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.subscriptions.stats.pending')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {subscriptions.filter(s => s.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.subscriptions.stats.expired')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {subscriptions.filter(s => s.status === 'expired').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.subscriptions.stats.cancelled')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {subscriptions.filter(s => s.status === 'cancelled').length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.subscriptions.table.title')}</CardTitle>
          <div className="text-sm text-gray-500">
            {t('admin.subscriptions.table.showing', { 
              current: filteredSubscriptions.length, 
              total: subscriptions.length 
            })}
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('admin.subscriptions.table.noData')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.subscriptions.table.id')}</TableHead>
                    <TableHead>{t('admin.subscriptions.table.user')}</TableHead>
                    <TableHead>{t('admin.subscriptions.table.package')}</TableHead>
                    <TableHead>{t('admin.subscriptions.table.startDate')}</TableHead>
                    <TableHead>{t('admin.subscriptions.table.endDate')}</TableHead>
                    <TableHead>{t('admin.subscriptions.table.status')}</TableHead>
                    <TableHead>{t('admin.subscriptions.table.autoRenew')}</TableHead>
                    <TableHead>{t('admin.subscriptions.table.price')}</TableHead>
                    <TableHead>{t('admin.subscriptions.table.createdAt')}</TableHead>
                    <TableHead>{t('admin.subscriptions.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        #{subscription.id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {subscription.user?.firstName && subscription.user?.lastName ? 
                              `${subscription.user.firstName} ${subscription.user.lastName}` : 
                              'N/A'
                            } #{subscription.user_id}
                          </div>
                          {subscription.user?.email && (
                            <div className="text-xs text-gray-400">
                              {subscription.user.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {subscription.cloudPackage?.name || 'N/A'} #{subscription.cloud_package_id}
                          </div>
                          {subscription.cloudPackage && (
                            <div className="text-xs text-gray-400 mt-1">
                              {subscription.cloudPackage.cpu} • {subscription.cloudPackage.ram} • {subscription.cloudPackage.memory}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(subscription.start_date)}
                      </TableCell>
                      <TableCell>
                        {formatDate(subscription.end_date)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(subscription.status)}>
                          {getStatusLabel(subscription.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={subscription.auto_renew ? 'default' : 'outline'}>
                          {subscription.auto_renew ? t('admin.subscriptions.table.yes') : t('admin.subscriptions.table.no')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {subscription.cloudPackage?.cost_vnd ? 
                          formatCurrency(parseFloat(subscription.cloudPackage.cost_vnd)) : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {formatDate(subscription.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSubscription(subscription.id)}
                            className="h-8 w-8 p-0"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditSubscription(subscription.id)}
                            className="h-8 w-8 p-0"
                            title="Chỉnh sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubscription(subscription.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
