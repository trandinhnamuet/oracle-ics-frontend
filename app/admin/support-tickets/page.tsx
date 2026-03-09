'use client'

import React, { useEffect, useState } from 'react'
import {
  HeadphonesIcon, Search, RefreshCw, Trash2, CheckCircle2,
  XCircle, AlertCircle, Clock, ChevronDown, ChevronUp, Save,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { getAllTickets, updateTicket, deleteTicket, SupportTicket } from '@/api/support-ticket.api'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  open:        { label: 'Đang mở',      className: 'bg-blue-100 text-blue-700 border-blue-200',   icon: AlertCircle },
  in_progress: { label: 'Đang xử lý',  className: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: RefreshCw },
  resolved:    { label: 'Đã giải quyết', className: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  closed:      { label: 'Đã đóng',      className: 'bg-gray-100 text-gray-500 border-gray-200',   icon: XCircle },
}

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low:    { label: 'Thấp',       className: 'bg-slate-100 text-slate-600' },
  medium: { label: 'Trung bình', className: 'bg-blue-100 text-blue-600' },
  high:   { label: 'Cao',        className: 'bg-orange-100 text-orange-600' },
  urgent: { label: 'Khẩn cấp',  className: 'bg-red-100 text-red-600 font-semibold' },
}

const SERVICES: Record<string, string> = {
  cloud: 'Cloud Server', storage: 'Object Storage',
  network: 'Network / VPN', billing: 'Thanh toán',
  account: 'Tài khoản', other: 'Khác',
}

