import { fetchWithAuth, fetchJsonWithAuth } from '@/lib/fetch-wrapper'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

export interface Subscription {
  id: string
  user_id: number
  cloud_package_id: number
  start_date: string
  end_date: string
  status: 'active' | 'inactive' | 'pending' | 'expired' | 'suspended' | 'cancelled'
  auto_renew: boolean
  vm_instance_id?: string | null
  created_at: string
  updated_at: string
  user?: {
    id: number
    firstName: string
    lastName: string
    email: string
    role?: string
    isActive?: boolean
    avatarUrl?: string
    createdAt?: string
    updatedAt?: string
  }
  cloudPackage?: {
    id: number
    name: string
    type: string
    cost: string
    cost_vnd: string
    cpu: string
    ram: string
    memory: string
    feature: string
    bandwidth: string
    updated_at?: string
    updated_by?: any
    is_active?: boolean
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
    const result = await fetchJsonWithAuth<Subscription>(`${API_URL}/subscriptions/subscribe-with-balance`, {
      method: 'POST',
      body: JSON.stringify({
        cloudPackageId: data.cloudPackageId,
        autoRenew: data.autoRenew || false
      })
    })
    return result
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
    const result = await fetchJsonWithAuth<{ subscription: Subscription; payment: any }>(`${API_URL}/subscriptions/subscribe-with-payment`, {
      method: 'POST',
      body: JSON.stringify({
        cloudPackageId: data.cloudPackageId,
        monthsCount: data.monthsCount,
        autoRenew: data.autoRenew || false
      })
    })
    return result
  } catch (error) {
    console.error('Error subscribing with payment:', error)
    throw error
  }
}

// Get all subscriptions (admin only)
export const getAllSubscriptions = async (): Promise<Subscription[]> => {
  try {
    const result = await fetchJsonWithAuth<Subscription[]>(`${API_URL}/subscriptions`, {
      method: 'GET'
    })
    return result || []
  } catch (error: any) {
    console.error('Error fetching all subscriptions:', error)
    
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

// Get user subscriptions (always uses my-subscriptions endpoint)
export const getUserSubscriptions = async (userId?: number): Promise<Subscription[]> => {
  try {
    const result = await fetchJsonWithAuth<Subscription[]>(`${API_URL}/subscriptions/my-subscriptions`, {
      method: 'GET'
    })
    return result || []
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
export const getSubscriptionById = async (subscriptionId: string): Promise<Subscription> => {
  console.log('Fetching subscription with ID:', subscriptionId)
  try {
    const result = await fetchJsonWithAuth<Subscription>(`${API_URL}/subscriptions/${subscriptionId}`, {
      method: 'GET'
    })
    
    return result
  } catch (error) {
    console.error('Error fetching subscription:', error)
    throw error
  }
}

// Update subscription
export const updateSubscription = async (subscriptionId: string, updateData: any): Promise<Subscription> => {
  try {
    const result = await fetchJsonWithAuth<Subscription>(`${API_URL}/subscriptions/${subscriptionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData)
    })
    return result
  } catch (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

// Toggle auto renew
export const toggleAutoRenew = async (subscriptionId: string, autoRenew: boolean): Promise<Subscription> => {
  try {
    const result = await fetchJsonWithAuth<Subscription>(`${API_URL}/subscriptions/${subscriptionId}/auto-renew`, {
      method: 'PATCH',
      body: JSON.stringify({
        auto_renew: autoRenew
      })
    })
    return result
  } catch (error) {
    console.error('Error toggling auto renew:', error)
    throw error
  }
}

// Cancel subscription
export const cancelSubscription = async (subscriptionId: string): Promise<Subscription> => {
  try {
    const result = await fetchJsonWithAuth<Subscription>(`${API_URL}/subscriptions/${subscriptionId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({})
    })
    return result
  } catch (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

// Suspend subscription
export const suspendSubscription = async (subscriptionId: string): Promise<Subscription> => {
  try {
    const result = await fetchJsonWithAuth<Subscription>(`${API_URL}/subscriptions/${subscriptionId}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({})
    })
    return result
  } catch (error) {
    console.error('Error suspending subscription:', error)
    throw error
  }
}

// Reactivate subscription
export const reactivateSubscription = async (subscriptionId: string): Promise<Subscription> => {
  try {
    const result = await fetchJsonWithAuth<Subscription>(`${API_URL}/subscriptions/${subscriptionId}/reactivate`, {
      method: 'PATCH',
      body: JSON.stringify({})
    })
    return result
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    throw error
  }
}

// Delete subscription
export const deleteSubscription = async (subscriptionId: string): Promise<void> => {
  try {
    await fetchJsonWithAuth<void>(`${API_URL}/subscriptions/${subscriptionId}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    throw error
  }
}