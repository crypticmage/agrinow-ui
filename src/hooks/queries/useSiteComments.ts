import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export interface SiteComment {
  id: number
  site_user_relation_id: number
  user_id: number
  username?: string
  first_name?: string
  last_name?: string
  role?: string
  comment: string
  image_id: number | null
  type: 'text' | 'image'
  timestamp: string // IST datetime with +05:30 offset
}

export interface MyAssignment {
  id: number       // this is site_user_relation_id
  user_id: number
  site_id: number
  assigned_date: string
}

export const COMMENT_KEYS = {
  bySite: (siteId: number) => ['comments', siteId] as const,
  myAssignments: ['sites', 'my-assignments'] as const,
}

export function useComments(siteId: number | null) {
  return useQuery({
    queryKey: COMMENT_KEYS.bySite(siteId ?? 0),
    queryFn: async () => {
      const { data } = await api.get<SiteComment[]>(`/sites/${siteId}/comments`)
      return data
    },
    enabled: siteId != null,
  })
}

export function useMyAssignments() {
  return useQuery({
    queryKey: COMMENT_KEYS.myAssignments,
    queryFn: async () => {
      const { data } = await api.get<MyAssignment[]>('/sites/my-assignments')
      return data
    },
  })
}

export function usePostComment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: {
      site_user_relation_id: number
      comment: string
      image_id?: number
      type?: 'text' | 'image'
      siteId: number // for cache invalidation only
    }) => {
      const { siteId, ...body } = payload
      const { data } = await api.post<SiteComment>('/sites/comments', body)
      return { data, siteId }
    },
    onSuccess: ({ siteId }) => {
      qc.invalidateQueries({ queryKey: COMMENT_KEYS.bySite(siteId) })
    },
  })
}
