'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search, RefreshCw, CheckCircle, Clock, XCircle, DollarSign, AlertTriangle,
  ChevronLeft, ChevronRight, ChevronsUpDown, ChevronUp, ChevronDown,
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
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 20

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown className="inline h-3 w-3 ml-1 text-muted-foreground" />
  return sortDir === 'asc'
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
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
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

  // Reset to page 1 on search or sort change
  useEffect(() => { setPage(1) }, [searchTerm, sortKey, sortDir])

  const handleSort = (col: SortKey) => {
    if (sortKey === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(col)
      setSortDir('asc')
    }
  }

  const filteredSorted = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    let list = term
      ? payments.filter(p =>
          p.transaction_code.toLowerCase().includes(term) ||
          (p.subscription_id || '').toLowerCase().includes(term) ||
          p.user?.email?.toLowerCase().includes(term) ||
          p.user?.firstName?.toLowerCase().includes(term) ||
          p.user?.lastName?.toLowerCase().includes(term) ||
          p.status.toLowerCase().includes(term) ||
          p.payment_type.toLowerCase().includes(term)
        )
      : [...payments]

    list.sort((a, b) => {
      let va: any, vb: any
      switch (sortKey) {
        case 'transaction_code': va = a.transaction_code; vb = b.transaction_code; break
        case 'subscription_id': va = a.subscription_id || ''; vb = b.subscription_id || ''; break
        case 'user': va = `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.trim(); vb = `${b.user?.firstName || ''} ${b.user?.lastName || ''}`.trim(); break
        case 'amount': va = a.amount; vb = b.amount; break
        case 'payment_type': va = a.payment_type; vb = b.payment_type; break
        case 'payment_method': va = a.payment_method; vb = b.payment_method; break
        case 'status': va = a.status; vb = b.status; break
        case 'created_at': va = a.created_at; vb = b.created_at; break
        default: va = ''; vb = ''
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [payments, searchTerm, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE))
  const pagedPayments = filteredSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleAcceptPayment = (paymentId: string) => { setConfirmPaymentId(paymentId) }

  const executeAcceptPayment = async () => {
    if (!confirmPaymentId) return
    const paymentId = confirmPaymentId
    setConfirmPaymentId(null)
    try {
      setProcessingId(paymentId)
      await paymentApi.acceptPayment(paymentId)
      toast({ title: 'ÄÃ£ cháº¥p nháº­n thanh toÃ¡n thÃ nh cÃ´ng!' })
      await fetchPayments()
    } catch (error: any) {
      console.error('Error accepting payment:', error)
      toast({ title: 'Lá»—i thanh toÃ¡n', description: error.response?.data?.message || 'CÃ³ lá»—i xáº£y ra khi cháº¥p nháº­n thanh toÃ¡n', variant: 'destructive' })
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />ThÃ nh cÃ´ng</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Äang chá»</Badge>
      case 'failed':
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" />Tháº¥t báº¡i</Badge>
      case 'expired':
        return <Badge className="bg-gray-500 hover:bg-gray-600"><AlertTriangle className="w-3 h-3 mr-1" />QuÃ¡ háº¡n</Badge>
      case 'deleted':
        return <Badge variant="outline" className="text-gray-400 border-gray-400"><XCircle className="w-3 h-3 mr-1" />ÄÃ£ xÃ³a</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit': return <Badge className="bg-blue-500 hover:bg-blue-600">Náº¡p tiá»n</Badge>
      case 'subscription': return <Badge className="bg-purple-500 hover:bg-purple-600">Subscription</Badge>
      default: return <Badge>{type}</Badge>
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('vi-VN')

  const th = (label: string, col: SortKey) => (
    <TableHead
      className="cursor-pointer select-none whitespace-nowrap"
      onClick={() => handleSort(col)}
    >
      {label}<SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
    </TableHead>
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quáº£n lÃ½ thanh toÃ¡n</h1>
          <p className="text-gray-500 dark:text-muted-foreground mt-1">Danh sÃ¡ch táº¥t cáº£ giao dá»‹ch thanh toÃ¡n</p>
        </div>
        <Button onClick={fetchPayments} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          LÃ m má»›i
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Tá»•ng thanh toÃ¡n</p>
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
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Äang chá»</p>
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
                <p className="text-sm text-gray-500 dark:text-muted-foreground">QuÃ¡ háº¡n</p>
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
                <p className="text-sm text-gray-500 dark:text-muted-foreground">ThÃ nh cÃ´ng</p>
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
              Danh sÃ¡ch thanh toÃ¡n ({filteredSorted.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="TÃ¬m kiáº¿m theo mÃ£ GD, email, tÃªn..."
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
              <p className="text-gray-500 dark:text-muted-foreground mt-2">Äang táº£i dá»¯ liá»‡u...</p>
            </div>
          ) : filteredSorted.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-muted-foreground">KhÃ´ng tÃ¬m tháº¥y thanh toÃ¡n nÃ o</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {th('MÃ£ giao dá»‹ch', 'transaction_code')}
                      {th('Subscription ID', 'subscription_id')}
                      {th('NgÆ°á»i dÃ¹ng', 'user')}
                      {th('Sá»‘ tiá»n', 'amount')}
                      {th('Loáº¡i', 'payment_type')}
                      {th('PhÆ°Æ¡ng thá»©c', 'payment_method')}
                      {th('Tráº¡ng thÃ¡i', 'status')}
                      {th('NgÃ y táº¡o', 'created_at')}
                      <TableHead className="text-right">HÃ nh Ä‘á»™ng</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagedPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">{payment.transaction_code}</TableCell>
                        <TableCell className="font-mono text-sm">{payment.subscription_id || '-'}</TableCell>
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
                            <Button size="sm" onClick={() => handleAcceptPayment(payment.id)} disabled={processingId === payment.id} className="bg-green-500 hover:bg-green-600">
                              {processingId === payment.id
                                ? <><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Äang xá»­ lÃ½...</>
                                : <><CheckCircle className="w-3 h-3 mr-1" />Cháº¥p nháº­n</>}
                            </Button>
                          )}
                          {payment.status === 'success' && <span className="text-xs text-green-600">ÄÃ£ hoÃ n thÃ nh</span>}
                          {payment.status === 'failed' && <span className="text-xs text-red-600">ÄÃ£ tháº¥t báº¡i</span>}
                          {payment.status === 'expired' && <span className="text-xs text-gray-500">ÄÃ£ quÃ¡ háº¡n</span>}
                          {payment.status === 'deleted' && <span className="text-xs text-gray-400">ÄÃ£ xÃ³a</span>}
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
                    Trang {page} / {totalPages} &mdash; Tá»•ng {filteredSorted.length} giao dá»‹ch
                  </span>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                      const num = start + i
                      if (num > totalPages) return null
                      return (
                        <Button key={num} variant={num === page ? 'default' : 'outline'} size="sm" onClick={() => setPage(num)} className="w-9">
                          {num}
                        </Button>
                      )
                    })}
                    <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>
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

