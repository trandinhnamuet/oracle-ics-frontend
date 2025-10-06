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

const QUICK_AMOUNTS = [100000, 500000, 1000000, 2000000, 5000000, 10000000]

const PAYMENT_METHODS = [
  {
    id: 'momo',
    name: 'Ví MoMo',
    icon: Smartphone,
    description: 'Thanh toán qua ví điện tử MoMo',
    enabled: false,
    comingSoon: true
  },
  {
    id: 'card',
    name: 'Thẻ thanh toán quốc tế',
    icon: CreditCard,
    description: 'Visa, Mastercard, JCB',
    enabled: false,
    comingSoon: true
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản ngân hàng',
    icon: QrCode,
    description: 'Quét QR Code hoặc chuyển khoản thủ công',
    enabled: true,
    comingSoon: false
  }
]

export default function AddFundsPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const { toast } = useToast()
  
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

  const handleSubmit = () => {
    const numericAmount = parseInt(amount)
    
    if (!amount || numericAmount < 10000) {
      toast({
        title: 'Lỗi',
        description: 'Số tiền nạp tối thiểu là 10,000 VND',
        variant: 'destructive'
      })
      return
    }

    if (numericAmount > 100000000) {
      toast({
        title: 'Lỗi', 
        description: 'Số tiền nạp tối đa là 100,000,000 VND',
        variant: 'destructive'
      })
      return
    }

    if (!selectedMethod) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn phương thức thanh toán',
        variant: 'destructive'
      })
      return
    }

    const selectedPaymentMethod = PAYMENT_METHODS.find(m => m.id === selectedMethod)
    if (!selectedPaymentMethod?.enabled) {
      toast({
        title: 'Lỗi',
        description: 'Phương thức thanh toán này chưa khả dụng',
        variant: 'destructive'
      })
      return
    }

    // Chuyển sang màn thanh toán
    const queryParams = new URLSearchParams({
      amount: amount,
      method: selectedMethod,
      type: 'add_funds'
    })
    
    router.push(`/add-funds/payment?${queryParams.toString()}`)
  }

  const formatAmountDisplay = (value: string) => {
    if (!value) return ''
    const num = parseInt(value)
    return formatPrice(num)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
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
          <h1 className="text-3xl font-bold text-gray-900">Nạp tiền vào tài khoản</h1>
        </div>

        <div className="space-y-6">
          {/* Nhập số tiền */}
          <Card>
            <CardHeader>
              <CardTitle>Nhập số tiền muốn nạp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Số tiền (VND)
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Nhập số tiền..."
                    className="text-lg font-semibold pr-12"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    VND
                  </span>
                </div>
                {amount && (
                  <p className="text-sm text-gray-600">
                    Số tiền: <span className="font-semibold text-[#E60000]">
                      {formatAmountDisplay(amount)} VND
                    </span>
                  </p>
                )}
              </div>

              {/* Các mức nạp nhanh */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Hoặc chọn mức nạp nhanh
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
                    <p className="font-medium">Lưu ý:</p>
                    <p>• Số tiền nạp tối thiểu: 10,000 VND</p>
                    <p>• Số tiền nạp tối đa: 100,000,000 VND</p>
                    <p>• Tiền nạp sẽ được cộng vào tài khoản sau khi xác nhận thanh toán</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chọn phương thức thanh toán */}
          <Card>
            <CardHeader>
              <CardTitle>Chọn phương thức thanh toán</CardTitle>
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
                        ? 'border-[#E60000] bg-red-50' 
                        : 'border-gray-200 hover:border-gray-300'
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
                        ${isSelected ? 'bg-[#E60000] text-white' : 'bg-gray-100 text-gray-600'}
                      `}>
                        <Icon className="h-5 w-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{method.name}</h3>
                          {method.comingSoon && (
                            <Badge variant="outline" className="text-xs">
                              Sắp có
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{method.description}</p>
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

          {/* Button xác nhận */}
          <div className="sticky bottom-4">
            <Button
              onClick={handleSubmit}
              disabled={!amount || !selectedMethod || isProcessing}
              className="w-full bg-[#E60000] hover:bg-red-700 text-white py-4 text-lg font-semibold"
              size="lg"
            >
              {isProcessing ? 'Đang xử lý...' : `Xác nhận nạp ${amount ? formatAmountDisplay(amount) : '0'} VND`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}