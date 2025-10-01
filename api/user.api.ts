import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

// Toggle admin role for user
export const toggleUserAdminRole = async (userId: number, currentRole: string) => {
  const newRole = currentRole === 'admin' ? 'customer' : 'admin'
  
  try {
    const response = await axios.patch(`${API_URL}/users/${userId}`, {
      role: newRole
    })
    return response.data
  } catch (error) {
    console.error('Error toggling user admin role:', error)
    throw error
  }
}

// Get user by ID
export const getUserById = async (userId: number) => {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// Get all users
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`)
    return response.data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}