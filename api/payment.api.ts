// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface CreatePaymentRequest {
  userId: number
  packageId: number
  amount: number
  planName: string
}

export interface CreatePaymentResponse {
  paymentId: string
  qrUrl: string
}

export const paymentApi = {
  createPayment: async (data: CreatePaymentRequest): Promise<CreatePaymentResponse> => {
    const response = await fetch(`${API_BASE_URL}/sepay/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create payment')
    }

    return response.json()
  },

  checkPaymentStatus: async (userId: number, packageId: number): Promise<{ isPaid: boolean }> => {
    const response = await fetch(
      `${API_BASE_URL}/user-packages/user/${userId}/package/${packageId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return { isPaid: false }
    }

    const userPackage = await response.json()
    return { isPaid: userPackage?.isPaid || false }
  },
}