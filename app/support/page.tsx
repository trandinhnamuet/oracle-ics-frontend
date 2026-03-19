'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useTranslation } from 'react-i18next'
import {
  Send, HeadphonesIcon, Clock, CheckCircle2, XCircle,
  AlertCircle, RefreshCw, ChevronDown, ChevronUp, AlertTriangle, MessageSquare,
  Paperclip, X, FileText, Image as ImageIcon, Download,
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
  uploadSupportFiles,
  parseAttachments,
  SupportTicket,
  CreateTicketPayload,
  TicketAttachment,
} from '@/api/support-ticket.api'

const MAX_FILE_SIZE_MB = 20
const MAX_FILES = 10
const ALLOWED_TYPES = 'image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain'

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4 text-blue-500" />
  return <FileText className="h-4 w-4 text-orange-500" />
}

type FormData = {
  title: string
  customer_name: string
  email: string
  phone?: string
  address?: string
  service?: string
  content: string
}

export default function SupportPage() {
  const { t } = useTranslation()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = useMemo(() => ({
    open:        { label: t('support.status.open'),        color: 'bg-red-50 text-red-700 border border-red-200',   icon: AlertCircle },
    in_progress: { label: t('support.status.in_progress'), color: 'bg-orange-50 text-orange-700 border border-orange-200', icon: RefreshCw },
    resolved:    { label: t('support.status.resolved'),    color: 'bg-green-50 text-green-700 border border-green-200', icon: CheckCircle2 },
    closed:      { label: t('support.status.closed'),      color: 'bg-gray-50 text-gray-600 border border-gray-200 dark:bg-muted dark:text-muted-foreground dark:border-border', icon: XCircle },
  }), [t])

  const SERVICES = useMemo(() => [
    { value: 'cloud',   label: t('support.services.cloud') },
    { value: 'storage', label: t('support.services.storage') },
    { value: 'network', label: t('support.services.network') },
    { value: 'billing', label: t('support.services.billing') },
    { value: 'account', label: t('support.services.account') },
    { value: 'other',   label: t('support.services.other') },
  ], [t])

  const schema = useMemo(() => z.object({
    title:         z.string().min(5, t('support.validation.titleMin')).max(255),
    customer_name: z.string().min(2, t('support.validation.nameMin')).max(150),
    email:         z.string().email(t('support.validation.emailInvalid')),
    phone:         z.string().optional(),
    address:       z.string().optional(),
    service:       z.string().optional(),
    content:       z.string().min(10, t('support.validation.contentMin')),
  }), [t])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [myTickets, setMyTickets] = useState<SupportTicket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(false)
  const [ticketError, setTicketError] = useState<string | null>(null)
  const [expandedTicket, setExpandedTicket] = useState<number | null>(null)
  const [selectedService, setSelectedService] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadingFiles, setUploadingFiles] = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_name: '',
      email: '',
    },
  })

  const loadTickets = React.useCallback(async () => {
    setLoadingTickets(true)
    setTicketError(null)
    try {
      const data = await getMyTickets()
      setMyTickets(data)
    } catch (err: any) {
      const msg = err?.message || 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch yÃªu cáº§u'
      setTicketError(msg)
    } finally {
      setLoadingTickets(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
      setValue('customer_name', name)
      setValue('email', user.email)
    }
  }, [user, setValue])

  useEffect(() => {
    if (isAuthenticated) {
      loadTickets()
    }
  }, [isAuthenticated, loadTickets])

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const combined = [...selectedFiles, ...files]
    if (combined.length > MAX_FILES) {
      toast({ title: t('support.files.tooMany', { max: MAX_FILES }), variant: 'destructive' })
      e.target.value = ''
      return
    }
    const oversized = files.filter(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024)
    if (oversized.length > 0) {
      toast({ title: t('support.files.tooLarge', { maxMB: MAX_FILE_SIZE_MB }), variant: 'destructive' })
      e.target.value = ''
      return
    }
    setSelectedFiles(combined)
    e.target.value = ''
  }

  const removeFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true)
      let attachmentsJson: string | undefined
      if (selectedFiles.length > 0) {
        setUploadingFiles(true)
        const uploaded = await uploadSupportFiles(selectedFiles)
        setUploadingFiles(false)
        attachmentsJson = JSON.stringify(uploaded)
      }
      const payload: CreateTicketPayload = {
        ...data,
        service: selectedService || undefined,
        attachments: attachmentsJson,
      }
      await createSupportTicket(payload)
      toast({ title: t('support.submitSuccess'), description: t('support.submitSuccessDesc') })
      reset()
      setSelectedService('')
      setSelectedFiles([])
      if (isAuthenticated) {
        await loadTickets()
      }
    } catch (err: any) {
      setUploadingFiles(false)
      toast({ title: t('support.submitError'), description: err.message, variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg mb-4">
            <HeadphonesIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-2">
            {t('support.title') || 'Trung TÃ¢m Há»— Trá»£'}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('support.subtitle') || 'ChÃºng tÃ´i sáºµn sÃ ng giÃºp báº¡n. Vui lÃ²ng gá»­i yÃªu cáº§u cá»§a báº¡n dÆ°á»›i Ä‘Ã¢y'}
          </p>
        </div>

        {/* Form Section */}
        <div className="mb-12">
          <Card className="border shadow-xl bg-card">
            <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg p-8">
              <CardTitle className="text-2xl flex items-center gap-3">
                <Send className="h-6 w-6" />
                {t('support.submit') || 'Gá»­i YÃªu Cáº§u Há»— Trá»£'}
              </CardTitle>
              <p className="text-red-100 text-sm mt-2">{t('support.formNote')}</p>
            </CardHeader>

            <CardContent className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Title Field */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-semibold">
                    {t('support.fields.title')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder={t('support.fields.titlePlaceholder')}
                    {...register('title')}
                    className={`h-11 rounded-lg focus:border-red-500 focus:ring-red-500 ${errors.title ? 'border-red-500' : ''}`}
                  />
                  {errors.title && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.title.message}</p>}
                </div>

                {/* Name + Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name" className="font-semibold">
                      {t('support.fields.name')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customer_name"
                      placeholder={t('support.fields.namePlaceholder')}
                      {...register('customer_name')}
                      className={`h-11 rounded-lg focus:border-red-500 focus:ring-red-500 ${errors.customer_name ? 'border-red-500' : ''}`}
                    />
                    {errors.customer_name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.customer_name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      {...register('email')}
                      className={`h-11 rounded-lg focus:border-red-500 focus:ring-red-500 ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.email.message}</p>}
                  </div>
                </div>

                {/* Phone + Service Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="font-semibold">
                      {t('support.fields.phone')}
                    </Label>
                    <Input
                      id="phone"
                      placeholder="(+84) 123 456 789"
                      {...register('phone')}
                      className="h-11 rounded-lg focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">{t('support.fields.service')}</Label>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                      <SelectTrigger className="h-11 rounded-lg focus:border-red-500 focus:ring-red-500">
                        <SelectValue placeholder={t('support.fields.servicePlaceholder')} />
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
                  <Label htmlFor="address" className="font-semibold">
                    {t('support.fields.address')}
                  </Label>
                  <Input
                    id="address"
                    placeholder={t('support.fields.addressPlaceholder')}
                    {...register('address')}
                    className="h-11 rounded-lg focus:border-red-500 focus:ring-red-500"
                  />
                </div>

                {/* Content Field */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="font-semibold">
                    {t('support.fields.content')} <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder={t('support.fields.contentPlaceholder')}
                    rows={5}
                    {...register('content')}
                    className={`rounded-lg focus:border-red-500 focus:ring-red-500 resize-none ${errors.content ? 'border-red-500' : ''}`}
                  />
                  {errors.content && <p className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{errors.content.message}</p>}
                </div>

                {/* File Attachments */}
                <div className="space-y-3">
                  <Label className="font-semibold">{t('support.fields.attachments')}</Label>
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 dark:hover:bg-red-950/10 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {t('support.fields.attachmentsPlaceholder')}{' '}
                      <span className="text-red-500 font-medium">{t('support.fields.attachmentsBrowse')}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t('support.files.limits', { max: MAX_FILES, maxMB: MAX_FILE_SIZE_MB })}
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ALLOWED_TYPES}
                    className="hidden"
                    onChange={handleFilePick}
                  />
                  {selectedFiles.length > 0 && (
                    <div className="space-y-2">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-3 py-2">
                          {getFileIcon(file.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                          </div>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => removeFile(idx)}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {uploadingFiles ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />{t('support.uploadingFiles')}</>
                  ) : isSubmitting ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />{t('support.submitting')}</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" />{t('support.submit')}</>
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
                <h2 className="text-2xl font-bold text-foreground">{t('support.myTickets')}</h2>
                <p className="text-sm text-muted-foreground">{t('support.myTicketsSubtitle')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-950/30"
                disabled={loadingTickets}
                onClick={loadTickets}
              >
                <RefreshCw className={`h-4 w-4 ${loadingTickets ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {loadingTickets ? (
              <Card className="border shadow-lg">
                <CardContent className="flex justify-center py-12">
                  <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-red-200 border-t-red-500 mx-auto" />
                    <p className="text-sm text-muted-foreground">{t('support.loadingTickets')}</p>
                  </div>
                </CardContent>
              </Card>
            ) : ticketError ? (
              <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 shadow-lg">
                <CardContent className="pt-6 text-center space-y-4">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
                  <div>
                    <p className="font-medium text-foreground">{t('support.fetchErrorTitle')}</p>
                    <p className="text-sm text-red-600 mt-1">{ticketError}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={loadTickets}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />{t('support.retryBtn')}
                  </Button>
                </CardContent>
              </Card>
            ) : myTickets.length === 0 ? (
              <Card className="border shadow-lg">
                <CardContent className="pt-12 pb-12 text-center space-y-4">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-medium text-foreground">{t('support.emptyTitle')}</p>
                    <p className="text-sm text-muted-foreground">{t('support.emptySubtitle')}</p>
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
                  const attachments = parseAttachments(ticket)

                  return (
                    <Card
                      key={ticket.id}
                      className={`border shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-xl ${
                        isExpanded ? 'ring-2 ring-red-500' : ''
                      }`}
                    >
                      {/* Ticket Header */}
                      <button
                        className="w-full px-6 py-4 text-left hover:bg-muted/30 transition-colors"
                        onClick={() => setExpandedTicket(isExpanded ? null : ticket.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-muted">
                            <StatusIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground truncate">{ticket.title}</h3>
                              {hasAdminReply && (
                                <Badge className="bg-red-500 text-white text-[10px] shrink-0">
                                  {t('support.hasReply')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              #{ticket.id} {t('support.ticketSubmittedOn')} {formatDate(ticket.created_at)}
                              {attachments.length > 0 && (
                                <span className="ml-2">
                                  <Paperclip className="h-3 w-3 inline" /> {attachments.length}
                                </span>
                              )}
                            </p>
                          </div>
                          <Badge className={`${cfg.color} text-xs font-medium shrink-0`}>
                            {cfg.label}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-border bg-muted/20">
                          {/* Status Timeline */}
                          <div className="px-6 py-4 bg-card border-b border-border">
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-muted-foreground">{t('support.statusLabel')}</span>
                                <Badge className={`${cfg.color} flex items-center gap-1 text-xs`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {cfg.label}
                                </Badge>
                              </div>
                              {ticket.resolved_at && (
                                <span className="text-xs text-muted-foreground">
                                  {t('support.resolvedAt')} {formatDate(ticket.resolved_at)}
                                </span>
                              )}
                              {ticket.service && (
                                <span className="text-xs text-muted-foreground ml-auto">
                                  {t('support.serviceLabel')} <span className="font-medium">{SERVICES.find(s => s.value === ticket.service)?.label}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="px-6 py-4 border-b border-border bg-card">
                            <p className="text-xs font-semibold text-muted-foreground mb-2">{t('support.requestContent')}</p>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{ticket.content}</p>
                          </div>

                          {/* Attachments Section */}
                          {attachments.length > 0 && (
                            <div className="px-6 py-4 border-b border-border bg-card">
                              <p className="text-xs font-semibold text-muted-foreground mb-3">
                                <Paperclip className="h-3 w-3 inline mr-1" />{t('support.attachmentsLabel')} ({attachments.length})
                              </p>
                              <div className="space-y-2">
                                {attachments.map((att, idx) => (
                                  <AttachmentItem key={idx} att={att} />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Admin Reply or Pending */}
                          <div className="px-6 py-4 bg-card">
                            {ticket.admin_note ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="h-4 w-4 text-red-500" />
                                  <p className="text-xs font-semibold text-red-600">{t('support.adminReplyTitle')}</p>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap ml-6 bg-muted rounded p-3 border border-border">
                                  {ticket.admin_note}
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4 mt-0.5 text-orange-500 flex-shrink-0" />
                                <p>{t('support.waitingReply')}</p>
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

function AttachmentItem({ att }: { att: TicketAttachment }) {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003').replace(/\/$/, '')
  const isImage = att.mimeType.startsWith('image/')
  const fullUrl = att.url.startsWith('http') ? att.url : `${apiBase}${att.url}`

  if (isImage) {
    return (
      <div className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-3 py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fullUrl} alt={att.name} className="h-10 w-10 object-cover rounded" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{att.name}</p>
          <p className="text-xs text-muted-foreground">{formatBytes(att.size)}</p>
        </div>
        <a href={fullUrl} target="_blank" rel="noopener noreferrer" download={att.name}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        </a>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-3 py-2">
      <FileText className="h-8 w-8 text-orange-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{att.name}</p>
        <p className="text-xs text-muted-foreground">{att.mimeType} {formatBytes(att.size)}</p>
      </div>
      <a href={fullUrl} target="_blank" rel="noopener noreferrer" download={att.name}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Download className="h-4 w-4" />
        </Button>
      </a>
    </div>
  )
}

