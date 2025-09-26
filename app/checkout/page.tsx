'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, CheckCircle, Copy, Loader } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
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
  const [paymentId, setPaymentId] = useState<string>('')
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  
  // Lấy data từ query params
  const planId = searchParams.get('planId')
  const planName = searchParams.get('name')
  const planPrice = searchParams.get('price')
  const planDescription = searchParams.get('description')
  const planCategory = searchParams.get('category')
  const planPeriod = searchParams.get('period')
  const planFeaturesStr = searchParams.get('features')
  
  // Parse features từ JSON string
  const planFeatures = planFeaturesStr ? JSON.parse(planFeaturesStr) : []

  // Mock userId - trong thực tế sẽ lấy từ auth context
  const userId = 1 // TODO: Lấy từ auth context

  // Theo dõi trạng thái thanh toán
  const { isPaid, isChecking } = usePaymentStatus(
    userId, 
    parseInt(planId || '0'), 
    !!paymentId // Chỉ bắt đầu theo dõi khi đã tạo payment
  )

  // Tạo URL QR Sepay với custom content
  const createCustomQRUrl = (amount: string, description: string) => {
    const baseUrl = 'https://qr.sepay.vn/img'
    const customContent = `${description} U${userId}P${planId}`
    const params = new URLSearchParams({
      acc: '66010901964',
      bank: 'TPBank',
      amount: amount,
      des: customContent
    })
    return `${baseUrl}?${params.toString()}`
  }

  // Tạo thanh toán khi component mount
  useEffect(() => {
    if (!planId || !planName || !planPrice) {
      router.push('/')
      return
    }

    const createPayment = async () => {
      try {
        setIsCreatingPayment(true)
        
        // Tạo QR code với custom content
  const customQrUrl = createCustomQRUrl(planPrice, planName)
  console.log('QR URL:', customQrUrl)
  setQrUrl(customQrUrl)

        // Gọi API để tạo bản ghi payment (với is_paid = false)
        const result = await paymentApi.createPayment({
          userId,
          packageId: parseInt(planId),
          amount: parseInt(planPrice),
          planName: planName
        })

        setPaymentId(result.paymentId)
        
        toast({
          title: 'Đã tạo thanh toán',
          description: 'Vui lòng quét QR code để thanh toán',
          variant: 'default'
        })
      } catch (error) {
        console.error('Error creating payment:', error)
        toast({
          title: 'Lỗi tạo thanh toán',
          description: 'Vui lòng thử lại',
          variant: 'destructive'
        })
      } finally {
        setIsCreatingPayment(false)
      }
    }

    createPayment()
  }, [planId, planName, planPrice, userId, router, toast])

  // Nếu không có data, redirect về trang chính
  if (!planId || !planName || !planPrice) {
    return null
  }

  const handleCopyTransferInfo = () => {
    const customContent = `${planName} U${userId}P${planId}`
    const transferInfo = `
${t('checkout.bankName')}: TPBank
${t('checkout.accountNumber')}: 66010901964
${t('checkout.amount')}: ${formatPrice(planPrice)}₫
${t('checkout.content')}: ${customContent}
    `.trim()
    
    navigator.clipboard.writeText(transferInfo)
    toast({
      title: t('checkout.copiedSuccess'),
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
                  <span className="text-sm text-right max-w-xs">{planDescription}</span>
                </div>
              )}

              {planCategory && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('checkout.packageType')}:</span>
                  <Badge variant="secondary">{t(`homepage.pricing.plans.${planCategory}`)}</Badge>
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
                    {formatPrice(planPrice)}₫
                    {planPeriod && <span className="text-sm text-muted-foreground">/{planPeriod}</span>}
                  </span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-white">
                  ✓ Hỗ trợ kỹ thuật 24/7<br/>
                  ✓ Không phí setup<br/>
                  ✓ Đảm bảo uptime 99.9%<br/>
                  ✓ Thanh toán linh hoạt
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
                      Đang tạo QR...
                    </div>
                  </div>
                )}
                
                {isPaid ? (
                  <p className="text-sm text-green-600 mt-2 font-medium">
                    ✅ Thanh toán thành công! Đang chuyển hướng...
                  </p>
                ) : isChecking ? (
                  <p className="text-sm text-blue-600 mt-2">
                    🔄 Đang kiểm tra thanh toán...
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
                    <span className="text-sm font-medium">TPBank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('checkout.accountNumber')}:</span>
                    <span className="text-sm font-medium font-mono">66010901964</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('checkout.amount')}:</span>
                    <span className="text-sm font-medium text-primary">{formatPrice(planPrice)}₫</span>
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
                  Nội dung chuyển khoản phải chính xác: <strong>{planName} U{userId}P{planId}</strong>
                </p>
              </div>

              {paymentId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Mã thanh toán:</strong> {paymentId}<br/>
                    Hệ thống sẽ tự động xác nhận khi bạn chuyển khoản thành công.
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
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>}>
      <CheckoutContent />
    </Suspense>
  )
}