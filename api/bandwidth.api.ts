import { fetchJsonWithAuth } from '@/lib/fetch-wrapper'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Get bandwidth usage for all VMs (Admin only)
 */
export async function getAllVmsBandwidth(timeRange: string = '30d') {
  try {
    console.log(`Calling API: ${API_URL}/bandwidth/all-vms?timeRange=${timeRange}`)
    const response = await fetchJsonWithAuth<any>(`${API_URL}/bandwidth/all-vms?timeRange=${timeRange}`)
    console.log('API response:', response)
    return response
  } catch (error) {
    console.error('Error fetching all VMs bandwidth:', error)
    throw error
  }
}

/**
 * Get bandwidth usage for a specific VM
 */
export async function getVmBandwidth(instanceId: string, timeRange: string = '7d') {
  try {
    const response = await fetchJsonWithAuth<any>(`${API_URL}/bandwidth/vm/${instanceId}?timeRange=${timeRange}`)
    return response
  } catch (error) {
    console.error('Error fetching VM bandwidth:', error)
    throw error
  }
}
