'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, CheckCircle, Copy } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

export default function CheckoutPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

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

  // Tạo URL QR Sepay
  const createQRUrl = (amount: string, description: string) => {
    const baseUrl = 'https://qr.sepay.vn/img'
    const params = new URLSearchParams({
      acc: '1036053562',
      bank: 'Vietcombank',
      amount: amount,
      des: description
    })
    return `${baseUrl}?${params.toString()}`
  }

  // Nếu không có data, redirect về trang chính
  if (!planId || !planName || !planPrice) {
    router.push('/')
    return null
  }

  const qrUrl = createQRUrl(planPrice, `${planName} - Oracle Cloud`)

  const handleCopyTransferInfo = () => {
    const transferInfo = `
${t('checkout.bankName')}: Vietcombank
${t('checkout.accountNumber')}: 1036053562
${t('checkout.amount')}: ${formatPrice(planPrice)}₫
${t('checkout.content')}: ${planName} - Oracle Cloud
    `.trim()
    
    navigator.clipboard.writeText(transferInfo)
    toast({
      title: t('checkout.copiedSuccess'),
      variant: 'success'
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
                <div className="bg-white p-4 rounded-lg inline-block shadow-sm border">
                  <Image
                    src={qrUrl}
                    alt="QR Code thanh toán"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('checkout.scanQR')}
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-card border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('checkout.bankName')}:</span>
                    <span className="text-sm font-medium">Vietcombank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('checkout.accountNumber')}:</span>
                    <span className="text-sm font-medium font-mono">1036053562</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('checkout.amount')}:</span>
                    <span className="text-sm font-medium text-primary">{formatPrice(planPrice)}₫</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('checkout.content')}:</span>
                    <span className="text-sm font-medium">{planName} - Oracle Cloud</span>
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
                  <strong>{t('checkout.note')}</strong>
                </p>
              </div>

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