export default function AdminSupportTicketsPage() {
  const { toast } = useToast()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [filtered, setFiltered] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [editNote, setEditNote] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const [pendingDeleteTicketId, setPendingDeleteTicketId] = useState<number | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAllTickets()
      setTickets(data)
      setFiltered(data)
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách yêu cầu', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Filtering
  useEffect(() => {
    let list = [...tickets]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.customer_name.toLowerCase().includes(q)
      )
    }
    if (filterStatus !== 'all') list = list.filter(t => t.status === filterStatus)
    if (filterPriority !== 'all') list = list.filter(t => t.priority === filterPriority)
    setFiltered(list)
  }, [search, filterStatus, filterPriority, tickets])

  const handleUpdate = async (id: number, data: { status?: string; priority?: string; admin_note?: string }) => {
    setSaving(prev => ({ ...prev, [id]: true }))
    try {
      const updated = await updateTicket(id, data)
      setTickets(prev => prev.map(t => t.id === id ? updated : t))
      // Clear local edit state so the textarea reflects the saved value
      if ('admin_note' in data) {
        setEditNote(prev => { const n = { ...prev }; delete n[id]; return n })
      }
      toast({ title: 'Đã cập nhật', description: 'Ticket đã được cập nhật thành công' })
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e.message, variant: 'destructive' })
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }))
    }
  }

  const handleDelete = (id: number) => {
    setPendingDeleteTicketId(id)
  }

  const executeDeleteTicket = async () => {
    if (pendingDeleteTicketId === null) return
    const id = pendingDeleteTicketId
    setPendingDeleteTicketId(null)
    try {
      await deleteTicket(id)
      setTickets(prev => prev.filter(t => t.id !== id))
      toast({ title: 'Đã xóa ticket' })
    } catch (e: any) {
      toast({ title: 'Lỗi', description: e.message, variant: 'destructive' })
    }
  }

  // Stats
  const stats = {
    total:       tickets.length,
    open:        tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved:    tickets.filter(t => t.status === 'resolved').length,
    urgent:      tickets.filter(t => t.priority === 'urgent').length,
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <HeadphonesIcon className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Quản lý Yêu cầu Hỗ trợ</h1>
            <p className="text-sm text-muted-foreground">Theo dõi và xử lý các yêu cầu hỗ trợ từ người dùng</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Tổng yêu cầu', value: stats.total,       color: 'text-foreground' },
          { label: 'Đang mở',       value: stats.open,        color: 'text-blue-600' },
          { label: 'Đang xử lý',    value: stats.in_progress, color: 'text-yellow-600' },
          { label: 'Đã giải quyết', value: stats.resolved,    color: 'text-green-600' },
          { label: 'Khẩn cấp',      value: stats.urgent,      color: 'text-red-600' },
        ].map(s => (
          <Card key={s.label} className="text-center py-4">
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tiêu đề, email, tên..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"><span>Tất cả trạng thái</span></SelectItem>
                <SelectItem value="open"><span>Đang mở</span></SelectItem>
                <SelectItem value="in_progress"><span>Đang xử lý</span></SelectItem>
                <SelectItem value="resolved"><span>Đã giải quyết</span></SelectItem>
                <SelectItem value="closed"><span>Đã đóng</span></SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Độ ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all"><span>Tất cả mức độ</span></SelectItem>
                <SelectItem value="urgent"><span>Khẩn cấp</span></SelectItem>
                <SelectItem value="high"><span>Cao</span></SelectItem>
                <SelectItem value="medium"><span>Trung bình</span></SelectItem>
                <SelectItem value="low"><span>Thấp</span></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-base">Danh sách yêu cầu ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">Không có yêu cầu nào</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="w-10">#</TableHead>
                    <TableHead>Tiêu đề / Khách hàng</TableHead>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ưu tiên</TableHead>
                    <TableHead>Ngày gửi</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(ticket => {
                    const statusCfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open
                    const priorityCfg = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.medium
                    const isExpanded = expandedId === ticket.id
                    const StatusIcon = statusCfg.icon

                    return (
                      <React.Fragment key={ticket.id}>
                        <TableRow
                          className={`cursor-pointer hover:bg-muted/30 ${isExpanded ? 'bg-muted/20 border-b-0' : ''}`}
                          onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                        >
                          <TableCell className="font-mono text-xs text-muted-foreground">#{ticket.id}</TableCell>
                          <TableCell>
                            <div className="font-medium line-clamp-1">{ticket.title}</div>
                            <div className="text-xs text-muted-foreground">{ticket.customer_name} · {ticket.email}</div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{SERVICES[ticket.service ?? ''] ?? ticket.service ?? '—'}</span>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusCfg.className} flex items-center gap-1 w-fit`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${priorityCfg.className} border-0 text-xs`}>
                              {priorityCfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(ticket.created_at)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                              >
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:text-destructive"
                                onClick={() => handleDelete(ticket.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Expanded detail row */}
                        {isExpanded && (
                          <TableRow className="bg-muted/10 hover:bg-muted/10">
                            <TableCell colSpan={7} className="p-0">
                              <div className="px-6 py-5 space-y-4 border-t border-dashed">
                                {/* Contact info */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                                  {ticket.phone && <div><span className="text-muted-foreground">Điện thoại:</span> {ticket.phone}</div>}
                                  {ticket.address && <div className="sm:col-span-2"><span className="text-muted-foreground">Địa chỉ:</span> {ticket.address}</div>}
                                </div>

                                {/* Content */}
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Nội dung yêu cầu:</p>
                                  <p className="text-sm whitespace-pre-wrap bg-background border rounded-md p-3">{ticket.content}</p>
                                </div>

                                {/* Admin actions */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t">
                                  {/* Status */}
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-muted-foreground">Trạng thái</p>
                                    <Select
                                      value={ticket.status}
                                      onValueChange={v => handleUpdate(ticket.id, { status: v })}
                                    >
                                      <SelectTrigger className="h-8 text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="open"><span>Đang mở</span></SelectItem>
                                        <SelectItem value="in_progress"><span>Đang xử lý</span></SelectItem>
                                        <SelectItem value="resolved"><span>Đã giải quyết</span></SelectItem>
                                        <SelectItem value="closed"><span>Đóng</span></SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Priority */}
                                  <div className="space-y-1.5">
                                    <p className="text-xs font-medium text-muted-foreground">Độ ưu tiên</p>
                                    <Select
                                      value={ticket.priority}
                                      onValueChange={v => handleUpdate(ticket.id, { priority: v })}
                                    >
                                      <SelectTrigger className="h-8 text-sm">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="low"><span>Thấp</span></SelectItem>
                                        <SelectItem value="medium"><span>Trung bình</span></SelectItem>
                                        <SelectItem value="high"><span>Cao</span></SelectItem>
                                        <SelectItem value="urgent"><span>Khẩn cấp</span></SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  {/* Resolved info */}
                                  {ticket.resolved_at && (
                                    <div className="space-y-1.5">
                                      <p className="text-xs font-medium text-muted-foreground">Giải quyết lúc</p>
                                      <p className="text-sm">{formatDate(ticket.resolved_at)}</p>
                                    </div>
                                  )}
                                </div>

                                {/* Admin note */}
                                <div className="space-y-1.5">
                                  <p className="text-xs font-medium text-muted-foreground">Ghi chú / Phản hồi gửi cho khách</p>
                                  <Textarea
                                    rows={3}
                                    placeholder="Nhập phản hồi cho khách hàng... (khách hàng sẽ thấy nội dung này)"
                                    value={editNote[ticket.id] ?? ticket.admin_note ?? ''}
                                    onChange={e => setEditNote(prev => ({ ...prev, [ticket.id]: e.target.value }))}
                                    className="text-sm"
                                  />
                                  <Button
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    disabled={saving[ticket.id]}
                                    onClick={() => handleUpdate(ticket.id, { admin_note: editNote[ticket.id] ?? ticket.admin_note ?? '' })}
                                  >
                                    {saving[ticket.id]
                                      ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" />Đang lưu...</>
                                      : <><Save className="h-4 w-4 mr-2" />Lưu phản hồi</>
                                    }
                                  </Button>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={pendingDeleteTicketId !== null} onOpenChange={(open) => !open && setPendingDeleteTicketId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa yêu cầu hỗ trợ</AlertDialogTitle>
            <AlertDialogDescription>Bạn chắc chắn muốn xóa yêu cầu hỗ trợ này? Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteTicket} className="bg-destructive hover:bg-destructive/90">Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
