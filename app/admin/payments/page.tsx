'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search, RefreshCw, CheckCircle, Clock, XCircle, DollarSign, AlertTriangle,
  ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { paymentApi } from '@/api/payment.api'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface Payment {
  id: string
  user_id: number
  subscription_id?: string
  amount: number
  status: 'pending' | 'success' | 'failed' | 'expired' | 'deleted'
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

type SortKey = 'transaction_code' | 'subscription_id' | 'user' | 'amount' | 'payment_type' | 'payment_method' | 'status' | 'created_at'
type SortOrder = 'ASC' | 'DESC'

const PAGE_SIZE = 20

function SortIcon({ col, sortBy, sortOrder }: { col: SortKey; sortBy: SortKey; sortOrder: SortOrder }) {
  if (sortBy !== col) return <ChevronsUpDown className="inline h-3 w-3 ml-1 text-muted-foreground" />
  return sortOrder === 'ASC'
    ? <ChevronUp className="inline h-3 w-3 ml-1" />
    : <ChevronDown className="inline h-3 w-3 ml-1" />
}

export default function PaymentManagementPage() {
  const { t } = useTranslation()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [confirmPaymentId, setConfirmPaymentId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortKey>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC')
  const [page, setPage] = useState(1)
  const { toast } = useToast()

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const data = await paymentApi.getAllPayments()
      setPayments(data)
    } catch (error) {
      console.error('Error fetching payments:', error)
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPayments() }, [])

  // Reset to page 1 when search or sort changes
  useEffect(() => { setPage(1) }, [searchTerm, sortBy, sortOrder])

  const handleSort = (col: SortKey) => {
    if (sortBy === col) {
      setSortOrder(o => o === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(col)
      setSortOrder('ASC')
    }
  }

  const getSortValue = (p: Payment, key: SortKey): string | number => {
    switch (key) {
      case 'transaction_code': return p.transaction_code ?? ''
      case 'subscription_id': return p.subscription_id ?? ''
      case 'user': return `${p.user?.firstName ?? ''} ${p.user?.lastName ?? ''}`.trim().toLowerCase()
      case 'amount': return p.amount
      case 'payment_type': return p.payment_type ?? ''
      case 'payment_method': return p.payment_method ?? ''
      case 'status': return p.status ?? ''
      case 'created_at': return p.created_at ?? ''
      default: return ''
    }
  }

  const filteredAndSorted = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    const filtered = term
      ? payments.filter(p =>
          p.transaction_code?.toLowerCase().includes(term) ||
          p.user?.email?.toLowerCase().includes(term) ||
          p.user?.firstName?.toLowerCase().includes(term) ||
          p.user?.lastName?.toLowerCase().includes(term) ||
          p.status?.toLowerCase().includes(term) ||
          p.subscription_id?.toLowerCase().includes(term)
        )
      : payments

    return [...filtered].sort((a, b) => {
      const av = getSortValue(a, sortBy)
      const bv = getSortValue(b, sortBy)
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortOrder === 'ASC' ? cmp : -cmp
    })
  }, [payments, searchTerm, sortBy, sortOrder])

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE))
  const pagedPayments = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleAcceptPayment = (paymentId: string) => { setConfirmPaymentId(paymentId) }

  const executeAcceptPayment = async () => {
    if (!confirmPaymentId) return
    const paymentId = confirmPaymentId
    setConfirmPaymentId(null)
    try {
      setProcessingId(paymentId)
      await paymentApi.acceptPayment(paymentId)
      toast({ title: 'Đã chấp nhận thanh toán thành công!' })
      await fetchPayments()
    } catch (error: any) {
      console.error('Error accepting payment:', error)
      toast({ title: 'Lỗi thanh toán', description: error.response?.data?.message || 'Có lỗi xảy ra khi chấp nhận thanh toán', variant: 'destructive' })
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Thành công</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Đang chờ</Badge>
      case 'failed':
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" />Thất bại</Badge>
      case 'expired':
        return <Badge className="bg-gray-500 hover:bg-gray-600"><AlertTriangle className="w-3 h-3 mr-1" />Quá hạn</Badge>
      case 'deleted':
        return <Badge variant="outline" className="text-gray-400 border-gray-400"><XCircle className="w-3 h-3 mr-1" />Đã xóa</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit': return <Badge className="bg-blue-500 hover:bg-blue-600">Nạp tiền</Badge>
      case 'subscription': return <Badge className="bg-purple-500 hover:bg-purple-600">Subscription</Badge>
      default: return <Badge>{type}</Badge>
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('vi-VN')

  const thClass = "cursor-pointer select-none hover:bg-muted/50"

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý thanh toán</h1>
          <p className="text-gray-500 dark:text-muted-foreground mt-1">Danh sách tất cả giao dịch thanh toán</p>
        </div>
        <Button onClick={fetchPayments} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Tổng thanh toán</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400 dark:text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Đang chờ</p>
                <p className="text-2xl font-bold text-yellow-500">{payments.filter(p => p.status === 'pending').length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Quá hạn</p>
                <p className="text-2xl font-bold text-gray-500">{payments.filter(p => p.status === 'expired').length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Thành công</p>
                <p className="text-2xl font-bold text-green-500">{payments.filter(p => p.status === 'success').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Danh sách thanh toán ({filteredAndSorted.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm theo mã GD, email, tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 dark:text-muted-foreground" />
              <p className="text-gray-500 dark:text-muted-foreground mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : filteredAndSorted.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-muted-foreground">Không tìm thấy thanh toán nào</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={thClass} onClick={() => handleSort('subscription_id')}>
                        Subscription ID<SortIcon col="subscription_id" sortBy={sortBy} sortOrder={sortOrder} />
                      </TableHead>
                      <TableHead className={thClass} onClick={() => handleSort('transaction_code')}>
                        Mã giao dịch<SortIcon col="transaction_code" sortBy={sortBy} sortOrder={sortOrder} />
                      </TableHead>
                      <TableHead className={thClass} onClick={() => handleSort('user')}>
                        Người dùng<SortIcon col="user" sortBy={sortBy} sortOrder={sortOrder} />
                      </TableHead>
                      <TableHead className={thClass} onClick={() => handleSort('amount')}>
                        Số tiền<SortIcon col="amount" sortBy={sortBy} sortOrder={sortOrder} />
                      </TableHead>
                      <TableHead className={thClass} onClick={() => handleSort('payment_type')}>
                        Loại<SortIcon col="payment_type" sortBy={sortBy} sortOrder={sortOrder} />
                      </TableHead>
                      <TableHead className={thClass} onClick={() => handleSort('payment_method')}>
                        Phương thức<SortIcon col="payment_method" sortBy={sortBy} sortOrder={sortOrder} />
                      </TableHead>
                      <TableHead className={thClass} onClick={() => handleSort('status')}>
                        Trạng thái<SortIcon col="status" sortBy={sortBy} sortOrder={sortOrder} />
                      </TableHead>
                      <TableHead className={thClass} onClick={() => handleSort('created_at')}>
                        Ngày tạo<SortIcon col="created_at" sortBy={sortBy} sortOrder={sortOrder} />
                      </TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">{payment.subscription_id || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">{payment.transaction_code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.user?.firstName} {payment.user?.lastName}</div>
                            <div className="text-xs text-gray-500 dark:text-muted-foreground">{payment.user?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{getPaymentTypeBadge(payment.payment_type)}</TableCell>
                        <TableCell><span className="text-sm capitalize">{payment.payment_method}</span></TableCell>
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
                                <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Đang xử lý...</>
                              ) : (
                                <><CheckCircle className="w-3 h-3 mr-1" />Chấp nhận</>
                              )}
                            </Button>
                          )}
                          {payment.status === 'success' && <span className="text-xs text-green-600">Đã hoàn thành</span>}
                          {payment.status === 'failed' && <span className="text-xs text-red-600">Đã thất bại</span>}
                          {payment.status === 'expired' && <span className="text-xs text-gray-500">Đã quá hạn</span>}
                          {payment.status === 'deleted' && <span className="text-xs text-gray-400">Đã xóa</span>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground">
                    Trang {page} / {totalPages} &mdash; Tổng {filteredAndSorted.length} giao dịch
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                      const pageNum = start + i
                      if (pageNum > totalPages) return null
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-9"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmPaymentId} onOpenChange={(open) => !open && setConfirmPaymentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận chấp nhận thanh toán</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc chắn muốn chấp nhận thanh toán này? Hành động này sẽ kích hoạt subscription hoặc nạp tiền cho người dùng.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={executeAcceptPayment}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, RefreshCw, CheckCircle, Clock, XCircle, DollarSign, AlertTriangle } from 'lucide-react'
import { paymentApi } from '@/api/payment.api'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface Payment {
  id: string
  user_id: number
  subscription_id?: string
  amount: number
  status: 'pending' | 'success' | 'failed' | 'expired' | 'deleted'
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
  const [confirmPaymentId, setConfirmPaymentId] = useState<string | null>(null)
  const { toast } = useToast()

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

  const handleAcceptPayment = (paymentId: string) => {
    setConfirmPaymentId(paymentId)
  }

  const executeAcceptPayment = async () => {
    if (!confirmPaymentId) return
    const paymentId = confirmPaymentId
    setConfirmPaymentId(null)
    try {
      setProcessingId(paymentId)
      await paymentApi.acceptPayment(paymentId)
      toast({ title: 'Đã chấp nhận thanh toán thành công!' })
      await fetchPayments()
    } catch (error: any) {
      console.error('Error accepting payment:', error)
      toast({ title: 'Lỗi thanh toán', description: error.response?.data?.message || 'Có lỗi xảy ra khi chấp nhận thanh toán', variant: 'destructive' })
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
      case 'expired':
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Quá hạn
          </Badge>
        )
      case 'deleted':
        return (
          <Badge variant="outline" className="text-gray-400 border-gray-400">
            <XCircle className="w-3 h-3 mr-1" />
            Đã xóa
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
          <p className="text-gray-500 dark:text-muted-foreground mt-1">Danh sách tất cả giao dịch thanh toán</p>
        </div>
        <Button onClick={fetchPayments} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Tổng thanh toán</p>
                <p className="text-2xl font-bold">{payments.length}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-400 dark:text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Đang chờ</p>
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
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Quá hạn</p>
                <p className="text-2xl font-bold text-gray-500">
                  {payments.filter((p) => p.status === 'expired').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Thành công</p>
                <p className="text-2xl font-bold text-green-500">
                  {payments.filter((p) => p.status === 'success').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
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
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 dark:text-muted-foreground" />
              <p className="text-gray-500 dark:text-muted-foreground mt-2">Đang tải dữ liệu...</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-muted-foreground">Không tìm thấy thanh toán nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã giao dịch</TableHead>
                    <TableHead>Subscription ID</TableHead>
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
                      <TableCell className="font-mono text-sm">{payment.subscription_id || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.transaction_code}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {payment.user?.firstName} {payment.user?.lastName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-muted-foreground">{payment.user?.email}</div>
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
                        {payment.status === 'expired' && (
                          <span className="text-xs text-gray-500">Đã quá hạn</span>
                        )}
                        {payment.status === 'deleted' && (
                          <span className="text-xs text-gray-400">Đã xóa</span>
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

      <AlertDialog open={!!confirmPaymentId} onOpenChange={(open) => !open && setConfirmPaymentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận chấp nhận thanh toán</AlertDialogTitle>
            <AlertDialogDescription>Bạn có chắc chắn muốn chấp nhận thanh toán này? Hành động này sẽ kích hoạt subscription hoặc nạp tiền cho người dùng.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={executeAcceptPayment}>Xác nhận</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
