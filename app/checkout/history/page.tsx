'use client'

import { useState, useEffect } from 'react'
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
  Clock,
  Eye,
  ChevronRight,
  Copy,
  Hash,
  CalendarDays,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { walletTransactionApi, WalletTransaction } from '@/api/wallet-transaction.api'
import WalletSidebar from '@/components/wallet/wallet-sidebar'

const TYPE_CONFIG: Record<string, { label: string; color: string; iconColor: string }> = {
  deposit: {
    label: 'Náº¡p tiá»n',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconColor: 'text-blue-500',
  },
  subscription_payment: {
    label: 'Thanh toÃ¡n gÃ³i',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconColor: 'text-purple-500',
  },
  auto_renewal: {
    label: 'Gia háº¡n tá»± Ä‘á»™ng',
    color: 'bg-green-50 text-green-700 border-green-200',
    iconColor: 'text-green-500',
  },
  manual_renewal: {
    label: 'Gia háº¡n thá»§ cÃ´ng',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    iconColor: 'text-orange-500',
  },
}

const DEFAULT_TYPE_CONFIG = {
  label: 'Giao dá»‹ch',
  color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border',
  iconColor: 'text-gray-500 dark:text-muted-foreground',
}

export default function PaymentHistoryPage() {
  const { t } = useTranslation()
  const { toast } = useToast()

  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [filtered, setFiltered] = useState<WalletTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [amountFilter, setAmountFilter] = useState<'all' | 'positive' | 'negative'>('all')
  const [selected, setSelected] = useState<WalletTransaction | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  useEffect(() => {
    walletTransactionApi.getMyTransactions()
      .then(data => {
        setTransactions(data)
        setFiltered(data)
      })
      .catch(() => {
        toast({ title: t('paymentHistory.loadError'), description: t('paymentHistory.loadErrorDesc'), variant: 'destructive' })
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let result = transactions
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      result = result.filter(tx =>
        tx.id.toLowerCase().includes(term) ||
        tx.payment_id?.toLowerCase().includes(term) ||
        (TYPE_CONFIG[tx.type]?.label ?? tx.type).toLowerCase().includes(term)
      )
    }
    if (typeFilter !== 'all') result = result.filter(tx => tx.type === typeFilter)
    if (amountFilter === 'positive') result = result.filter(tx => Number(tx.change_amount) > 0)
    if (amountFilter === 'negative') result = result.filter(tx => Number(tx.change_amount) < 0)
    setFiltered(result)
  }, [searchTerm, typeFilter, amountFilter, transactions])

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    })

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: t('paymentHistory.detail.copied'), description: `${label}: ${text}`, variant: 'default' })
  }

  const totalIn = transactions.filter(tx => Number(tx.change_amount) > 0).reduce((s, tx) => s + Number(tx.change_amount), 0)
  const totalOut = Math.abs(transactions.filter(tx => Number(tx.change_amount) < 0).reduce((s, tx) => s + Number(tx.change_amount), 0))
  const countDeposits = transactions.filter(tx => tx.type === 'deposit').length
  const countPayments = transactions.filter(tx => tx.type !== 'deposit').length

  const exportToExcel = async () => {
    try {
      const ExcelJS = (await import('exceljs')).default
      const workbook = new ExcelJS.Workbook()
      workbook.creator = 'Oracle Cloud Management'
      workbook.created = new Date()

      const worksheet = workbook.addWorksheet('Lá»‹ch sá»­ giao dá»‹ch', {
        views: [{ state: 'frozen', ySplit: 1 }],
      })

      worksheet.columns = [
        { header: 'STT', key: 'stt', width: 6 },
        { header: 'Loáº¡i giao dá»‹ch', key: 'type', width: 22 },
        { header: 'Sá»‘ tiá»n (VNÄ)', key: 'amount', width: 20 },
        { header: 'Sá»‘ dÆ° sau GD (VNÄ)', key: 'balance_after', width: 22 },
        { header: 'Payment ID', key: 'payment_id', width: 36 },
        { header: 'Thá»i gian', key: 'created_at', width: 22 },
      ]

      const headerRow = worksheet.getRow(1)
      headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } }
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true }
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF1E3A5F' } },
          left: { style: 'thin', color: { argb: 'FF1E3A5F' } },
          bottom: { style: 'thin', color: { argb: 'FF1E3A5F' } },
          right: { style: 'thin', color: { argb: 'FF1E3A5F' } },
        }
      })
      headerRow.height = 28

      filtered.forEach((tx, index) => {
        const amount = Number(tx.change_amount)
        const row = worksheet.addRow({
          stt: index + 1,
          type: TYPE_CONFIG[tx.type]?.label ?? tx.type,
          amount,
          balance_after: tx.balance_after != null ? Number(tx.balance_after) : '',
          payment_id: tx.payment_id || '',
          created_at: new Date(tx.created_at),
        })

        const rowFill = index % 2 === 0 ? 'FFFFFFFF' : 'FFF8F9FA'
        row.eachCell((cell, colNumber) => {
          cell.alignment = { vertical: 'middle', wrapText: false }
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          }
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: rowFill } }
          if (colNumber === 1) cell.alignment = { ...cell.alignment, horizontal: 'center' }
          if (colNumber === 3) {
            cell.numFmt = '#,##0'
            cell.alignment = { ...cell.alignment, horizontal: 'right' }
            cell.font = { color: { argb: amount >= 0 ? 'FF28A745' : 'FFDC3545' } }
          }
          if (colNumber === 4) { cell.numFmt = '#,##0'; cell.alignment = { ...cell.alignment, horizontal: 'right' } }
          if (colNumber === 6) { cell.numFmt = 'DD/MM/YYYY HH:MM:SS'; cell.alignment = { ...cell.alignment, horizontal: 'center' } }
        })
        row.height = 22
      })

      worksheet.addRow({})
      const summaryRow = worksheet.addRow({
        stt: '',
        type: `Tá»•ng ${filtered.length} giao dá»‹ch`,
        amount: filtered.reduce((s, tx) => s + Number(tx.change_amount), 0),
        balance_after: '',
        payment_id: '',
        created_at: '',
      })
      summaryRow.eachCell((cell, colNumber) => {
        cell.font = { bold: true }
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEBF5EB' } }
        if (colNumber === 3) { cell.numFmt = '#,##0'; cell.alignment = { horizontal: 'right' } }
      })
      summaryRow.height = 24

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lich-su-giao-dich-vi-${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: t('paymentHistory.exportSuccess'),
        description: t('paymentHistory.exportSuccessDesc', { count: filtered.length }),
        variant: 'default',
      })
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast({ title: t('paymentHistory.exportError'), description: t('paymentHistory.exportErrorDesc'), variant: 'destructive' })
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
      {/* Sidebar */}
      <WalletSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto pt-16 md:pt-0">
        <div className="container mx-auto px-4 max-w-6xl py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">{t('paymentHistory.title')}</h1>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Tá»•ng Ä‘Ã£ náº¡p</p>
                    <p className="text-lg font-bold text-blue-600">{formatPrice(totalIn)}â‚«</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Banknote className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Sá»‘ láº§n náº¡p tiá»n</p>
                    <p className="text-lg font-bold text-orange-600">{countDeposits}</p>
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
                    <p className="text-lg font-bold text-green-600">{formatPrice(totalOut)}â‚«</p>
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
                    <p className="text-sm text-gray-600 dark:text-muted-foreground">Sá»‘ láº§n thanh toÃ¡n</p>
                    <p className="text-lg font-bold text-purple-600">{countPayments}</p>
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
                    placeholder="TÃ¬m theo ID, loáº¡i giao dá»‹ch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-background dark:border-border dark:text-foreground"
                >
                  <option value="all">{t('paymentHistory.allTypes')}</option>
                  <option value="deposit">Náº¡p tiá»n</option>
                  <option value="subscription_payment">Thanh toÃ¡n gÃ³i</option>
                  <option value="auto_renewal">Gia háº¡n tá»± Ä‘á»™ng</option>
                  <option value="manual_renewal">Gia háº¡n thá»§ cÃ´ng</option>
                </select>

                <select
                  value={amountFilter}
                  onChange={(e) => setAmountFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white dark:bg-background dark:border-border dark:text-foreground"
                >
                  <option value="all">Táº¥t cáº£ chiá»u tiá»n</option>
                  <option value="positive">Chá»‰ tiá»n vÃ o (+)</option>
                  <option value="negative">Chá»‰ tiá»n ra (âˆ’)</option>
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
                  filtered.map((tx) => {
                    const amount = Number(tx.change_amount)
                    const isCredit = amount > 0
                    const typeCfg = TYPE_CONFIG[tx.type] ?? DEFAULT_TYPE_CONFIG
                    const Icon = isCredit ? TrendingUp : TrendingDown

                    return (
                      <div
                        key={tx.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-2 rounded-lg ${isCredit ? 'bg-green-100' : 'bg-red-100'}`}>
                              <Icon className={`h-5 w-5 ${isCredit ? 'text-green-600' : 'text-red-600'}`} />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <Badge variant="outline" className={typeCfg.color}>
                                  {typeCfg.label}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-muted-foreground">
                                <span>ID: {tx.id.substring(0, 8)}â€¦</span>
                                <span>â€¢</span>
                                <span>{formatDate(tx.created_at)}</span>
                                {tx.balance_after != null && (
                                  <>
                                    <span>â€¢</span>
                                    <span>Sá»‘ dÆ° sau: {formatPrice(Number(tx.balance_after))}â‚«</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className={`text-lg font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                {isCredit ? '+' : ''}{formatPrice(amount)}â‚«
                              </p>
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
              Chi tiáº¿t giao dá»‹ch
            </DialogTitle>
          </DialogHeader>

          {selected && (() => {
            const amount = Number(selected.change_amount)
            const isCredit = amount > 0
            const typeCfg = TYPE_CONFIG[selected.type] ?? DEFAULT_TYPE_CONFIG

            return (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={typeCfg.color}>
                    {typeCfg.label}
                  </Badge>
                </div>

                {/* Amount */}
                <div className="bg-white dark:bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-foreground mb-1">{t('paymentHistory.detail.amount')}</p>
                  <p className={`text-3xl font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                    {isCredit ? '+' : ''}{formatPrice(amount)}â‚«
                  </p>
                  {selected.balance_after != null && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Sá»‘ dÆ° sau giao dá»‹ch: {formatPrice(Number(selected.balance_after))}â‚«
                    </p>
                  )}
                </div>

                <div className="divide-y divide-border rounded-lg border">
                  {/* Transaction ID */}
                  <div className="flex items-start justify-between px-4 py-3 gap-3">
                    <span className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                      <Hash className="h-4 w-4" />
                      {t('paymentHistory.detail.paymentId')}
                    </span>
                    <div className="flex items-center gap-1 min-w-0">
                      <span className="text-sm font-mono truncate">{selected.id}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopyText(selected.id, 'ID')}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Payment ID */}
                  {selected.payment_id && (
                    <div className="flex items-start justify-between px-4 py-3 gap-3">
                      <span className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                        <Hash className="h-4 w-4" />
                        Payment ID
                      </span>
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-sm font-mono truncate">{selected.payment_id}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopyText(selected.payment_id, 'Payment ID')}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Created at */}
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
