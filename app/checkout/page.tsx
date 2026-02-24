'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, CheckCircle, Copy, Loader } from 'lucide-react'
import { formatPrice, roundMoney } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { usePaymentStatus } from '@/hooks/use-payment-status'
import { paymentApi } from '@/api/payment.api'
import Image from 'next/image'
import { Suspense, useEffect, useState } from 'react'

function CheckoutContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // States
  const [qrUrl, setQrUrl] = useState<string>('')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending')
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  
  // Lấy data từ query params  
  const paymentId = searchParams.get('paymentId')
  const subscriptionId = searchParams.get('subscriptionId')
  const amount = searchParams.get('amount') || '0'
  const method = searchParams.get('method') || 'sepay_qr'
  const type = searchParams.get('type') || 'subscription'
  
  // Legacy params for old checkout (keep for backward compatibility)
  const planId = searchParams.get('planId')
  const planName = searchParams.get('name')
  const planPrice = searchParams.get('price')
  const planDescription = searchParams.get('description')
  const planCategory = searchParams.get('category')
  const planPeriod = searchParams.get('period')
  const planFeaturesStr = searchParams.get('features')
  const planMonths = searchParams.get('months') || '1'
  const userId = searchParams.get('userId')
  
  // Parse features từ string
  const planFeatures = planFeaturesStr ? planFeaturesStr.split(',').map(f => f.trim()) : []
  
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
      setIsChecking(true)
      const response = await paymentApi.getPaymentStatus(paymentId)
      setPaymentData(response)
      setPaymentStatus(response.status)
      
      if (response.status === 'success') {
        setIsPaid(true)
        toast({
          title: 'Thanh toán thành công!',
          description: 'Đang chuyển đến trang thành công...',
          variant: 'default'
        })
        
        // Chờ 2 giây rồi chuyển trang
        setTimeout(() => {
          router.push('/checkout/success')
        }, 2000)
      }
      
      // Create QR URL if we have transaction code
      if (response.transaction_code && !qrUrl) {
        const qrUrlGenerated = createQRUrl(amount, response.transaction_code)
        setQrUrl(qrUrlGenerated)
      }
      
    } catch (error) {
      console.error('Error fetching payment status:', error)
    } finally {
      setIsLoading(false)
      setIsChecking(false)
      setIsCreatingPayment(false)
    }
  }

  // Setup polling khi component mount  
  useEffect(() => {
    if (!paymentId) {
      router.push('/')
      return
    }

    // Set initial states
    setIsCreatingPayment(true)
    
    // Fetch ngay lần đầu
    fetchPaymentStatus()

    // Setup polling mỗi 5 giây
    const interval = setInterval(() => {
      if (paymentStatus !== 'success') {
        fetchPaymentStatus()
      }
    }, 5000)

    // Cleanup khi component unmount
    return () => clearInterval(interval)
  }, [paymentId, router])

  // Nếu không có paymentId, redirect
  if (!paymentId) {
    return null
  }

  const handleCopyTransferInfo = () => {
    const rate = typeof window !== 'undefined' ? Number(localStorage.getItem('usdvnd_sell') || 26500) : 26500;
    const vndPrice = roundMoney(parseFloat(planPrice || '0') * rate);
    const transactionCode = paymentData?.transaction_code || `${planName} U${userId}P${planId}`;
    
    const transferInfo = `
Ngân hàng: TPBank
Số tài khoản: 66010901964
Số tiền: ${formatPrice(vndPrice)} VND
Nội dung: ${transactionCode}
    `.trim()
    navigator.clipboard.writeText(transferInfo)
    toast({
      title: 'Đã sao chép thông tin chuyển khoản',
      variant: 'default'
    })
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
            {t('checkout.backButton')}
          </Button>
          <h1 className="text-3xl font-bold text-foreground">{t('checkout.title')}</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Thông tin gói */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                {t('checkout.packageInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('checkout.packageName')}:</span>
                <Badge variant="outline">{planName}</Badge>
              </div>
              
              {planDescription && (
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">{t('checkout.description')}:</span>
                  <span className="text-sm text-right max-w-xs">
                    {planDescription.startsWith('pricing.') ? t(planDescription) : planDescription}
                  </span>
                </div>
              )}

              {planCategory && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('checkout.packageType')}:</span>
                  <Badge variant="secondary">{t(`homepage.pricing.plans.${planCategory}`)}</Badge>
                </div>
              )}

              {parseInt(planMonths) > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Số tháng đăng ký:</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {planMonths} tháng
                  </Badge>
                </div>
              )}

              {planFeatures && planFeatures.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground font-medium">{t('checkout.features')}:</span>
                  <div className="space-y-2">
                    {planFeatures.map((feature: string, index: number) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>{t('checkout.totalAmount')}:</span>
                  <span className="text-primary">
                    {(() => {
                      const rate = typeof window !== 'undefined' ? Number(localStorage.getItem('usdvnd_sell') || 26500) : 26500;
                      const vndPrice = roundMoney(parseFloat(planPrice || '0') * rate);
                      return formatPrice(vndPrice);
                    })()}₫
                    {parseInt(planMonths) > 1 ? (
                      <span className="text-sm text-muted-foreground"> (cho {planMonths} tháng)</span>
                    ) : planPeriod ? (
                      <span className="text-sm text-muted-foreground">/{planPeriod}</span>
                    ) : null}
                  </span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-white">
                  ✓ {t('checkout.support247')}<br/>
                  ✓ {t('checkout.noSetupFee')}<br/>
                  ✓ {t('checkout.uptimeGuarantee')}<br/>
                  ✓ {t('checkout.flexiblePayment')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* QR Thanh toán */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {t('checkout.paymentQR')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                {isCreatingPayment ? (
                  <div className="bg-white p-4 rounded-lg inline-block shadow-sm border">
                    <div className="w-[200px] h-[200px] flex items-center justify-center">
                      <Loader className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  </div>
                ) : qrUrl ? (
                  <div className="bg-white p-4 rounded-lg inline-block shadow-sm border">
                    <Image
                      src={qrUrl}
                      alt="QR Code thanh toán"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg inline-block shadow-sm border">
                    <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400">
                      {t('checkout.creatingQR')}
                    </div>
                  </div>
                )}
                
                {isPaid ? (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    ✅ {t('checkout.paidSuccessRedirect')}
                  </p>
                ) : isChecking ? (
                  <p className="text-sm text-blue-600 mt-2">
                    🔄 {t('checkout.checkingPayment')}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">
                    {t('checkout.scanQR')}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-card border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('checkout.bankName')}:</span>
                    <span className="text-sm font-medium">{process.env.NEXT_PUBLIC_BANK_NAME || 'TPBank'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('checkout.accountNumber')}:</span>
                    <span className="text-sm font-medium font-mono">{process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER || '66010901964'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('checkout.amount')}:</span>
                    <span className="text-sm font-medium text-primary">
                      {(() => {
                        const rate = typeof window !== 'undefined' ? Number(localStorage.getItem('usdvnd_sell') || 26500) : 26500;
                        const vndPrice = roundMoney(parseFloat(planPrice || '0') * rate);
                        return formatPrice(vndPrice);
                      })()}₫
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('checkout.content')}:</span>
                    <span className="text-sm font-medium">{planName} U{userId}P{planId}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleCopyTransferInfo}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {t('checkout.copyInfo')}
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>{t('checkout.note')}</strong><br/>
                  {t('checkout.transferContentExact')}: <strong>{planName} U{userId}P{planId}</strong>
                </p>
              </div>

              {paymentId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>{t('checkout.paymentId')}:</strong> {paymentId}<br/>
                    {t('checkout.autoConfirmNote')}
                  </p>
                </div>
              )}

              <div className="text-center">
                <Button className="w-full" size="lg">
                  {t('checkout.contactSupport')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  const { t } = useTranslation();
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">{t('common.loading')}</p>
      </div>
    </div>}>
      <CheckoutContent />
    </Suspense>
  )
}