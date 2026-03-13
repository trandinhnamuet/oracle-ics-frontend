'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Download,
  Banknote,
  CreditCard,
  Calendar,
  Eye,
  ChevronRight,
  Copy,
  Hash,
  CalendarDays,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { walletTransactionApi, WalletTransaction } from '@/api/wallet-transaction.api'
import WalletSidebar from '@/components/wallet/wallet-sidebar'

const DEFAULT_TYPE_CONFIG = {
  label: '',
  color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border',
  iconColor: 'text-gray-500 dark:text-muted-foreground',
  icon: Banknote,
}

const SUBSCRIPTION_TYPES = ['subscription_payment', 'auto_renewal', 'manual_renewal']

export default function PaymentHistoryPage() {
  const { t, i18n } = useTranslation()
  const { toast } = useToast()

  const typeConfig = useMemo<Record<string, { label: string; color: string; iconColor: string; icon: any }>>(() => ({
    deposit: {
      label: t('paymentHistory.types.deposit'),
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'text-blue-500',
      icon: TrendingUp,
    },
    subscription_payment: {
      label: t('paymentHistory.types.subscriptionPayment'),
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      iconColor: 'text-purple-500',
      icon: CreditCard,
    },
    auto_renewal: {
      label: t('paymentHistory.types.autoRenewal'),
      color: 'bg-green-50 text-green-700 border-green-200',
      iconColor: 'text-green-500',
      icon: RefreshCw,
    },
    manual_renewal: {
      label: t('paymentHistory.types.manualRenewal'),
      color: 'bg-orange-50 text-orange-700 border-orange-200',
      iconColor: 'text-orange-500',
      icon: RefreshCw,
    },
  }), [t])

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(i18n.language || 'vi', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString))
  }

  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [filtered, setFiltered] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const [selected, setSelected] = useState<WalletTransaction | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    walletTransactionApi.getMyTransactions()
      .then(data => {
        setTransactions(data)
        setFiltered(data)
      })
      .catch(() => {
        toast({
          title: t('paymentHistory.loadError'),
          description: t('paymentHistory.loadErrorDesc'),
          variant: 'destructive',
        })
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = transactions

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(tx =>
        tx.id.toLowerCase().includes(term) ||
        (tx.payment_id ?? '').toLowerCase().includes(term),
      )
    }

    if (typeFilter !== 'all') {
      if (typeFilter === 'subscription') {
        result = result.filter(tx => SUBSCRIPTION_TYPES.includes(tx.type))
      } else {
        result = result.filter(tx => tx.type === typeFilter)
      }
    }

    setFiltered(result)
  }, [searchTerm, typeFilter, transactions])

  const totalDeposit = filtered
    .filter(tx => Number(tx.change_amount) > 0)
    .reduce((s, tx) => s + Number(tx.change_amount), 0)

  const depositCount = filtered.filter(tx => tx.type === 'deposit' && Number(tx.change_amount) > 0).length

  const totalSpent = filtered
    .filter(tx => SUBSCRIPTION_TYPES.includes(tx.type))
    .reduce((s, tx) => s + Math.abs(Number(tx.change_amount)), 0)

  const spentCount = filtered.filter(tx => SUBSCRIPTION_TYPES.includes(tx.type)).length

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: t('paymentHistory.detail.copied'), description: `${label}: ${text}` })
  }

  const exportToExcel = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet(t('paymentHistory.excel.sheetName'), {
        views: [{ state: 'frozen', ySplit: 1 }],
      })

      worksheet.columns = [
        { header: t('paymentHistory.excel.no'), key: 'stt', width: 6 },
        { header: t('paymentHistory.excel.transactionType'), key: 'type', width: 22 },
        { header: t('paymentHistory.excel.amountVnd'), key: 'amount', width: 18 },
        { header: t('paymentHistory.excel.balanceAfterVnd'), key: 'balance_after', width: 20 },
        { header: t('paymentHistory.excel.referenceCode'), key: 'payment_id', width: 38 },
        { header: t('paymentHistory.excel.transactionId'), key: 'id', width: 38 },
        { header: t('paymentHistory.excel.time'), key: 'created_at', width: 22 },
      ]

      const headerRow = worksheet.getRow(1)
      headerRow.eachCell((cell: any) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF1E3A5F' } },
          left: { style: 'thin', color: { argb: 'FF1E3A5F' } },
          bottom: { style: 'thin', color: { argb: 'FF1E3A5F' } },
          right: { style: 'thin', color: { argb: 'FF1E3A5F' } },
        }
      })
      headerRow.height = 28

      filtered.forEach((tx, index) => {
        const typeLabel = typeConfig[tx.type]?.label ?? t('paymentHistory.types.default')
        const row = worksheet.addRow({
          stt: index + 1,
          type: typeLabel,
          amount: Number(tx.change_amount),
          balance_after: tx.balance_after != null ? Number(tx.balance_after) : '',
          payment_id: tx.payment_id ?? '',
          id: tx.id,
          created_at: new Date(tx.created_at),
        })

        const isCredit = Number(tx.change_amount) > 0
        const rowFill = index % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FA'

        row.eachCell((cell: any, col: number) => {
          cell.alignment = { vertical: 'middle' }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFill } }
          if (col === 1) cell.alignment = { ...cell.alignment, horizontal: 'center' }
          if (col === 3 || col === 4) {
            cell.numFmt = '#,##0'
            cell.alignment = { ...cell.alignment, horizontal: 'right' }
            if (col === 3) cell.font = { color: { argb: isCredit ? 'FF28A745' : 'FFDC3545' } }
          }
          if (col === 7) {
            cell.numFmt = 'DD/MM/YYYY HH:MM:SS'
            cell.alignment = { ...cell.alignment, horizontal: 'center' }
          }
        })
        row.height = 22
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${t('paymentHistory.excel.filePrefix')}-${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: t('paymentHistory.exportSuccess'),
        description: t('paymentHistory.exportSuccessDesc', { count: filtered.length }),
      })
    } catch {
      toast({ title: t('paymentHistory.exportError'), variant: 'destructive' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 dark:text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-gray-500 dark:text-muted-foreground">{t('paymentHistory.loading')}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-background">
      <WalletSidebar />

      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="container mx-auto px-4 max-w-6xl py-8">

          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">
              {t('paymentHistory.title')}
            </h1>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Banknote className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">{t('paymentHistory.totalDeposit')}</p>
                    <p className="text-lg font-bold text-blue-600">{formatPrice(totalDeposit)}₫</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">{t('paymentHistory.depositCount')}</p>
                    <p className="text-lg font-bold text-orange-600">{depositCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">{t('paymentHistory.totalPaid')}</p>
                    <p className="text-lg font-bold text-green-600">{formatPrice(totalSpent)}₫</p>
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
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">{t('paymentHistory.paymentCount')}</p>
                    <p className="text-lg font-bold text-purple-600">{spentCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('paymentHistory.filterTitle')}</span>
                <Button variant="outline" size="sm" onClick={exportToExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  {t('paymentHistory.exportExcel')}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-muted-foreground" />
                  <Input
                    placeholder={t('paymentHistory.searchPlaceholder')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-background dark:border-border dark:text-foreground"
                >
                  <option value="all">{t('paymentHistory.allTypes')}</option>
                  <option value="deposit">{t('paymentHistory.deposit')}</option>
                  <option value="subscription">{t('paymentHistory.subscriptionPayment')}</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Transaction List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t('paymentHistory.transactionHistory', { count: filtered.length })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filtered.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 dark:text-muted-foreground mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-muted-foreground">{t('paymentHistory.noTransactions')}</p>
                  </div>
                ) : (
                  filtered.map(tx => {
                    const cfg = typeConfig[tx.type] ?? { ...DEFAULT_TYPE_CONFIG, label: t('paymentHistory.types.default') }
                    const TypeIcon = cfg.icon
                    const amount = Number(tx.change_amount)
                    const isCredit = amount > 0

                    return (
                      <div
                        key={tx.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                              <TypeIcon className={`h-5 w-5 ${isCredit ? 'text-green-600' : 'text-red-600'}`} />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline" className={cfg.color}>
                                  {cfg.label}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-muted-foreground">
                                <span>{t('paymentHistory.labels.id')}: {tx.id.substring(0, 8)}...</span>
                                <span>*</span>
                                <span>{formatDate(tx.created_at)}</span>
                                {tx.payment_id && (
                                  <>
                                    <span>*</span>
                                    <span className="font-mono text-xs truncate max-w-[180px]">{t('paymentHistory.labels.ref')}: {tx.payment_id.substring(0, 12)}...</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className={`text-lg font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                {isCredit ? '+' : ''}{formatPrice(amount)}₫
                              </p>
                              {tx.balance_after != null && (
                                <p className="text-xs text-gray-500 dark:text-muted-foreground">
                                  {t('paymentHistory.labels.balance')}: {formatPrice(Number(tx.balance_after))}₫
                                </p>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setSelected(tx); setDetailOpen(true) }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t('paymentHistory.viewDetail')}
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {filtered.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    {t('paymentHistory.showing', { count: filtered.length, total: transactions.length })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              {t('paymentHistory.detail.title')}
            </DialogTitle>
          </DialogHeader>

          {selected && (() => {
            const cfg = typeConfig[selected.type] ?? { ...DEFAULT_TYPE_CONFIG, label: t('paymentHistory.types.default') }
            const TypeIcon = cfg.icon
            const amount = Number(selected.change_amount)
            const isCredit = amount > 0

            return (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cfg.color}>
                    <TypeIcon className="h-3 w-3 mr-1" />
                    {cfg.label}
                  </Badge>
                </div>

                <div className="bg-white dark:bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">{t('paymentHistory.detail.amount')}</p>
                  <p className={`text-3xl font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                    {isCredit ? '+' : ''}{formatPrice(amount)}₫
                  </p>
                  {selected.balance_after != null && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('paymentHistory.detail.balanceAfter')}: {formatPrice(Number(selected.balance_after))}₫
                    </p>
                  )}
                </div>

                <div className="divide-y divide-border rounded-lg border">
                  <div className="flex items-start justify-between px-4 py-3 gap-3">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                      <Hash className="h-4 w-4" />
                      {t('paymentHistory.detail.paymentId')}
                    </span>
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-sm font-mono truncate">{selected.id}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopy(selected.id, t('paymentHistory.labels.id'))}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {selected.payment_id && (
                    <div className="flex items-start justify-between px-4 py-3 gap-3">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                        <Hash className="h-4 w-4" />
                        {t('paymentHistory.detail.transactionCode')}
                      </span>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm font-mono truncate">{selected.payment_id}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopy(selected.payment_id!, t('paymentHistory.labels.ref'))}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      {t('paymentHistory.detail.createdAt')}
                    </span>
                    <span className="text-sm font-medium">{formatDate(selected.created_at)}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={() => setDetailOpen(false)}>
                  {t('paymentHistory.detail.close')}
                </Button>
              </div>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
