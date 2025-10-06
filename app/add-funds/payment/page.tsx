'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, CheckCircle, Copy, Loader, Banknote, Clock } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'
import { Suspense, useEffect, useState } from 'react'

function AddFundsPaymentContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // States
  const [qrUrl, setQrUrl] = useState<string>('')
  const [transactionId, setTransactionId] = useState<string>('')
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [countdown, setCountdown] = useState(900) // 15 phút
  
  // Lấy data từ query params
  const amount = searchParams.get('amount') || '0'
  const method = searchParams.get('method') || 'bank_transfer'
  const type = searchParams.get('type') || 'add_funds'

  // Mock userId - trong thực tế sẽ lấy từ auth context
  const userId = 1

  // Tạo URL QR Sepay cho nạp tiền
  const createAddFundsQRUrl = (amount: string) => {
    const baseUrl = 'https://qr.sepay.vn/img'
    const customContent = `NAP${userId}${Date.now().toString().slice(-6)}`
    const params = new URLSearchParams({
      acc: '66010901964',
      bank: 'TPBank',
      amount: amount,
      des: customContent
    })
    return {
      url: `${baseUrl}?${params.toString()}`,
      content: customContent
    }
  }

  // Tạo thanh toán khi component mount
  useEffect(() => {
    if (!amount || parseInt(amount) < 10000) {
      router.push('/add-funds')
      return
    }

    const createPayment = async () => {
      try {
        setIsCreatingPayment(true)
        
        // Tạo QR code
        const { url, content } = createAddFundsQRUrl(amount)
        setQrUrl(url)
        
        // Tạo transaction ID demo
        const txId = `TXN${userId}${Date.now()}`
        setTransactionId(txId)
        
        toast({
          title: 'Đã tạo giao dịch nạp tiền',
          description: 'Vui lòng quét QR code để thanh toán',
          variant: 'default'
        })
      } catch (error) {
        console.error('Error creating payment:', error)
        toast({
          title: 'Lỗi tạo giao dịch',
          description: 'Vui lòng thử lại',
          variant: 'destructive'
        })
      } finally {
        setIsCreatingPayment(false)
      }
    }

    createPayment()
  }, [amount, userId, router, toast])

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleCopyTransferInfo = () => {
    const customContent = `NAP${userId}${Date.now().toString().slice(-6)}`
    const transferInfo = `
Ngân hàng: TPBank
Số tài khoản: 66010901964
Số tiền: ${formatPrice(parseInt(amount))} VND
Nội dung: ${customContent}
    `.trim()
    navigator.clipboard.writeText(transferInfo)
    toast({
      title: 'Đã sao chép thông tin chuyển khoản',
      variant: 'default'
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!amount || parseInt(amount) < 10000) {
    return null
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
            Quay lại
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Nạp tiền vào tài khoản</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Thông tin giao dịch */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Banknote className="h-5 w-5 mr-2 text-[#E60000]" />
                Thông tin giao dịch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Loại giao dịch:</span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Nạp tiền
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Phương thức:</span>
                <Badge variant="secondary">Chuyển khoản ngân hàng</Badge>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Số tiền nạp:</span>
                  <span className="text-[#E60000]">
                    {formatPrice(parseInt(amount))} VND
                  </span>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Thời gian còn lại:</span>
                  <span className="text-lg font-bold text-orange-600">
                    {formatTime(countdown)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Giao dịch sẽ hết hạn sau thời gian trên. Vui lòng hoàn tất thanh toán trước khi hết hạn.
                </p>
              </div>

              {transactionId && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Mã giao dịch:</strong> {transactionId}<br/>
                    Giao dịch sẽ được xác nhận tự động sau khi nhận được tiền.
                  </p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  ✓ Tiền nạp sẽ được cộng vào tài khoản ngay lập tức<br/>
                  ✓ Không có phí giao dịch<br/>
                  ✓ Hỗ trợ 24/7<br/>
                  ✓ Giao dịch được mã hóa bảo mật
                </p>
              </div>
            </CardContent>
          </Card>

          {/* QR Thanh toán */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Quét QR để thanh toán
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
                      alt="QR Code nạp tiền"
                      width={200}
                      height={200}
                      className="mx-auto"
                    />
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-lg inline-block shadow-sm border">
                    <div className="w-[200px] h-[200px] flex items-center justify-center text-gray-400">
                      Đang tạo QR Code...
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground mt-2">
                  Quét mã QR bằng app ngân hàng để thanh toán
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-card border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ngân hàng:</span>
                    <span className="text-sm font-medium">TPBank</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Số tài khoản:</span>
                    <span className="text-sm font-medium font-mono">66010901964</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Chủ tài khoản:</span>
                    <span className="text-sm font-medium">ICS COMPANY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Số tiền:</span>
                    <span className="text-sm font-medium text-[#E60000]">
                      {formatPrice(parseInt(amount))} VND
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Nội dung:</span>
                    <span className="text-sm font-medium">NAP{userId}{Date.now().toString().slice(-6)}</span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleCopyTransferInfo}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Sao chép thông tin chuyển khoản
                </Button>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Lưu ý quan trọng:</strong><br/>
                  Vui lòng chuyển khoản <strong>đúng số tiền</strong> và <strong>đúng nội dung</strong> để hệ thống có thể tự động xác nhận giao dịch.
                </p>
              </div>

              <div className="space-y-2">
                <Button className="w-full bg-[#E60000] hover:bg-red-700" size="lg">
                  Liên hệ hỗ trợ
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  Đã chuyển khoản
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
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    }>
      <AddFundsPaymentContent />
    </Suspense>
  )
}