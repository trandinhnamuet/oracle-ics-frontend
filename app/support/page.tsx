'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import {
  Send, HeadphonesIcon, Clock, CheckCircle2, XCircle,
  AlertCircle, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, MessageSquare,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'
import {
  createSupportTicket,
  getMyTickets,
  SupportTicket,
  CreateTicketPayload,
} from '@/api/support-ticket.api'

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  open:        { label: 'Đang mở',      color: 'bg-red-50 text-red-700 border border-red-200',   icon: AlertCircle },
  in_progress: { label: 'Đang xử lý',  color: 'bg-orange-50 text-orange-700 border border-orange-200', icon: RefreshCw },
  resolved:    { label: 'Đã giải quyết', color: 'bg-green-50 text-green-700 border border-green-200', icon: CheckCircle2 },
  closed:      { label: 'Đã đóng',      color: 'bg-gray-50 text-gray-600 border border-gray-200',   icon: XCircle },
}

const SERVICES = [
  { value: 'cloud',   label: 'Cloud Server' },
  { value: 'storage', label: 'Object Storage' },
  { value: 'network', label: 'Network / VPN' },
  { value: 'billing', label: 'Thanh toán' },
  { value: 'account', label: 'Tài khoản' },
  { value: 'other',   label: 'Khác' },
]

const schema = z.object({
  title:         z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự').max(255),
  customer_name: z.string().min(2, 'Vui lòng nhập tên').max(150),
  email:         z.string().email('Email không hợp lệ'),
  phone:         z.string().optional(),
  address:       z.string().optional(),
  service:       z.string().optional(),
  content:       z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
})

type FormData = z.infer<typeof schema>

