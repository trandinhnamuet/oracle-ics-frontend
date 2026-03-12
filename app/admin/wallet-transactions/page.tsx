'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  RefreshCw, ChevronLeft, ChevronRight, Wallet, TrendingUp, TrendingDown, Search, X,
} from 'lucide-react'
import {
  walletTransactionApi,
  WalletTransaction,
} from '@/api/wallet-transaction.api'
import { getAllUsers } from '@/api/user.api'
import { useToast } from '@/hooks/use-toast'

const PAGE_SIZE = 20

interface UserOption {
  id: number
  email: string
  firstName: string
  lastName: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('vi-VN')
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  deposit: { label: 'Nạp tiền', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  subscription_payment: { label: 'Thanh toán gói', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  auto_renewal: { label: 'Gia hạn tự động', color: 'bg-green-100 text-green-700 border-green-200' },
  manual_renewal: { label: 'Gia hạn thủ công', color: 'bg-orange-100 text-orange-700 border-orange-200' },
}

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_LABELS[type]
  if (cfg) return <Badge variant="outline" className={cfg.color}>{cfg.label}</Badge>
  return <Badge variant="outline">{type}</Badge>
}

export default function WalletTransactionsAdminPage() {
  const { toast } = useToast()

  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  // Filters
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>()
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [filterMonth, setFilterMonth] = useState(true) // bật filter tháng mặc định
  const [amountType, setAmountType] = useState<'all' | 'positive' | 'negative'>('all')

  // User dropdown search
  const [users, setUsers] = useState<UserOption[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null)

  // Load users for dropdown
  useEffect(() => {
    getAllUsers()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : (data?.data ?? [])
        setUsers(list)
      })
      .catch(() => {})
  }, [])

  const filteredUsers = useMemo(() => {
    const term = userSearch.toLowerCase()
    return users.filter(
      u =>
        u.email?.toLowerCase().includes(term) ||
        u.firstName?.toLowerCase().includes(term) ||
        u.lastName?.toLowerCase().includes(term),
    )
  }, [users, userSearch])

  const fetchTransactions = useCallback(async (p: number) => {
    try {
      setLoading(true)
      const res = await walletTransactionApi.adminGetAll({
        page: p,
        limit: PAGE_SIZE,
        userId: selectedUserId,
        month: filterMonth ? selectedMonth : undefined,
      })
      setTransactions(res.data)
      setTotal(res.total)
      setTotalPages(res.totalPages)
    } catch (err) {
      toast({ title: 'Lỗi tải dữ liệu', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [selectedUserId, selectedMonth, filterMonth])

  // Fetch all records to calculate total sum for all pages
  useEffect(() => {
    const fetchAllForSum = async () => {
      try {
        const res = await walletTransactionApi.adminGetAll({
          page: 1,
          limit: 99999, // Fetch all records
          userId: selectedUserId,
          month: filterMonth ? selectedMonth : undefined,
        })
        
        // Calculate total sum based on amountType filter
        let sum = 0
        for (const tx of res.data) {
          const amount = Number(tx.change_amount)
          if (amountType === 'positive' && amount > 0) sum += amount
          else if (amountType === 'negative' && amount < 0) sum += amount
          else if (amountType === 'all') sum += amount
        }
        
        console.log(
          `[Wallet Transactions] Tổng giá trị (tất cả trang): ${formatCurrency(sum)} ` +
          `(${res.data.length} record, filter: ${amountType}, ` +
          `user: ${selectedUserId ? 'ID ' + selectedUserId : 'tất cả'}, ` +
          `month: ${filterMonth ? selectedMonth : 'tất cả'})`
        )
      } catch (err) {
        console.error('Lỗi tính tổng:', err)
      }
    }

    fetchAllForSum()
  }, [selectedUserId, selectedMonth, filterMonth, amountType])

  useEffect(() => {
    setPage(1)
  }, [selectedUserId, selectedMonth, filterMonth])

  useEffect(() => {
    fetchTransactions(page)
  }, [page, fetchTransactions])

  const handleSelectUser = (user: UserOption | null) => {
    setSelectedUser(user)
    setSelectedUserId(user?.id)
    setUserDropdownOpen(false)
    setUserSearch('')
  }

  // Filter transactions by amount type
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const amount = Number(tx.change_amount)
      if (amountType === 'positive') return amount > 0
      if (amountType === 'negative') return amount < 0
      return true
    })
  }, [transactions, amountType])

  const totalIn = filteredTransactions.filter(t => Number(t.change_amount) > 0).reduce((s, t) => s + Number(t.change_amount), 0)
  const totalOut = filteredTransactions.filter(t => Number(t.change_amount) < 0).reduce((s, t) => s + Number(t.change_amount), 0)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Wallet Transactions</h1>
          <p className="text-muted-foreground mt-1">Xem lịch sử giao dịch ví của tất cả người dùng</p>
        </div>
        <Button onClick={() => fetchTransactions(page)} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Summary cards — tính trên trang hiện tại */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tổng giao dịch (tìm kiếm)</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiền vào (trang này)</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(totalIn)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiền ra (trang này)</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(Math.abs(totalOut))}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* User dropdown search */}
            <div className="flex flex-col gap-1 min-w-[280px]">
              <label className="text-sm font-medium text-muted-foreground">Lọc theo người dùng</label>
              <div className="relative">
                <div
                  className="flex items-center border rounded-md px-3 py-2 bg-background cursor-pointer gap-2"
                  onClick={() => setUserDropdownOpen(v => !v)}
                >
                  <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                  {selectedUser ? (
                    <span className="flex-1 text-sm">{selectedUser.firstName} {selectedUser.lastName} — {selectedUser.email}</span>
                  ) : (
                    <span className="flex-1 text-sm text-muted-foreground">Tất cả người dùng</span>
                  )}
                  {selectedUser && (
                    <button
                      onClick={e => { e.stopPropagation(); handleSelectUser(null) }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {userDropdownOpen && (
                  <div className="absolute z-50 top-full mt-1 left-0 right-0 border rounded-md bg-popover shadow-md">
                    <div className="p-2">
                      <Input
                        autoFocus
                        placeholder="Tìm email, tên..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <ul className="max-h-56 overflow-auto text-sm">
                      <li
                        className="px-3 py-2 hover:bg-muted cursor-pointer text-muted-foreground"
                        onClick={() => handleSelectUser(null)}
                      >
                        Tất cả người dùng
                      </li>
                      {filteredUsers.map(u => (
                        <li
                          key={u.id}
                          className="px-3 py-2 hover:bg-muted cursor-pointer"
                          onClick={() => handleSelectUser(u)}
                        >
                          <span className="font-medium">{u.firstName} {u.lastName}</span>
                          <span className="text-muted-foreground ml-2 text-xs">{u.email}</span>
                        </li>
                      ))}
                      {filteredUsers.length === 0 && (
                        <li className="px-3 py-2 text-muted-foreground">Không tìm thấy</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Month filter */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted-foreground">Lọc theo tháng</label>
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(e.target.value)}
                  disabled={!filterMonth}
                  className="border rounded-md px-3 py-2 text-sm bg-background disabled:opacity-50"
                />
                <label className="flex items-center gap-1 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterMonth}
                    onChange={e => setFilterMonth(e.target.checked)}
                    className="accent-primary"
                  />
                  Bật
                </label>
              </div>
            </div>

            {/* Amount type filter */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-muted-foreground">Loại số tiền</label>
              <select
                value={amountType}
                onChange={e => setAmountType(e.target.value as 'all' | 'positive' | 'negative')}
                className="border rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="all">Tất cả</option>
                <option value="positive">Chỉ tiền vào</option>
                <option value="negative">Chỉ tiền ra</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giao dịch ({filteredTransactions.length} bản ghi)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-2">Đang tải...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-center py-12 text-muted-foreground">Không có giao dịch nào</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Loại giao dịch</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Số dư sau GD</TableHead>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map(tx => {
                      const amount = Number(tx.change_amount)
                      const user = tx.wallet?.user
                      const isCredit = amount > 0
                      return (
                        <TableRow key={tx.id}>
                          <TableCell>
                            {user ? (
                              <div>
                                <p className="font-medium">{user.firstName} {user.lastName}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">wallet #{tx.wallet_id}</span>
                            )}
                          </TableCell>
                          <TableCell><TypeBadge type={tx.type} /></TableCell>
                          <TableCell>
                            <span className={`font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                              {isCredit ? '+' : ''}{formatCurrency(amount)}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {tx.balance_after != null ? formatCurrency(Number(tx.balance_after)) : '—'}
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground truncate max-w-[140px]">
                            {tx.payment_id}
                          </TableCell>
                          <TableCell className="text-sm">{formatDate(tx.created_at)}</TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
