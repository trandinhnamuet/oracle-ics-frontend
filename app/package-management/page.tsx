'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Package, Calendar, DollarSign, Settings, Play, Pause, Trash2 } from 'lucide-react'

interface PackageSubscription {
  id: number
  packageName: string
  packageType: 'starter' | 'professional' | 'enterprise' | 'custom'
  status: 'active' | 'suspended' | 'expired' | 'pending'
  startDate: string
  endDate: string
  monthlyPrice: number
  totalPaid: number
  specs: {
    cpu: string
    ram: string
    storage: string
    bandwidth: string
  }
  userId: number
  userEmail: string
  nextBilling: string
}

// Mock data
const mockPackages: PackageSubscription[] = [
  {
    id: 1,
    packageName: 'Oracle Cloud Starter',
    packageType: 'starter',
    status: 'active',
    startDate: '2025-01-15',
    endDate: '2026-01-15',
    monthlyPrice: 299000,
    totalPaid: 2990000,
    specs: {
      cpu: '2 vCPUs',
      ram: '4GB',
      storage: '100GB SSD',
      bandwidth: '100Mbps'
    },
    userId: 1,
    userEmail: 'admin@example.com',
    nextBilling: '2025-10-15'
  },
  {
    id: 2,
    packageName: 'Oracle Cloud Professional',
    packageType: 'professional',
    status: 'active',
    startDate: '2025-03-01',
    endDate: '2026-03-01',
    monthlyPrice: 599000,
    totalPaid: 4193000,
    specs: {
      cpu: '4 vCPUs',
      ram: '8GB',
      storage: '250GB SSD',
      bandwidth: '500Mbps'
    },
    userId: 2,
    userEmail: 'test@example.com',
    nextBilling: '2025-10-01'
  },
  {
    id: 3,
    packageName: 'Oracle Cloud Enterprise',
    packageType: 'enterprise',
    status: 'suspended',
    startDate: '2024-12-01',
    endDate: '2025-12-01',
    monthlyPrice: 999000,
    totalPaid: 9990000,
    specs: {
      cpu: '8 vCPUs',
      ram: '16GB',
      storage: '500GB SSD',
      bandwidth: '1Gbps'
    },
    userId: 3,
    userEmail: 'test@gmail.com',
    nextBilling: '2025-10-01'
  },
  {
    id: 4,
    packageName: 'Custom Package - Gaming Server',
    packageType: 'custom',
    status: 'active',
    startDate: '2025-07-10',
    endDate: '2026-07-10',
    monthlyPrice: 1299000,
    totalPaid: 3897000,
    specs: {
      cpu: '12 vCPUs',
      ram: '32GB',
      storage: '1TB NVMe SSD',
      bandwidth: '2Gbps'
    },
    userId: 4,
    userEmail: 'tranngocphong@gmail.com',
    nextBilling: '2025-10-10'
  },
  {
    id: 5,
    packageName: 'Oracle Cloud Professional',
    packageType: 'professional',
    status: 'expired',
    startDate: '2024-01-01',
    endDate: '2025-01-01',
    monthlyPrice: 599000,
    totalPaid: 7188000,
    specs: {
      cpu: '4 vCPUs',
      ram: '8GB',
      storage: '250GB SSD',
      bandwidth: '500Mbps'
    },
    userId: 5,
    userEmail: 'olduser@company.com',
    nextBilling: 'N/A'
  }
]

export default function PackageManagementPage() {
  const [packages, setPackages] = useState<PackageSubscription[]>(mockPackages)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isVisible, setIsVisible] = useState(false)

  // Animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  // Filter packages
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = 
      pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.specs.cpu.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter
    const matchesType = typeFilter === 'all' || pkg.packageType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Get package type badge variant
  const getTypeVariant = (type: string) => {
    switch (type) {
      case 'starter': return 'secondary'
      case 'professional': return 'default'
      case 'enterprise': return 'destructive'
      case 'custom': return 'outline'
      default: return 'secondary'
    }
  }

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'suspended': return 'secondary'
      case 'expired': return 'destructive'
      case 'pending': return 'outline'
      default: return 'secondary'
    }
  }

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  // Handle package actions
  const togglePackageStatus = (id: number) => {
    setPackages(prev => prev.map(pkg => 
      pkg.id === id 
        ? { ...pkg, status: pkg.status === 'active' ? 'suspended' : 'active' as any }
        : pkg
    ))
  }

  const deletePackage = (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói này?')) {
      setPackages(prev => prev.filter(pkg => pkg.id !== id))
    }
  }

  // Statistics
  const stats = {
    total: packages.length,
    active: packages.filter(p => p.status === 'active').length,
    suspended: packages.filter(p => p.status === 'suspended').length,
    expired: packages.filter(p => p.status === 'expired').length,
    totalRevenue: packages
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + p.monthlyPrice, 0)
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
              <SelectItem value="suspended">Tạm dừng</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
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
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 transition-all duration-700 transform ${
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
            <CardTitle className="text-sm font-medium">Tạm dừng</CardTitle>
            <Pause className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.suspended}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hết hạn</CardTitle>
            <Calendar className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
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
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Cấu hình</TableHead>
                  <TableHead>Giá/tháng</TableHead>
                  <TableHead>Ngày bắt đầu</TableHead>
                  <TableHead>Ngày hết hạn</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                        ? 'Không tìm thấy gói nào phù hợp' 
                        : 'Chưa có gói đăng ký nào'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPackages.map(pkg => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-medium">{pkg.id}</TableCell>
                      <TableCell className="font-medium">{pkg.packageName}</TableCell>
                      <TableCell>
                        <Badge variant={getTypeVariant(pkg.packageType)}>
                          {pkg.packageType.charAt(0).toUpperCase() + pkg.packageType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{pkg.userEmail}</TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <div>CPU: {pkg.specs.cpu}</div>
                          <div>RAM: {pkg.specs.ram}</div>
                          <div>Storage: {pkg.specs.storage}</div>
                          <div>Bandwidth: {pkg.specs.bandwidth}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(pkg.monthlyPrice)}
                      </TableCell>
                      <TableCell>
                        {new Date(pkg.startDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        {new Date(pkg.endDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(pkg.status)}>
                          {pkg.status === 'active' && 'Hoạt động'}
                          {pkg.status === 'suspended' && 'Tạm dừng'}
                          {pkg.status === 'expired' && 'Hết hạn'}
                          {pkg.status === 'pending' && 'Chờ duyệt'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {pkg.status !== 'expired' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePackageStatus(pkg.id)}
                            >
                              {pkg.status === 'active' ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePackage(pkg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
