'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, CheckCircle, Copy, Loader, Banknote, Clock, RefreshCw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { paymentApi } from '@/api/payment.api'
import Image from 'next/image'
import { Suspense, useEffect, useState } from 'react'

function SubscriptionCheckoutContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // States
  const [qrUrl, setQrUrl] = useState<string>('')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [countdown, setCountdown] = useState(900) // 15 phút
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  
  // Lấy data từ query params
  const paymentId = searchParams.get('paymentId')
  const subscriptionId = searchParams.get('subscriptionId')
  const amount = searchParams.get('amount') || '0'
  const method = searchParams.get('method') || 'sepay_qr'
  const type = searchParams.get('type') || 'subscription'

  // Tạo URL QR Sepay 
  const createQRUrl = (amount: string, transactionCode: string) => {
    const baseUrl = 'https://qr.sepay.vn/img'
    const params = new URLSearchParams({
      acc: process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '66010901964',
      bank: process.env.NEXT_PUBLIC_BANK_NAME || 'TPBank',
      amount: amount,
      des: transactionCode
    })
    return `${baseUrl}?${params.toString()}`
  }

  // Fetch payment status từ API
  const fetchPaymentStatus = async () => {
    if (!paymentId) return
    
    try {
      const response = await paymentApi.getPaymentStatus(paymentId)
      setPaymentData(response)
      setPaymentStatus(response.status)
      
      if (response.status === 'success') {
        // Dừng polling và chuyển trang
        if (pollingInterval) {
          clearInterval(pollingInterval)
          setPollingInterval(null)
        }
        
        toast({
          title: t('subscriptionCheckout.paymentSuccess'),
          description: t('subscriptionCheckout.subscriptionActivated'),
          variant: 'default'
        })
        
        // Chờ 2 giây rồi chuyển trang
        setTimeout(() => {
          router.push(`/checkout/subscription/success?subscriptionId=${subscriptionId}`)
        }, 2000)
      }
    } catch (error) {
      console.error('Error fetching payment status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Setup polling khi component mount
  useEffect(() => {
    if (!paymentId) {
      router.push('/')
      return
    }

    // Fetch ngay lần đầu
    fetchPaymentStatus()

    // Setup polling mỗi 5 giây
    const interval = setInterval(() => {
      fetchPaymentStatus()
    }, 5000)
    
    setPollingInterval(interval)

    // Cleanup khi component unmount
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [paymentId, router])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleCopyTransferInfo = () => {
    if (!paymentData) return
    
    const transferInfo = `
${t('subscriptionCheckout.bankLabel')} ${process.env.NEXT_PUBLIC_BANK_NAME || 'TPBank'}
${t('subscriptionCheckout.accountNumberLabel')} ${process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '66010901964'}
${t('subscriptionCheckout.amountLabel')} ${formatPrice(parseInt(amount))} VND
${t('subscriptionCheckout.contentLabel')} ${paymentData.transaction_code}
    `.trim()
    navigator.clipboard.writeText(transferInfo)
    toast({
      title: t('subscriptionCheckout.copiedTransferInfo'),
      variant: 'default'
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!paymentId || !amount || parseInt(amount) < 1) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">{t('subscriptionCheckout.invalidInfo')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('subscriptionCheckout.invalidInfoDesc')}
            </p>
            <Button onClick={() => router.push('/')}>
              {t('subscriptionCheckout.backHome')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('subscriptionCheckout.back')}
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{t('subscriptionCheckout.title')}</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Thông tin giao dịch */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Banknote className="h-5 w-5 mr-2 text-[#E60000]" />
                {t('subscriptionCheckout.transactionInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('subscriptionCheckout.transactionType')}</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {t('subscriptionCheckout.subscriptionRegistration')}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('subscriptionCheckout.paymentMethodLabel')}</span>
                <Badge variant="secondary">{t('subscriptionCheckout.bankTransfer')}</Badge>
              </div>

              {subscriptionId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('subscriptionCheckout.subscriptionIdLabel')}</span>
                  <span className="text-sm font-mono">{subscriptionId}</span>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>{t('subscriptionCheckout.paymentAmount')}</span>
                  <span className="text-[#E60000]">
                    {formatPrice(parseInt(amount))} VND
                  </span>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-foreground">{t('subscriptionCheckout.timeLeft')}</span>
                  <span className="text-lg font-bold text-orange-600">
                    {formatTime(countdown)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  {t('subscriptionCheckout.expireWarning')}
                </p>
              </div>

              {paymentData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>{t('subscriptionCheckout.transactionCode')}</strong> {paymentData.transaction_code}<br/>
                    {t('subscriptionCheckout.autoConfirm')}
                  </p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ {t('subscriptionCheckout.benefit1')}<br/>
                  ✓ {t('subscriptionCheckout.benefit2')}<br/>
                  ✓ {t('subscriptionCheckout.benefit3')}<br/>
                  ✓ {t('subscriptionCheckout.benefit4')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* QR Thanh toán */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {t('subscriptionCheckout.scanQR')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                {isLoading && !paymentData ? (
                  <div className="bg-white dark:bg-card p-4 rounded-lg inline-block shadow-sm border">
                      <div className="w-[200px] h-[200px] flex items-center justify-center">
                        <Loader className="h-8 w-8 animate-spin text-primary" />
                      </div>
                  </div>
                ) : paymentData ? (
                  <div className="bg-white dark:bg-white p-4 rounded-lg inline-block shadow-sm border">
                    <Image
                      src={createQRUrl(amount, paymentData.transaction_code)}
                      alt="QR Code thanh toán subscription"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-card p-4 rounded-lg inline-block shadow-sm border">
                    <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400 dark:text-muted-foreground">
                      {t('subscriptionCheckout.loadingPaymentInfo')}
                    </div>
                  </div>
                )}
                
                {paymentStatus === 'success' ? (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    {t('subscriptionCheckout.paymentSuccessRedirect')}
                  </p>
                ) : paymentStatus === 'pending' ? (
                  <p className="text-sm text-blue-600 mt-2 flex items-center justify-center">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    {t('subscriptionCheckout.checkingPayment')}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('subscriptionCheckout.scanQRDesc')}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-card border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('subscriptionCheckout.bankLabel')}</span>
                    <span className="text-sm font-medium">{process.env.NEXT_PUBLIC_BANK_NAME || 'TPBank'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('subscriptionCheckout.accountNumberLabel')}</span>
                    <span className="text-sm font-medium font-mono">{process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '66010901964'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('subscriptionCheckout.accountHolderLabel')}</span>
                    <span className="text-sm font-medium">{process.env.NEXT_PUBLIC_BANK_ACCOUNT_HOLDER || 'ICS COMPANY'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('subscriptionCheckout.amountLabel')}</span>
                    <span className="text-sm font-medium text-[#E60000]">
                      {formatPrice(parseInt(amount))} VND
                    </span>
                  </div>
                  {paymentData && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('subscriptionCheckout.contentLabel')}</span>
                      <span className="text-sm font-medium">{paymentData.transaction_code}</span>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleCopyTransferInfo}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('subscriptionCheckout.copyTransferInfo')}
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>{t('subscriptionCheckout.importantNote')}</strong><br/>
                  {t('subscriptionCheckout.importantNoteDesc')}
                </p>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-[#E60000] hover:bg-red-700" size="lg">
                  {t('subscriptionCheckout.contactSupport')}
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  {t('subscriptionCheckout.alreadyTransferred')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SubscriptionCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    }>
      <SubscriptionCheckoutContent />
    </Suspense>
  )
}