export default function SupportPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [ticketError, setTicketError] = useState<string | null>(null)
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null)
  const [selectedService, setSelectedService] = useState('')

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: '',
      email: '',
    },
  })

  // Extract loadTickets so it can be called from multiple places
  const loadTickets = React.useCallback(async () => {
    setLoadingTickets(true)
    setTicketError(null)
    try {
      const data = await getMyTickets()
      setMyTickets(data)
    } catch (err: any) {
      const msg = err?.message || 'Không thể tải danh sách yêu cầu'
      setTicketError(msg)
    } finally {
      setLoadingTickets(false)
    }
  }, [])

  // Pre-fill from user profile
  useEffect(() => {
    if (user) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
      setValue('customer_name', name)
      setValue('email', user.email)
    }
  }, [user, setValue])

  // Load existing tickets once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadTickets()
    }
  }, [isAuthenticated, loadTickets])

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      const payload: CreateTicketPayload = {
        ...data,
        service: selectedService || undefined,
      }
      await createSupportTicket(payload)
      toast({ title: t('support.submitSuccess'), description: t('support.submitSuccessDesc') })
      reset()
      setSelectedService('')
      // Refresh the ticket list after successful submission
      if (isAuthenticated) {
        await loadTickets()
      }
    } catch (err: any) {
      toast({ title: t('support.submitError'), description: err.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg mb-4">
            <HeadphonesIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2">
            {t('support.title') || 'Trung Tâm Hỗ Trợ'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('support.subtitle') || 'Chúng tôi sẵn sàng giúp bạn. Vui lòng gửi yêu cầu của bạn dưới đây'}
          </p>
        </div>

        {/* Form Section */}
        <div className="mb-12">
          <Card className="border-0 shadow-xl bg-white">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg p-8">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Send className="h-6 w-6" />
                {t('support.submit') || 'Gửi Yêu Cầu Hỗ Trợ'}
              </CardTitle>
              <p className="text-red-100 text-sm mt-2">Điền đầy đủ thông tin để chúng tôi hiểu rõ vấn đề của bạn</p>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-semibold text-gray-700">
                    Tiêu đề yêu cầu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="Ví dụ: Vấn đề về kết nối máy chủ"
                    {...register('title')}
                    className={`h-11 border-gray-200 rounded-lg focus:border-red-500 focus:ring-red-500 ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.title.message}</p>}
                </div>

                {/* Name + Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name" className="font-semibold text-gray-700">
                      Tên của bạn <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customer_name"
                      placeholder="Nhập tên đầy đủ"
                      {...register('customer_name')}
                      className={`h-11 border-gray-200 rounded-lg focus:border-red-500 focus:ring-red-500 ${errors.customer_name ? 'border-red-500' : ''}`}
                    />
                    {errors.customer_name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.customer_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register('email')}
                      className={`h-11 border-gray-200 rounded-lg focus:border-red-500 focus:ring-red-500 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.email.message}</p>}
                  </div>
                </div>

                {/* Phone + Service Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-semibold text-gray-700">
                      Điện thoại
                    </Label>
                    <Input
                      id="phone"
                      placeholder="(+84) 123 456 789"
                      {...register('phone')}
                      className="h-11 border-gray-200 rounded-lg focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold text-gray-700">Dịch vụ liên quan</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger className="h-11 border-gray-200 rounded-lg focus:border-red-500 focus:ring-red-500">
                        <SelectValue placeholder="Chọn dịch vụ" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICES.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Address Field */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="font-semibold text-gray-700">
                    Địa chỉ
                  </Label>
                  <Input
                    id="address"
                    placeholder="Địa chỉ công ty hoặc nơi làm việc"
                    {...register('address')}
                    className="h-11 border-gray-200 rounded-lg focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                {/* Content Field */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="font-semibold text-gray-700">
                    Chi tiết vấn đề <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Mô tả chi tiết vấn đề bạn gặp phải... (tối thiểu 10 ký tự)"
                    rows={5}
                    {...register('content')}
                    className={`border-gray-200 rounded-lg focus:border-red-500 focus:ring-red-500 resize-none ${errors.content ? 'border-red-500' : ''}`}
                  />
                  {errors.content && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.content.message}</p>}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isSubmitting ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Đang gửi...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" />Gửi Yêu Cầu</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* My Requests Section (Only for Authenticated Users) */}
        {isAuthenticated && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-red-600">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">Yêu Cầu Của Tôi</h2>
                <p className="text-sm text-gray-500">Theo dõi trạng thái các yêu cầu đã gửi</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                disabled={loadingTickets}
                onClick={loadTickets}
              >
                <RefreshCw className={`h-4 w-4 ${loadingTickets ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {loadingTickets ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="flex justify-center py-12">
                  <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-200 border-t-red-500 mx-auto" />
                    <p className="text-sm text-gray-500">Đang tải yêu cầu của bạn...</p>
                  </div>
                </CardContent>
              </Card>
            ) : ticketError ? (
              <Card className="border-red-200 bg-red-50 shadow-lg">
                <CardContent className="pt-6 text-center space-y-4">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
                  <div>
                    <p className="font-medium text-gray-900">Không thể tải dữ liệu</p>
                    <p className="text-sm text-red-600 mt-1">{ticketError}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={loadTickets}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />Thử lại
                  </Button>
                </CardContent>
              </Card>
            ) : myTickets.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="pt-12 pb-12 text-center space-y-4">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto" />
                  <div>
                    <p className="font-medium text-gray-700">Chưa có yêu cầu nào</p>
                    <p className="text-sm text-gray-500 mt-1">Các yêu cầu của bạn sẽ hiển thị tại đây</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {myTickets.map(ticket => {
                  const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open
                  const StatusIcon = cfg.icon
                  const isExpanded = expandedTicket === ticket.id
                  const hasAdminReply = !!ticket.admin_note

                  return (
                    <Card
                      key={ticket.id}
                      className={`border-0 shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl ${
                        isExpanded ? 'ring-2 ring-red-500' : ''
                      } ${hasAdminReply ? 'bg-gradient-to-r from-red-50/50' : ''}`}
                    >
                      {/* Ticket Header */}
                      <button
                        className="w-full px-6 py-4 text-left hover:bg-gray-50/50 transition-colors"
                        onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-gray-100">
                            <StatusIcon className="h-5 w-5 text-gray-700" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">{ticket.title}</h3>
                              {hasAdminReply && (
                                <Badge className="bg-red-500 text-white text-[10px] shrink-0">
                                  Có phản hồi
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">
                              #{ticket.id} • Gửi {formatDate(ticket.created_at)}
                            </p>
                          </div>
                          <Badge className={`${cfg.color} text-xs font-medium shrink-0`}>
                            {cfg.label}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50/50">
                          {/* Status Timeline */}
                          <div className="px-6 py-4 bg-white border-b border-gray-200">
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600">Trạng thái:</span>
                                <Badge className={`${cfg.color} flex items-center gap-1 text-xs`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {cfg.label}
                                </Badge>
                              </div>
                              {ticket.resolved_at && (
                                <span className="text-xs text-gray-500">
                                  Giải quyết: {formatDate(ticket.resolved_at)}
                                </span>
                              )}
                              {ticket.service && (
                                <span className="text-xs text-gray-500 ml-auto">
                                  Dịch vụ: <span className="font-medium">{SERVICES.find(s => s.value === ticket.service)?.label}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="px-6 py-4 border-b border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Nội dung yêu cầu:</p>
                            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{ticket.content}</p>
                          </div>

                          {/* Admin Reply or Pending */}
                          <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-white">
                            {ticket.admin_note ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-red-500" />
                                  <p className="text-xs font-semibold text-red-600">Phản hồi từ bộ phận hỗ trợ:</p>
                                </div>
                                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap ml-6 bg-white rounded p-3 border border-red-200">
                                  {ticket.admin_note}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-start gap-3 text-sm text-gray-600">
                                <Clock className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                                <p>Chúng tôi đang xử lý yêu cầu của bạn. Vui lòng chờ phản hồi từ bộ phận hỗ trợ.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
