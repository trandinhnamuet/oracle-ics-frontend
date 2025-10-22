'use client'

import { useEffect, useState } from 'react'
import { getUserBalance } from '@/api/user-wallet.api'
import { formatPrice } from '@/lib/utils'
import { Wallet, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface BalanceDisplayProps {
  userId?: number
  showAddFunds?: boolean
  className?: string
}

export default function BalanceDisplay({ 
  userId, 
  showAddFunds = true, 
  className = '' 
}: BalanceDisplayProps) {
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchBalance = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getUserBalance(userId)
      setBalance(response.balance)
    } catch (err) {
      console.error('Error fetching balance:', err)
      setError('Không thể tải số dư')
      setBalance(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debounce để tránh gọi API nhiều lần
    const timer = setTimeout(() => {
      fetchBalance()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [userId])

  const handleAddFunds = () => {
    router.push('/add-funds')
  }

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Wallet className="h-4 w-4 text-gray-400" />
        <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Đang tải...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Wallet className="h-4 w-4 text-red-500" />
        <span className="text-sm text-red-500">{error}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchBalance}
          className="h-auto p-1"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Wallet className="h-4 w-4 text-[#E60000]" />
      <span className="text-sm font-medium text-gray-700">Số dư:</span>
      <span className="text-sm font-bold text-[#E60000]">
        {formatPrice(balance)} VND
      </span>
      {showAddFunds && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddFunds}
          className="h-auto py-1 px-2 text-xs"
        >
          Nạp tiền
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={fetchBalance}
        className="h-auto p-1"
        title="Làm mới số dư"
      >
        <RefreshCw className="h-3 w-3" />
      </Button>
    </div>
  )
}