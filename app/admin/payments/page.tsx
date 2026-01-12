'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, RefreshCw, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react'
import { paymentApi } from '@/api/payment.api'
import { useTranslation } from 'react-i18next'

interface Payment {
  id: string
  user_id: number
  amount: number
  status: 'pending' | 'success' | 'failed'
  payment_type: 'subscription' | 'deposit'
  payment_method: string
  transaction_code: string
  created_at: string
  updated_at: string
  user?: {
    id: number
    email: string
    firstName: string
    lastName: string
  }
}

export default function PaymentManagementPage() {
  const { t } = useTranslation()
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const data = await paymentApi.getAllPayments()
      setPayments(data)
      setFilteredPayments(data)
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPayments([])
      setFilteredPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPayments(payments)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = payments.filter(
        (payment) =>
          payment.transaction_code.toLowerCase().includes(term) ||
          payment.user?.email.toLowerCase().includes(term) ||
          payment.user?.firstName.toLowerCase().includes(term) ||
          payment.user?.lastName.toLowerCase().includes(term) ||
          payment.status.toLowerCase().includes(term)
      )
      setFilteredPayments(filtered)
    }
  }, [searchTerm, payments])

  const handleAcceptPayment = async (paymentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn chấp nhận thanh toán này?')) {
      return
    }

    try {
      setProcessingId(paymentId)
      await paymentApi.acceptPayment(paymentId)
      alert('Đã chấp nhận thanh toán thành công!')
      await fetchPayments()
    } catch (error: any) {
      console.error('Error accepting payment:', error)
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi chấp nhận thanh toán')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Thành công
          </Badge>
        )
      case 'pending':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Đang chờ
          </Badge>
        )
      case 'failed':
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="w-3 h-3 mr-1" />
            Thất bại
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Nạp tiền</Badge>
      case 'subscription':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Subscription</Badge>
      default:
        return <Badge>{type}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN')
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý thanh toán</h1>
          <p className="text-gray-500 mt-1">Danh sách tất cả giao dịch thanh toán</p>
        </div>
        <Button onClick={fetchPayments} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Danh sách thanh toán ({filteredPayments.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm theo mã GD, email, tên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400" />
              <p className="text-gray-500 mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Không tìm thấy thanh toán nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã giao dịch</TableHead>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Phương thức</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.transaction_code}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.user?.firstName} {payment.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500">{payment.user?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{getPaymentTypeBadge(payment.payment_type)}</TableCell>
                      <TableCell>
                        <span className="text-sm capitalize">{payment.payment_method}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-sm">{formatDate(payment.created_at)}</TableCell>
                      <TableCell className="text-right">
                        {payment.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleAcceptPayment(payment.id)}
                            disabled={processingId === payment.id}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            {processingId === payment.id ? (
                              <>
                                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Chấp nhận
                              </>
                            )}
                          </Button>
                        )}
                        {payment.status === 'success' && (
                          <span className="text-xs text-green-600">Đã hoàn thành</span>
                        )}
                        {payment.status === 'failed' && (
                          <span className="text-xs text-red-600">Đã thất bại</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng thanh toán</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Đang chờ</p>
                <p className="text-2xl font-bold text-yellow-500">
                  {payments.filter((p) => p.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Thành công</p>
                <p className="text-2xl font-bold text-green-500">
                  {payments.filter((p) => p.status === 'success').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
