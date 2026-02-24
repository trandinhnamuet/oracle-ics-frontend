'use client'

import { useState, useEffect, ElementType } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Banknote, 
  CreditCard, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  ChevronRight
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { paymentApi } from '@/api/payment.api'
import WalletSidebar from '@/components/wallet/wallet-sidebar'

interface Payment {
  id: string
  user_id: number
  subscription_id?: string
  amount: number
  status: 'pending' | 'success' | 'failed'
  payment_type: 'subscription' | 'deposit'
  payment_method: string
  transaction_code: string
  created_at: string
  updated_at: string
  description?: string
  subscription?: {
    id: string
    cloudPackage?: {
      id: number
      name: string
      category: string
    }
    months_paid?: number
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: ElementType; iconColor: string }> = {
  success: {
    label: 'Thành công',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
    iconColor: 'text-green-500'
  },
  pending: {
    label: 'Đang xử lý',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Clock,
    iconColor: 'text-yellow-500'
  },
  failed: {
    label: 'Thất bại',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircle,
    iconColor: 'text-red-500'
  }
}

const DEFAULT_STATUS_CONFIG = {
  label: 'Không xác định',
  color: 'bg-gray-50 text-gray-700 border-gray-200',
  icon: Clock,
  iconColor: 'text-gray-500'
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: ElementType; iconColor: string }> = {
  deposit: {
    label: 'Nạp tiền',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Banknote,
    iconColor: 'text-blue-500'
  },
  subscription: {
    label: 'Thanh toán gói',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: CreditCard,
    iconColor: 'text-purple-500'
  }
}

const DEFAULT_TYPE_CONFIG = {
  label: 'Giao dịch',
  color: 'bg-gray-50 text-gray-700 border-gray-200',
  icon: CreditCard,
  iconColor: 'text-gray-500'
}

export default function PaymentHistoryPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Fetch payments from API
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true)
        const data = await paymentApi.getMyPayments()
        setPayments(data)
        setFilteredPayments(data)
      } catch (error) {
        console.error('Error fetching payments:', error)
        toast({
          title: 'Lỗi',
          description: 'Không thể tải lịch sử thanh toán',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [])

  // Filter payments based on search and filters
  useEffect(() => {
    let filtered = payments

    // Search filter
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (payment) =>
          payment.transaction_code?.toLowerCase().includes(term) ||
          payment.id.toLowerCase().includes(term) ||
          payment.description?.toLowerCase().includes(term)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.payment_type === typeFilter)
    }

    setFilteredPayments(filtered)
  }, [searchTerm, statusFilter, typeFilter, payments])

  const handleViewDetails = (payment: Payment) => {
    toast({
      title: 'Xem chi tiết',
      description: `Chi tiết giao dịch ${payment.transaction_code}`,
      variant: 'default'
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTotalAmount = () => {
    return filteredPayments
      .filter(p => p.status === 'success')
      .reduce((sum, p) => sum + Number(p.amount), 0)
  }

  const getPaymentDescription = (payment: Payment) => {
    if (payment.payment_type === 'deposit') {
      return payment.description || 'Nạp tiền vào tài khoản'
    }
    if (payment.payment_type === 'subscription' && payment.subscription?.cloudPackage) {
      return `Thanh toán gói ${payment.subscription.cloudPackage.name}`
    }
    return payment.description || 'Thanh toán'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Đang tải lịch sử thanh toán...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <WalletSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Lịch sử thanh toán</h1>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tổng đã thanh toán</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatPrice(getTotalAmount())}₫
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Banknote className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Số lần nạp tiền</p>
                  <p className="text-lg font-bold text-blue-600">
                    {payments.filter(p => p.payment_type === 'deposit' && p.status === 'success').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gói đã mua</p>
                  <p className="text-lg font-bold text-purple-600">
                    {payments.filter(p => p.payment_type === 'subscription' && p.status === 'success').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Đang xử lý</p>
                  <p className="text-lg font-bold text-yellow-600">
                    {payments.filter(p => p.status === 'pending').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Bộ lọc và tìm kiếm</span>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Xuất Excel
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo ID hoặc mã giao dịch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="success">Thành công</option>
                <option value="pending">Đang xử lý</option>
                <option value="failed">Thất bại</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Tất cả loại giao dịch</option>
                <option value="deposit">Nạp tiền</option>
                <option value="subscription">Thanh toán gói</option>
              </select>

              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Lọc nâng cao
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <Card>
          <CardHeader>
            <CardTitle>
              Lịch sử giao dịch ({filteredPayments.length} giao dịch)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Không tìm thấy giao dịch nào</p>
                </div>
              ) : (
                filteredPayments.map((payment) => {
                  const statusConfig = STATUS_CONFIG[payment.status] ?? DEFAULT_STATUS_CONFIG
                  const typeConfig = TYPE_CONFIG[payment.payment_type] ?? DEFAULT_TYPE_CONFIG
                  const StatusIcon = statusConfig.icon
                  const TypeIcon = typeConfig.icon

                  return (
                    <div
                      key={payment.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${typeConfig.iconColor.replace('text-', 'bg-').replace('500', '100')}`}>
                            <TypeIcon className={`h-5 w-5 ${typeConfig.iconColor}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-gray-900">{getPaymentDescription(payment)}</h3>
                              <Badge variant="outline" className={typeConfig.color}>
                                {typeConfig.label}
                              </Badge>
                              <Badge variant="outline" className={statusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>ID: {payment.id.substring(0, 8)}...</span>
                              <span>•</span>
                              <span>{formatDate(payment.created_at)}</span>
                              <span>•</span>
                              <span>{payment.payment_method === 'sepay_qr' ? 'QR Code' : 'Chuyển khoản'}</span>
                              {payment.subscription?.cloudPackage && (
                                <>
                                  <span>•</span>
                                  <span>{payment.subscription.cloudPackage.name}</span>
                                  {payment.subscription.months_paid && payment.subscription.months_paid > 1 && (
                                    <span>({payment.subscription.months_paid} tháng)</span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatPrice(Number(payment.amount))}₫
                            </p>
                            <p className="text-sm text-gray-500">
                              {payment.transaction_code}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(payment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Chi tiết
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Pagination */}
            {filteredPayments.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Hiển thị {filteredPayments.length} trong tổng số {payments.length} giao dịch
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" disabled>
                    Trang trước
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    Trang sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
