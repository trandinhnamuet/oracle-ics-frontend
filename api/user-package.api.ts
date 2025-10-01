import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

// Get user packages by user ID
export const getUserPackages = async (userId: number) => {
  try {
    const response = await axios.get(`${API_URL}/user-packages/user/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching user packages:', error)
    throw error
  }
}

// Get paid user packages
export const getPaidUserPackages = async (userId: number) => {
  try {
    const packages = await getUserPackages(userId)
    return packages.filter((pkg: any) => pkg.isPaid === true)
  } catch (error) {
    console.error('Error fetching paid user packages:', error)
    throw error
  }
}

// Update user package
export const updateUserPackage = async (packageId: number, updateData: any) => {
  try {
    const response = await axios.patch(`${API_URL}/user-packages/${packageId}`, updateData)
    return response.data
  } catch (error) {
    console.error('Error updating user package:', error)
    throw error
  }
}

// Delete user package
export const deleteUserPackage = async (packageId: number) => {
  try {
    const response = await axios.delete(`${API_URL}/user-packages/${packageId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting user package:', error)
    throw error
  }
}

// Mark package as paid
export const markPackageAsPaid = async (packageId: number) => {
  try {
    const response = await axios.patch(`${API_URL}/user-packages/${packageId}/mark-paid`)
    return response.data
  } catch (error) {
    console.error('Error marking package as paid:', error)
    throw error
  }
}

// Mark package as unpaid
export const markPackageAsUnpaid = async (packageId: number) => {
  try {
    const response = await axios.patch(`${API_URL}/user-packages/${packageId}/mark-unpaid`)
    return response.data
  } catch (error) {
    console.error('Error marking package as unpaid:', error)
    throw error
  }
}

// Update payment amount when payment is successful
export const updatePaymentAmount = async (packageId: number, amount: number) => {
  try {
    const response = await axios.patch(`${API_URL}/user-packages/${packageId}`, {
      isPaid: true,
      totalPaidAmount: amount
    })
    return response.data
  } catch (error) {
    console.error('Error updating payment amount:', error)
    throw error
  }
}