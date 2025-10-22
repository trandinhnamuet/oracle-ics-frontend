'use client'

import { useState } from 'react'
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

// Mock data cho lịch sử giao dịch
const TRANSACTION_HISTORY = [
  {
    id: 'TXN001',
    type: 'add_funds',
    description: 'Nạp tiền vào tài khoản',
    amount: 1000000,
    status: 'completed',
    date: '2024-10-07 14:30:00',
    method: 'bank_transfer',
    details: {
      bank: 'TPBank',
      account: '66010901964',
      content: 'NAP123456'
    }
  },
  {
    id: 'TXN002', 
    type: 'package_payment',
    description: 'Thanh toán gói Professional Plan',
    amount: 2650000,
    status: 'completed',
    date: '2024-10-06 09:15:00',
    method: 'bank_transfer',
    details: {
      bank: 'TPBank',
      account: '66010901964',
      content: 'Professional Plan U1P2',
      planName: 'Professional Plan',
      planCategory: 'professional',
      months: 3
    }
  },
  {
    id: 'TXN003',
    type: 'add_funds',
    description: 'Nạp tiền vào tài khoản',
    amount: 500000,
    status: 'pending',
    date: '2024-10-07 16:45:00',
    method: 'bank_transfer',
    details: {
      bank: 'TPBank',
      account: '66010901964',
      content: 'NAP789012'
    }
  }
  ,
  {
    id: 'TXN004',
    type: 'package_payment',
    description: 'Thanh toán gói Starter Plan',
    amount: 530000,
    status: 'failed',
    date: '2024-10-05 11:20:00',
    method: 'bank_transfer',
    details: {
      bank: 'TPBank',
      account: '66010901964',
      content: 'Starter Plan U1P1',
      planName: 'Starter Plan',
      planCategory: 'starter',
      months: 1
    }
  },
  {
    id: 'TXN005',
    type: 'add_funds',
    description: 'Nạp tiền vào tài khoản',
    amount: 2000000,
    status: 'completed',
    date: '2024-10-04 13:10:00',
    method: 'bank_transfer',
    details: {
      bank: 'TPBank',
      account: '66010901964',
      content: 'NAP345678'
    }
  }
]

const STATUS_CONFIG = {
  completed: {
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

const TYPE_CONFIG = {
  add_funds: {
    label: 'Nạp tiền',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Banknote,
    iconColor: 'text-blue-500'
  },
  package_payment: {
    label: 'Thanh toán gói',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: CreditCard,
    iconColor: 'text-purple-500'
  }
}

export default function PaymentHistoryPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Filter transactions based on search and filters
  const filteredTransactions = TRANSACTION_HISTORY.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleViewDetails = (transaction: any) => {
    // Navigate to transaction details (could be a modal or new page)
    toast({
      title: 'Xem chi tiết',
      description: `Chi tiết giao dịch ${transaction.id}`,
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
    return filteredTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
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
                    {TRANSACTION_HISTORY.filter(t => t.type === 'add_funds' && t.status === 'completed').length}
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
                    {TRANSACTION_HISTORY.filter(t => t.type === 'package_payment' && t.status === 'completed').length}
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
                    {TRANSACTION_HISTORY.filter(t => t.status === 'pending').length}
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
                  placeholder="Tìm kiếm theo ID hoặc mô tả..."
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
                <option value="completed">Thành công</option>
                <option value="pending">Đang xử lý</option>
                <option value="failed">Thất bại</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white"
              >
                <option value="all">Tất cả loại giao dịch</option>
                <option value="add_funds">Nạp tiền</option>
                <option value="package_payment">Thanh toán gói</option>
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
              Lịch sử giao dịch ({filteredTransactions.length} giao dịch)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Không tìm thấy giao dịch nào</p>
                </div>
              ) : (
                filteredTransactions.map((transaction) => {
                  const statusConfig = STATUS_CONFIG[transaction.status as keyof typeof STATUS_CONFIG]
                  const typeConfig = TYPE_CONFIG[transaction.type as keyof typeof TYPE_CONFIG]
                  const StatusIcon = statusConfig.icon
                  const TypeIcon = typeConfig.icon

                  return (
                    <div
                      key={transaction.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${typeConfig.iconColor.replace('text-', 'bg-').replace('500', '100')}`}>
                            <TypeIcon className={`h-5 w-5 ${typeConfig.iconColor}`} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-medium text-gray-900">{transaction.description}</h3>
                              <Badge variant="outline" className={typeConfig.color}>
                                {typeConfig.label}
                              </Badge>
                              <Badge variant="outline" className={statusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>ID: {transaction.id}</span>
                              <span>•</span>
                              <span>{formatDate(transaction.date)}</span>
                              <span>•</span>
                              <span>Chuyển khoản ngân hàng</span>
                              {transaction.details.planName && (
                                <>
                                  <span>•</span>
                                  <span>{transaction.details.planName}</span>
                                  {transaction.details.months && transaction.details.months > 1 && (
                                    <span>({transaction.details.months} tháng)</span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">
                              {formatPrice(transaction.amount)}₫
                            </p>
                            <p className="text-sm text-gray-500">
                              {transaction.details.content}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(transaction)}
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
            {filteredTransactions.length > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Hiển thị {filteredTransactions.length} trong tổng số {TRANSACTION_HISTORY.length} giao dịch
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
  )
}
