import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

export interface CreatePaymentRequest {
  userId?: number
  packageId?: number
  amount: number
  planName?: string
  payment_type: 'subscription' | 'deposit'
  payment_method: 'sepay_qr' | 'account_balance'
  subscription_id?: number
  cloud_package_id?: number
}

export interface CreatePaymentResponse {
  id: string
  paymentId?: string | number  // Backward compatibility
  transaction_code: string
  qrUrl?: string
}

export interface PaymentStatus {
  id: string | number
  status: 'pending' | 'success' | 'failed'
  amount: number
  payment_type: string
  transaction_code: string
}

export const paymentApi = {
  // Tạo payment mới (cho cả nạp tiền và subscription)
  createPayment: async (data: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    try {
      // Map frontend interface to backend DTO
      const backendPayload = {
        amount: data.amount,
        payment_type: data.payment_type,
        payment_method: data.payment_method,
        subscription_id: data.subscription_id,
        cloud_package_id: data.cloud_package_id,
        // Không gửi user_id vì backend sẽ tự gán từ JWT
      }
      
      const response = await axios.post(`${API_BASE_URL}/payments`, backendPayload, {
        withCredentials: true,
      })
      
      console.log('Payment API Response:', response.data)
      
      // Map backend response to frontend interface
      const backendData = response.data
      const mappedResponse = {
        id: backendData.id,
        paymentId: backendData.id, // Use string ID as is
        transaction_code: backendData.transaction_code,
        qrUrl: backendData.qrUrl,
      } as CreatePaymentResponse
      
      console.log('Mapped Response:', mappedResponse)
      return mappedResponse
    } catch (error) {
      console.error('Error creating payment:', error)
      throw error
    }
  },

  // Lấy trạng thái payment
  getPaymentStatus: async (paymentId: string | number): Promise<PaymentStatus> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/payments/${paymentId}`, {
        withCredentials: true,
      })
      return response.data
    } catch (error) {
      console.error('Error fetching payment status:', error)
      throw error
    }
  },

  // Kiểm tra trạng thái thanh toán subscription (legacy)
  checkPaymentStatus: async (userId: number, packageId: number): Promise<{ isPaid: boolean }> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/user-packages/user/${userId}/package/${packageId}`,
        {
          withCredentials: true,
        }
      )
      const userPackage = response.data
      return { isPaid: userPackage?.isPaid || false }
    } catch (error) {
      return { isPaid: false }
    }
  },
}