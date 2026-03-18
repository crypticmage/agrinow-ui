import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/api'

export interface ImageMeta {
  id: number
  file_name: string
  format: string
  size: number
  created_at: string
}

export interface ThumbnailResponse {
  image_id: number
  format: string
  data_uri: string
}

export function useUploadImage() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post<ImageMeta>('/images/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },
  })
}

export function useThumbnail(imageId: number | null) {
  return useQuery({
    queryKey: ['images', 'thumb', imageId],
    queryFn: async () => {
      const { data } = await api.get<ThumbnailResponse>(`/images/base/${imageId}`)
      return data
    },
    enabled: imageId != null,
    staleTime: 5 * 60 * 1000, // thumbnails rarely change
  })
}

// Lazy hook — only fetches when enabled=true
export function useFullImage(imageId: number | null, enabled: boolean) {
  return useQuery({
    queryKey: ['images', 'full', imageId],
    queryFn: async () => {
      // Full image returns binary — fetch as blob and create object URL
      const response = await api.get(`/images/${imageId}`, { responseType: 'blob' })
      const url = URL.createObjectURL(response.data)
      return url
    },
    enabled: imageId != null && enabled,
    staleTime: 5 * 60 * 1000,
  })
}
