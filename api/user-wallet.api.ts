import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

// Cache để tránh duplicate API calls
const balanceCache = new Map<string, { data: { balance: number }, timestamp: number }>()
const CACHE_DURATION = 1000 // 1 giây

export interface UserWallet {
  id: number
  user_id: number
  balance: number
  created_at: string
  updated_at: string
}

export interface WalletTransaction {
  id: string
  wallet_id: number
  payment_id: string
  change_amount: number
  balance_after: number
  type: string
  created_at: string
}

// Get user wallet by user ID
export const getUserWallet = async (userId?: number): Promise<UserWallet> => {
  try {
    const url = userId ? `${API_URL}/user-wallets/user/${userId}` : `${API_URL}/user-wallets/my-wallet`
    const response = await axios.get(url, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching user wallet:', error)
    throw error
  }
}

// Get user balance
export const getUserBalance = async (userId?: number): Promise<{ balance: number }> => {
  try {
    const url = userId ? `${API_URL}/user-wallets/user/${userId}/balance` : `${API_URL}/user-wallets/my-balance`
    const cacheKey = `balance_${userId || 'me'}`
    const now = Date.now()
    
    // Kiểm tra cache
    const cached = balanceCache.get(cacheKey)
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('Returning cached balance for:', cacheKey)
      return cached.data
    }
    
    const response = await axios.get(url, {
      withCredentials: true,
    })
    
    const data = response.data || { balance: 0 }
    
    // Cache kết quả
    balanceCache.set(cacheKey, { data, timestamp: now })
    
    return data
  } catch (error) {
    console.error('Error fetching user balance:', error)
    throw error
  }
}

// Get wallet transactions
export const getWalletTransactions = async (userId?: number): Promise<WalletTransaction[]> => {
  try {
    const url = userId ? `${API_URL}/wallet-transactions/user/${userId}` : `${API_URL}/wallet-transactions/my-transactions`
    const response = await axios.get(url, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching wallet transactions:', error)
    throw error
  }
}