'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import useAuthStore from '@/hooks/use-auth-store'
import { getPaidUserPackages, updateUserPackage, deleteUserPackage } from '@/api/user-package.api'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, Calendar, DollarSign, Settings, Play, Pause, Trash2 } from 'lucide-react'

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

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header Section */}
      <div className={`flex flex-col space-y-4 transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
      }`}>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý gói đã đăng ký</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý các gói dịch vụ đang sử dụng</p>
        </div>

        {/* Search and Filters */}
        <div className={`flex flex-col md:flex-row gap-4 transition-all duration-700 transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`} style={{ transitionDelay: '200ms' }}>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên gói, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="inactive">Không hoạt động</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Loại gói" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
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
            <CardTitle className="text-sm font-medium">Tổng số gói</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang hoạt động</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Không hoạt động</CardTitle>
            <Pause className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.inactive}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu/tháng</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
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
          <CardTitle>Danh sách gói đăng ký ({filteredPackages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên gói</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Số tiền đã trả</TableHead>
                  <TableHead>Ngày đăng ký</TableHead>
                  <TableHead>Cập nhật lần cuối</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                        ? 'Không tìm thấy gói nào phù hợp' 
                        : 'Chưa có gói đăng ký nào'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPackages.map(pkg => {
                    const packageName = pkg.package?.name || 'Gói tùy chỉnh'
                    const packageType = pkg.package?.type || 'custom'
                    
                    return (
                      <TableRow key={pkg.id}>
                        <TableCell className="font-medium">{pkg.id}</TableCell>
                        <TableCell className="font-medium">{packageName}</TableCell>
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
                            {pkg.isActive ? 'Hoạt động' : 'Không hoạt động'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div title={pkg.isActive ? 'Tạm dừng gói' : 'Kích hoạt gói'}>
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
                            <div title="Xóa gói">
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
