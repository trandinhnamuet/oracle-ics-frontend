'use client'

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import useAuthStore from '@/hooks/use-auth-store'
import { getPaidUserPackages, updateUserPackage, deleteUserPackage } from '@/api/user-package.api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, Calendar, Banknote, Settings, Play, Pause, Trash2, Eye } from 'lucide-react'

interface PackageSubscription {
  id: number
  userId: number
  packageId: number
  isPaid: boolean
  isActive: boolean
  totalPaidAmount: number
  createdAt: string
  updatedAt: string
  // Thông tin từ bảng package hoặc custom_package_registration
  package?: {
    name: string
    type: string
    price: number
    description?: string
  }
  // Thông tin user (từ relation)
  user?: {
    id: number
    email: string
    firstName: string
    lastName: string
  }
}

export default function PackageManagementPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuthStore()
  const [packages, setPackages] = useState<PackageSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isVisible, setIsVisible] = useState(false)

  // Fetch user packages
  const fetchUserPackages = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    try {
      const paidPackages = await getPaidUserPackages(Number(user.id))
      setPackages(paidPackages)
    } catch (error) {
      console.error('Error fetching user packages:', error)
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserPackages()
  }, [user?.id])

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Filter packages
  const filteredPackages = packages.filter(pkg => {
    const packageName = pkg.package?.name || 'N/A'
    const packageType = pkg.package?.type || 'N/A'
    
    const matchesSearch = 
      packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      packageType.toLowerCase().includes(searchTerm.toLowerCase())

    const status = pkg.isActive ? 'active' : 'inactive'
    const matchesStatus = statusFilter === 'all' || status === statusFilter
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

  // Handle package actions
  const togglePackageStatus = async (id: number) => {
    try {
      const pkg = packages.find(p => p.id === id)
      if (!pkg) return

      await updateUserPackage(id, {
        isActive: !pkg.isActive
      })
      
      setPackages(prev => prev.map(p => 
        p.id === id ? { ...p, isActive: !p.isActive } : p
      ))
    } catch (error) {
      console.error('Error toggling package status:', error)
    }
  }

  const deletePackage = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói này?')) {
      try {
        await deleteUserPackage(id)
        setPackages(prev => prev.filter(pkg => pkg.id !== id))
      } catch (error) {
        console.error('Error deleting package:', error)
      }
    }
  }

  // Statistics
  const stats = {
    total: packages.length,
    active: packages.filter(p => p.isActive).length,
    inactive: packages.filter(p => !p.isActive).length,
    totalRevenue: packages
      .filter(p => p.isActive)
      .reduce((sum, p) => sum + (p.package?.price || p.totalPaidAmount || 0), 0)
  }

  // Demo số dư
  const demoBalance = 1500000;
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Balance Bar */}
      <div className="w-full flex items-center justify-between bg-white rounded-lg shadow p-4 mb-4 border border-gray-100">
        <div className="flex items-center gap-2">
          <Banknote className="h-6 w-6 text-[#E60000]" />
          <span className="text-lg font-semibold text-gray-900">Số dư:</span>
          <span className="text-xl font-bold text-[#E60000]">{demoBalance.toLocaleString('vi-VN')} đ</span>
        </div>
        <button
          className="bg-[#E60000] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded transition-colors flex items-center gap-2 shadow"
          onClick={() => router.push('/add-funds')}
        >
          <Banknote className="h-5 w-5" />
          Nạp tiền
        </button>
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
          <CardTitle>{t('packageManagement.table.title', { count: filteredPackages.length })}</CardTitle>
        </CardHeader>
        <CardContent>
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
                {filteredPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                        ? t('packageManagement.table.noMatch')
                        : t('packageManagement.table.noPackage')
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPackages.map(pkg => {
                    const packageName = pkg.package?.name || t('packageManagement.table.customPackage')
                    const packageType = pkg.package?.type || 'custom'
                    
                    return (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium">{pkg.id}</TableCell>
                        <TableCell className="font-medium">
                          <span
                            className="text-blue-600 hover:underline cursor-pointer"
                            onClick={() => router.push(`/package-management/${pkg.id}`)}
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
                          {formatPrice(pkg.totalPaidAmount)}
                        </TableCell>
                        <TableCell>
                          {new Date(pkg.createdAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          {new Date(pkg.updatedAt).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(pkg.isActive)}>
                            {pkg.isActive ? t('packageManagement.table.active') : t('packageManagement.table.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div title="View Details">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/package-management/${pkg.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                            <div title={pkg.isActive ? t('packageManagement.table.pauseTitle') : t('packageManagement.table.activateTitle')}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => togglePackageStatus(pkg.id)}
                              >
                                {pkg.isActive ? (
                                  <Pause className="h-4 w-4" />
                                ) : (
                                  <Play className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <div title={t('packageManagement.table.deleteTitle')}>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deletePackage(pkg.id)}
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
        </CardContent>
      </Card>
    </div>
  )
}
