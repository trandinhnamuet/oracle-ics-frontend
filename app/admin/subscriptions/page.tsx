'use client'

import { useState, useEffect } from 'react'
import { 
  getAdminSubscriptions, 
  deleteSubscriptionWithVm, 
  Subscription,
  GetSubscriptionsParams 
} from '@/api/subscription.api'
import { stopVm, deleteVmOnly } from '@/api/vm-subscription.api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  ArrowLeft, Search, Filter, Eye, Edit, Trash2, Trash, 
  Server, Globe, PowerOff, ArrowUpDown, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight 
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { useTranslation } from 'react-i18next'

export default function AdminSubscriptionsPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  // Sorting
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC')
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [userFilter, setUserFilter] = useState('')
  const [startDateFilter, setStartDateFilter] = useState('')
  const [endDateFilter, setEndDateFilter] = useState('')

  useEffect(() => {
    fetchAllSubscriptions()
  }, [page, limit, sortBy, sortOrder, statusFilter, startDateFilter, endDateFilter, userFilter])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchAllSubscriptions()
      } else {
        setPage(1) // Reset to page 1 when searching
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchAllSubscriptions = async () => {
    try {
      setLoading(true)
      const params: GetSubscriptionsParams = {
        page,
        limit,
        sortBy,
        sortOrder,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        searchTerm: searchTerm || undefined,
        startDate: startDateFilter || undefined,
        endDate: endDateFilter || undefined,
        userId: userFilter ? parseInt(userFilter) : undefined,
      }
      
      const response = await getAdminSubscriptions(params)
      setSubscriptions(response.data)
      setTotal(response.total)
      setTotalPages(response.totalPages)
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

  const handleDeleteSubscriptionWithVm = async (subscriptionId: string) => {
    if (!confirm('Delete entire subscription and its VM? This action cannot be undone!')) {
      return
    }

    try {
      await deleteSubscriptionWithVm(subscriptionId)
      toast({
        title: t('admin.subscriptions.toast.success'),
        description: 'Subscription and VM deleted successfully',
      })
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

  const handleDeleteVmOnly = async (subscriptionId: string) => {
    if (!confirm('Delete VM only? The subscription will remain active but you will need to reconfigure a new VM.')) {
      return
    }

    try {
      await deleteVmOnly(subscriptionId)
      toast({
        title: t('admin.subscriptions.toast.success'),
        description: 'VM deleted successfully. Subscription is still active.',
      })
      fetchAllSubscriptions()
    } catch (error: any) {
      console.error('Error deleting VM:', error)
      toast({
        title: t('admin.subscriptions.toast.error'),
        description: 'Failed to delete VM',
        variant: "destructive"
      })
    }
  }

  const handleStopVm = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to stop this VM?')) {
      return
    }

    try {
      await stopVm(subscriptionId)
      toast({
        title: t('admin.subscriptions.toast.success'),
        description: 'VM stopped successfully',
      })
      fetchAllSubscriptions()
    } catch (error: any) {
      console.error('Error stopping VM:', error)
      toast({
        title: t('admin.subscriptions.toast.error'),
        description: 'Failed to stop VM',
        variant: "destructive"
      })
    }
  }

  const handleViewSubscription = (subscriptionId: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin
    window.open(`${baseUrl}/package-management/${subscriptionId}`, '_blank')
  }

  const handleEditSubscription = (subscriptionId: string) => {
    // TODO: Implement edit functionality
    toast({
      title: t('admin.subscriptions.toast.info'),
      description: t('admin.subscriptions.toast.editInDevelopment'),
    })
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(column)
      setSortOrder('DESC')
    }
  }

  const getSortIcon = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 inline ml-1 text-gray-400" />
    }
    return sortOrder === 'ASC' 
      ? <ArrowUp className="h-4 w-4 inline ml-1 text-blue-600" /> 
      : <ArrowDown className="h-4 w-4 inline ml-1 text-blue-600" />
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage)
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by user, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
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
          
          {/* User Filter */}
          <Input
            placeholder="Filter by User ID..."
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            type="number"
          />
          
          {/* Date Range */}
          <div className="flex gap-2">
            <Input
              type="date"
              placeholder="Start Date"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
              title="Start Date"
            />
            <Input
              type="date"
              placeholder="End Date"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
              title="End Date"
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{t('admin.subscriptions.stats.total')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{total}</div>
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
            Showing {subscriptions.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} entries
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Loading...
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('admin.subscriptions.table.noData')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      onClick={() => handleSort('id')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      {t('admin.subscriptions.table.id')} {getSortIcon('id')}
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('user_id')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      {t('admin.subscriptions.table.user')} {getSortIcon('user_id')}
                    </TableHead>
                    <TableHead>{t('admin.subscriptions.table.package')}</TableHead>
                    <TableHead>VM Information</TableHead>
                    <TableHead 
                      onClick={() => handleSort('start_date')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      {t('admin.subscriptions.table.startDate')} {getSortIcon('start_date')}
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('end_date')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      {t('admin.subscriptions.table.endDate')} {getSortIcon('end_date')}
                    </TableHead>
                    <TableHead 
                      onClick={() => handleSort('status')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      {t('admin.subscriptions.table.status')} {getSortIcon('status')}
                    </TableHead>
                    <TableHead>{t('admin.subscriptions.table.autoRenew')}</TableHead>
                    <TableHead>{t('admin.subscriptions.table.price')}</TableHead>
                    <TableHead 
                      onClick={() => handleSort('created_at')}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      {t('admin.subscriptions.table.createdAt')} {getSortIcon('created_at')}
                    </TableHead>
                    <TableHead>{t('admin.subscriptions.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        #{subscription.id.substring(0, 8)}
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
                            {subscription.cloudPackage?.name || 'N/A'}
                          </div>
                          {subscription.cloudPackage && (
                            <div className="text-xs text-gray-400 mt-1">
                              {subscription.cloudPackage.cpu} • {subscription.cloudPackage.ram} • {subscription.cloudPackage.memory}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      {/* VM Information Column */}
                      <TableCell>
                        {subscription.vmInstance ? (
                          <div className="text-sm">
                            <div className="font-medium flex items-center gap-1">
                              <Server className="h-3 w-3 text-blue-500" />
                              {subscription.vmInstance.instance_name}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Globe className="h-3 w-3" />
                              {subscription.vmInstance.public_ip || 'No Public IP'}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`mt-1 text-xs ${
                                subscription.vmInstance.lifecycle_state === 'RUNNING' 
                                  ? 'border-green-500 text-green-600' 
                                  : subscription.vmInstance.lifecycle_state === 'STOPPED'
                                  ? 'border-gray-500 text-gray-600'
                                  : 'border-blue-500 text-blue-600'
                              }`}
                            >
                              {subscription.vmInstance.lifecycle_state}
                            </Badge>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Not configured
                          </span>
                        )}
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
                        <div className="flex gap-2 flex-wrap">
                          {/* View Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSubscription(subscription.id)}
                            className="h-8 w-8 p-0"
                            title="View details"
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          
                          {/* Stop VM Button - Only show if VM exists and is RUNNING */}
                          {subscription.vmInstance && 
                           subscription.vmInstance.lifecycle_state === 'RUNNING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStopVm(subscription.id)}
                              className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              title="Stop VM"
                            >
                              <PowerOff className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Delete VM Only - Only show if VM exists */}
                          {subscription.vmInstance && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteVmOnly(subscription.id)}
                              className="h-8 w-8 p-0 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                              title="Delete VM only (keep subscription)"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Delete Subscription & VM */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSubscriptionWithVm(subscription.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Delete subscription and VM"
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
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              {/* Records per page */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700">Records per page:</label>
                <Select 
                  value={limit.toString()} 
                  onValueChange={(val) => {
                    setLimit(parseInt(val))
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Page info & navigation */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                
                {/* Jump to page */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700">Go to:</label>
                  <Input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={page}
                    onChange={(e) => {
                      const newPage = parseInt(e.target.value)
                      handlePageChange(newPage)
                    }}
                    className="w-16"
                  />
                </div>
                
                {/* Prev/Next buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
