'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, Copy, Loader, Banknote, Clock, RefreshCw } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { paymentApi } from '@/api/payment.api'
import { useAuth } from '@/lib/auth-context'
import Image from 'next/image'
import { Suspense, useEffect, useRef, useState } from 'react'

function AddFundsPaymentContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, isLoading: authLoading } = useAuth()

  // States
  const [paymentData, setPaymentData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [countdown, setCountdown] = useState(900)
  const [qrNotified, setQrNotified] = useState(false)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // Query params
  const paymentId = searchParams.get('paymentId')
  const amount = searchParams.get('amount') || '0'

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`)
    }
  }, [user, authLoading, router])

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

  const fetchPaymentStatus = async () => {
    if (!paymentId) return

    try {
      const response = await paymentApi.getPaymentStatus(paymentId)
      setPaymentData(response)
      setPaymentStatus(response.status)

      if (response.status === 'success') {
        if (pollingRef.current) {
          clearInterval(pollingRef.current)
          pollingRef.current = null
        }
        toast({
          title: t('addFundsPayment.paymentSuccess'),
          description: `${t('addFundsPayment.paymentSuccessDesc')} ${formatPrice(parseInt(amount))} VND`,
          variant: 'default'
        })
        setTimeout(() => {
          router.push('/add-funds/payment/success')
        }, 2000)
      }
    } catch (error: any) {
      // If unauthorized or forbidden, redirect to login
      const status = error?.status || error?.response?.status
      if (status === 401) {
        router.replace(`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`)
        return
      }
      if (status === 403) {
        router.replace('/unauthorized')
        return
      }
      console.error('Error fetching payment status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!paymentId || authLoading) return
    if (!user) return

    fetchPaymentStatus()

    const interval = setInterval(() => {
      fetchPaymentStatus()
    }, 5000)
    pollingRef.current = interval

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [paymentId, user, authLoading])

  // Show QR ready notification once paymentData is available
  useEffect(() => {
    if (paymentData && !qrNotified) {
      setQrNotified(true)
      toast({
        title: t('addFundsPayment.qrReadyToast'),
        description: t('addFundsPayment.qrReadyToastDesc'),
        variant: 'default'
      })
    }
  }, [paymentData, qrNotified, t, toast])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleCopyTransferInfo = () => {
    if (!paymentData) return
    const bank = process.env.NEXT_PUBLIC_BANK_NAME || 'TPBank'
    const account = process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '66010901964'
    const transferInfo = `${t('addFundsPayment.bankLabel')} ${bank}\n${t('addFundsPayment.accountNumberLabel')} ${account}\n${t('addFundsPayment.amountLabel')} ${formatPrice(parseInt(amount))} VND\n${t('addFundsPayment.contentLabel')} ${paymentData.transaction_code}`
    navigator.clipboard.writeText(transferInfo)
    toast({
      title: t('addFundsPayment.copiedTransferInfo'),
      variant: 'default'
    })
  }

  const handleAlreadyTransferred = () => {
    toast({
      title: t('addFundsPayment.alreadyTransferredToast'),
      description: t('addFundsPayment.alreadyTransferredToastDesc'),
      variant: 'default'
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  if (!paymentId || !amount || parseInt(amount) < 10000) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">{t('addFundsPayment.invalidInfo')}</h2>
            <p className="text-muted-foreground mb-4">
              {t('addFundsPayment.invalidInfoDesc')}
            </p>
            <Button onClick={() => router.push('/add-funds')}>
              {t('addFundsPayment.backToAddFunds')}
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
            {t('addFundsPayment.back')}
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{t('addFundsPayment.title')}</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Transaction Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Banknote className="h-5 w-5 mr-2 text-[#E60000]" />
                {t('addFundsPayment.transactionInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('addFundsPayment.transactionType')}</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {t('addFundsPayment.addFundsType')}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('addFundsPayment.paymentMethodLabel')}</span>
                <Badge variant="secondary">{t('addFundsPayment.bankTransfer')}</Badge>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>{t('addFundsPayment.depositAmount')}</span>
                  <span className="text-[#E60000]">
                    {formatPrice(parseInt(amount))} VND
                  </span>
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-foreground">{t('addFundsPayment.timeLeft')}</span>
                  <span className="text-lg font-bold text-orange-600">
                    {formatTime(countdown)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  {t('addFundsPayment.expireWarning')}
                </p>
              </div>

              {paymentData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>{t('addFundsPayment.transactionCode')}</strong> {paymentData.transaction_code}<br/>
                    {t('addFundsPayment.autoConfirm')}
                  </p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ {t('addFundsPayment.benefit1')}<br/>
                  ✓ {t('addFundsPayment.benefit2')}<br/>
                  ✓ {t('addFundsPayment.benefit3')}<br/>
                  ✓ {t('addFundsPayment.benefit4')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* QR Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {t('addFundsPayment.scanQR')}
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
                      alt={t('addFundsPayment.scanQR')}
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-card p-4 rounded-lg inline-block shadow-sm border">
                    <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400 dark:text-muted-foreground">
                      {t('addFundsPayment.loadingPaymentInfo')}
                    </div>
                  </div>
                )}

                {paymentStatus === 'success' ? (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    {t('addFundsPayment.paymentSuccessRedirect')}
                  </p>
                ) : paymentStatus === 'pending' ? (
                  <p className="text-sm text-blue-600 mt-2 flex items-center justify-center">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    {t('addFundsPayment.checkingPayment')}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('addFundsPayment.scanQRDesc')}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-card border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('addFundsPayment.bankLabel')}</span>
                    <span className="text-sm font-medium">{process.env.NEXT_PUBLIC_BANK_NAME || 'TPBank'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('addFundsPayment.accountNumberLabel')}</span>
                    <span className="text-sm font-medium font-mono">{process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '66010901964'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('addFundsPayment.accountHolderLabel')}</span>
                    <span className="text-sm font-medium">{process.env.NEXT_PUBLIC_BANK_ACCOUNT_HOLDER || 'ICS COMPANY'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('addFundsPayment.amountLabel')}</span>
                    <span className="text-sm font-medium text-[#E60000]">
                      {formatPrice(parseInt(amount))} VND
                    </span>
                  </div>
                  {paymentData && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('addFundsPayment.contentLabel')}</span>
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
                  {t('addFundsPayment.copyTransferInfo')}
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>{t('addFundsPayment.importantNote')}</strong><br/>
                  {t('addFundsPayment.importantNoteDesc')}
                </p>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-[#E60000] hover:bg-red-700" size="lg" onClick={() => window.open('https://oraclecloud.vn/contact-info', '_blank')}>
                  {t('addFundsPayment.contactSupport')}
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={handleAlreadyTransferred}>
                  {t('addFundsPayment.alreadyTransferred')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function AddFundsPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AddFundsPaymentContent />
    </Suspense>
  )
}