import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

export interface VmDetails {
  subscription: {
    id: string
    status: string
    packageName?: string
    startDate?: string
    endDate?: string
  }
  vm: {
    id: string
    subscriptionId: string
    instanceName: string
    instanceId: string
    compartmentId?: string
    shape: string
    imageId?: string
    imageName?: string
    operatingSystem?: string
    region?: string
    availabilityDomain: string
    lifecycleState: string
    publicIp?: string
    privateIp?: string
    vcnId?: string
    subnetId?: string
    sshPublicKey?: string
    createdAt: string
    startedAt?: string
    updatedAt: string
  } | null
  isConfigured: boolean
}

export interface ConfigureVmDto {
  displayName: string
  imageId: string
  shape: string
  ocpus: number
  memoryInGBs: number
  bootVolumeSizeInGBs: number
  notificationEmail: string
  description?: string
}

export interface VmActionDto {
  action: 'START' | 'STOP' | 'RESTART' | 'TERMINATE'
}

export interface ConfigureVmResponse {
  success: boolean
  message: string
  data: {
    vmInstanceId: string
    instanceOcid: string
    displayName: string
    shape: string
    lifecycleState: string
    publicIp?: string
  }
}

/**
 * Get VM details for a subscription
 */
export const getSubscriptionVm = async (subscriptionId: string): Promise<VmDetails> => {
  const response = await axios.get(
    `${API_BASE_URL}/vm-subscription/${subscriptionId}`,
    {
      withCredentials: true
    }
  )
  return response.data
}

/**
 * Configure VM for a subscription
 */
export const configureSubscriptionVm = async (
  subscriptionId: string,
  data: ConfigureVmDto
): Promise<ConfigureVmResponse> => {
  const response = await axios.post(
    `${API_BASE_URL}/vm-subscription/${subscriptionId}/configure`,
    data,
    {
      withCredentials: true
    }
  )
  return response.data
}

/**
 * Perform VM action (start, stop, restart, terminate)
 */
export const performVmAction = async (
  subscriptionId: string,
  action: VmActionDto['action']
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.post(
    `${API_BASE_URL}/vm-subscription/${subscriptionId}/action`,
    { action },
    {
      withCredentials: true
    }
  )
  return response.data
}

/**
 * Request new SSH key for VM
 */
export const requestNewSshKey = async (
  subscriptionId: string,
  email: string
): Promise<{ success: boolean; message: string }> => {
  const response = await axios.post(
    `${API_BASE_URL}/vm-subscription/${subscriptionId}/request-key`,
    { email },
    {
      withCredentials: true
    }
  )
  return response.data
}
