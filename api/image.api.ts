import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'

export interface Image {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  url: string
  uploadedBy?: number
  createdAt: string
  updatedAt: string
}

export const imageApi = {
  async uploadImage(file: File): Promise<Image> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await axios.post(`${API_URL}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true,
    })
    
    return response.data
  },

  async getImage(id: string): Promise<Image> {
    const response = await axios.get(`${API_URL}/images/${id}`, {
      withCredentials: true,
    })
    return response.data
  },

  async getUserImages(userId: number): Promise<Image[]> {
    const response = await axios.get(`${API_URL}/images/user/${userId}`, {
      withCredentials: true,
    })
    return response.data
  },

  async deleteImage(id: string): Promise<{ message: string }> {
    const response = await axios.delete(`${API_URL}/images/${id}`, {
      withCredentials: true,
    })
    return response.data
  },

  getImageUrl(url: string): string {
    if (url.startsWith('http')) {
      return url
    }
    return `${API_URL}${url}`
  },
}