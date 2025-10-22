import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

export interface Subscription {
  id: number
  user_id: number
  cloud_package_id: number
  start_date: string
  end_date: string
  status: 'active' | 'inactive' | 'expired' | 'suspended' | 'cancelled'
  auto_renew: boolean
  created_at: string
  updated_at: string
  cloud_package?: {
    id: number
    name: string
    type: string
    cost: number
    cost_vnd: number
    cpu: string
    ram: string
    memory: string
    feature: string
    bandwidth: string
  }
}

export interface CreateSubscriptionRequest {
  cloudPackageId: number
  autoRenew?: boolean
}

export interface CreateSubscriptionWithPaymentRequest {
  cloudPackageId: number
  monthsCount: number
  autoRenew?: boolean
}

// Subscribe with account balance
export const subscribeWithBalance = async (data: CreateSubscriptionRequest): Promise<Subscription> => {
  try {
    const response = await axios.post(`${API_URL}/subscriptions/subscribe-with-balance`, {
      cloudPackageId: data.cloudPackageId,
      autoRenew: data.autoRenew || false
    }, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error('Error subscribing with balance:', error)
    throw error
  }
}

// Subscribe with direct payment (creates payment + subscription records)
export const subscribeWithPayment = async (data: CreateSubscriptionWithPaymentRequest): Promise<{
  subscription: Subscription
  payment: any
}> => {
  try {
    const response = await axios.post(`${API_URL}/subscriptions/subscribe-with-payment`, {
      cloudPackageId: data.cloudPackageId,
      monthsCount: data.monthsCount,
      autoRenew: data.autoRenew || false
    }, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error('Error subscribing with payment:', error)
    throw error
  }
}

// Get user subscriptions (always uses my-subscriptions endpoint)
export const getUserSubscriptions = async (userId?: number): Promise<Subscription[]> => {
  try {
    const response = await axios.get(`${API_URL}/subscriptions/my-subscriptions`, {
      withCredentials: true,
    })
    return response.data || []
  } catch (error: any) {
    console.error('Error fetching user subscriptions:', error)
    
    // Log more detailed error information
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data)
    } else if (error.request) {
      console.error('Request error:', error.request)
    } else {
      console.error('Error:', error.message)
    }
    
    throw error
  }
}

// Get active user subscriptions
export const getActiveSubscriptions = async (userId?: number): Promise<Subscription[]> => {
  try {
    const subscriptions = await getUserSubscriptions(userId)
    return subscriptions.filter((sub: Subscription) => sub.status === 'active')
  } catch (error) {
    console.error('Error fetching active subscriptions:', error)
    throw error
  }
}

// Get subscription by ID
export const getSubscriptionById = async (subscriptionId: number): Promise<Subscription> => {
  try {
    const response = await axios.get(`${API_URL}/subscriptions/${subscriptionId}`, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error('Error fetching subscription:', error)
    throw error
  }
}

// Update subscription
export const updateSubscription = async (subscriptionId: number, updateData: any): Promise<Subscription> => {
  try {
    const response = await axios.patch(`${API_URL}/subscriptions/${subscriptionId}`, updateData, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

// Toggle auto renew
export const toggleAutoRenew = async (subscriptionId: number, autoRenew: boolean): Promise<Subscription> => {
  try {
    const response = await axios.patch(`${API_URL}/subscriptions/${subscriptionId}/auto-renew`, {
      auto_renew: autoRenew
    }, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error('Error toggling auto renew:', error)
    throw error
  }
}

// Cancel subscription
export const cancelSubscription = async (subscriptionId: number): Promise<Subscription> => {
  try {
    const response = await axios.patch(`${API_URL}/subscriptions/${subscriptionId}/cancel`, {}, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

// Suspend subscription
export const suspendSubscription = async (subscriptionId: number): Promise<Subscription> => {
  try {
    const response = await axios.patch(`${API_URL}/subscriptions/${subscriptionId}/suspend`, {}, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error('Error suspending subscription:', error)
    throw error
  }
}

// Reactivate subscription
export const reactivateSubscription = async (subscriptionId: number): Promise<Subscription> => {
  try {
    const response = await axios.patch(`${API_URL}/subscriptions/${subscriptionId}/reactivate`, {}, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    throw error
  }
}