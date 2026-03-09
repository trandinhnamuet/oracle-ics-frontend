'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, Smartphone, QrCode, AlertCircle } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { paymentApi } from '@/api/payment.api'
import { useAuth } from '@/lib/auth-context'

const QUICK_AMOUNTS = [100000, 500000, 1000000, 2000000, 5000000, 10000000]

export default function AddFundsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const PAYMENT_METHODS = [
    {
      id: 'momo',
      name: t('addFunds.methods.momo.name'),
      icon: Smartphone,
      description: t('addFunds.methods.momo.description'),
      enabled: false,
      comingSoon: true
    },
    {
      id: 'card',
      name: t('addFunds.methods.card.name'),
      icon: CreditCard,
      description: t('addFunds.methods.card.description'),
      enabled: false,
      comingSoon: true
    },
    {
      id: 'bank_transfer',
      name: t('addFunds.methods.bank_transfer.name'),
      icon: QrCode,
      description: t('addFunds.methods.bank_transfer.description'),
      enabled: true,
      comingSoon: false
    }
  ]
  
  const [amount, setAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('bank_transfer')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAmountChange = (value: string) => {
    // Chỉ cho phép nhập số
    const numericValue = value.replace(/[^0-9]/g, '')
    setAmount(numericValue)
  }

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString())
  }

  const handleSubmit = async () => {
    const numericAmount = parseInt(amount)
    
    if (!amount || numericAmount < 10000) {
      toast({
        title: t('addFunds.errorGeneral'),
        description: t('addFunds.errorMin'),
        variant: 'destructive'
      })
      return
    }

    if (numericAmount > 100000000) {
      toast({
        title: t('addFunds.errorGeneral'), 
        description: t('addFunds.errorMax'),
        variant: 'destructive'
      })
      return
    }

    if (!selectedMethod) {
      toast({
        title: t('addFunds.errorGeneral'),
        description: t('addFunds.errorSelectMethod'),
        variant: 'destructive'
      })
      return
    }

    const selectedPaymentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod)
    if (!selectedPaymentMethod?.enabled) {
      toast({
        title: t('addFunds.errorGeneral'),
        description: t('addFunds.errorMethodUnavailable'),
        variant: 'destructive'
      })
      return
    }

    if (!user?.id) {
      toast({
        title: t('addFunds.errorGeneral'),
        description: t('addFunds.errorLogin'),
        variant: 'destructive'
      })
      return
    }

    try {
      setIsProcessing(true)
      
      // Tạo transaction code duy nhất
      const transactionCode = `NAP${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      // Tạo payment record
      const paymentData = {
        amount: numericAmount,
        payment_type: 'deposit' as const,
        payment_method: 'sepay_qr' as const,
        description: `Nạp tiền vào tài khoản - ${formatPrice(numericAmount)}`,
      }

      const response = await paymentApi.createPayment(paymentData)
      
      console.log('Payment creation response:', response)
      
      toast({
        title: t('addFunds.successTitle'),
        description: t('addFunds.successDesc'),
        variant: 'default'
      })

      // Chuyển sang màn thanh toán với paymentId
      const queryParams = new URLSearchParams({
        paymentId: response.id.toString(),
        amount: amount,
        method: selectedMethod,
        type: 'add_funds'
      })
      
      router.push(`/add-funds/payment?${queryParams.toString()}`)
    } catch (error: any) {
      console.error('Error creating payment:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      const errorMessage = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi tạo lệnh thanh toán. Vui lòng thử lại.'
      
      toast({
        title: t('addFunds.errorGeneral'),
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const formatAmountDisplay = (value: string) => {
    if (!value) return ''
    const num = parseInt(value)
    return formatPrice(num)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('addFunds.back')}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">{t('addFunds.title')}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chọn phương thức thanh toán - bên trái */}
          <Card>
            <CardHeader>
              <CardTitle>{t('addFunds.selectPaymentMethod')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {PAYMENT_METHODS.map((method) => {
                const Icon = method.icon
                const isSelected = selectedMethod === method.id
                return (
                  <div
                    key={method.id}
                    className={`
                      relative p-4 border rounded-lg cursor-pointer transition-all
                      ${isSelected 
                        ? 'border-[#E60000] bg-red-50 dark:bg-red-950/30' 
                        : 'border-gray-200 hover:border-gray-300 dark:border-border dark:hover:border-border/80'
                      }
                      ${!method.enabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={() => {
                      if (method.enabled) {
                        setSelectedMethod(method.id)
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`
                        p-2 rounded-lg
                        ${isSelected ? 'bg-[#E60000] text-white' : 'bg-gray-100 text-gray-600 dark:bg-muted dark:text-muted-foreground'}
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-foreground">{method.name}</h3>
                          {method.comingSoon && (
                            <Badge variant="outline" className="text-xs">
                              {t('addFunds.comingSoon')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-muted-foreground">{method.description}</p>
                      </div>
                      {isSelected && method.enabled && (
                        <div className="w-4 h-4 bg-[#E60000] rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Nhập số tiền - bên phải */}
          <Card>
            <CardHeader>
              <CardTitle>{t('addFunds.enterAmount')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground">
                  {t('addFunds.amountLabel')}
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder={t('addFunds.amountPlaceholder')}
                    className="text-lg font-semibold pr-12"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-muted-foreground">
                    VND
                  </span>
                </div>
                {amount && (
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    {t('addFunds.amountDisplay')} <span className="font-semibold text-[#E60000]">
                      {formatAmountDisplay(amount)} VND
                    </span>
                  </p>
                )}
              </div>
              {/* Các mức nạp nhanh */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground">
                  {t('addFunds.quickAmounts')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant={amount === quickAmount.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleQuickAmount(quickAmount)}
                      className="text-sm"
                    >
                      {formatPrice(quickAmount)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">{t('addFunds.noteTitle')}</p>
                    <p>• {t('addFunds.noteMin')}</p>
                    <p>• {t('addFunds.noteMax')}</p>
                    <p>• {t('addFunds.noteCredit')}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Button xác nhận */}
        <div className="sticky bottom-4 mt-6">
          <Button
            onClick={handleSubmit}
            disabled={!amount || !selectedMethod || isProcessing}
            className="w-full bg-[#E60000] hover:bg-red-700 text-white py-4 text-lg font-semibold"
            size="lg"
          >
            {isProcessing ? t('addFunds.processing') : t('addFunds.confirm', { amount: amount ? formatAmountDisplay(amount) : '0' })}
          </Button>
        </div>
      </div>
    </div>
  )
}