import { fetchWithAuth, fetchJsonWithAuth } from '@/lib/fetch-wrapper'

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3003'

// Toggle admin role for user
export const toggleUserAdminRole = async (userId: number, currentRole: string) => {
  const newRole = currentRole === 'admin' ? 'customer' : 'admin'
  
  try {
    const result = await fetchJsonWithAuth<any>(`${API_URL}/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        role: newRole
      })
    })
    return result
  } catch (error) {
    console.error('Error toggling user admin role:', error)
    throw error
  }
}

// Get user by ID
export const getUserById = async (userId: number) => {
  try {
    const result = await fetchJsonWithAuth<any>(`${API_URL}/users/${userId}`, {
      method: 'GET'
    })
    return result
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// Get all users
export const getAllUsers = async () => {
  try {
    const result = await fetchJsonWithAuth<any>(`${API_URL}/users`, {
      method: 'GET'
    })
    return result
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

// Update user avatar
export const updateUserAvatar = async (userId: number, avatarUrl: string) => {
  try {
    const result = await fetchJsonWithAuth<any>(`${API_URL}/users/${userId}/avatar`, {
      method: 'PUT',
      body: JSON.stringify({
        avatarUrl
      })
    })
    return result
  } catch (error) {
    console.error('Error updating user avatar:', error)
    throw error
  }
}