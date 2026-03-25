import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axiosInstance'

export interface Site {
  id: number
  site_name: string
  site_description: string
  created_date: string
  close_date: string | null
  latitude: number | null
  longitude: number | null
}

export interface SiteAssignment {
  id: number
  user_id: number
  site_id: number
  assigned_date: string
}

export interface UserSiteAssignment extends SiteAssignment {
  site_name: string | null
}

// Query keys
export const SITE_KEYS = {
  all: ['sites'] as const,
  my: ['sites', 'my'] as const,
  assignments: ['sites', 'assignments'] as const,
  myAssignments: ['sites', 'my-assignments'] as const,
  userAssignments: (userId: number) => ['sites', 'user-assignments', userId] as const,
}

export function useSitesList() {
  return useQuery({
    queryKey: SITE_KEYS.all,
    queryFn: async () => {
      const { data } = await api.get<Site[]>('/sites/')
      return data
    },
  })
}

export function useMySites() {
  return useQuery({
    queryKey: SITE_KEYS.my,
    queryFn: async () => {
      const { data } = await api.get<Site[]>('/sites/my')
      return data
    },
  })
}

export function useSiteAssignments() {
  return useQuery({
    queryKey: SITE_KEYS.assignments,
    queryFn: async () => {
      const { data } = await api.get<SiteAssignment[]>('/sites/all-assignments')
      return data
    },
  })
}

export function useCreateSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Omit<Site, 'id'>) => {
      const { data } = await api.post<Site>('/sites/', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SITE_KEYS.all })
    },
  })
}

export function useUserSiteAssignments(userId: number | null) {
  return useQuery({
    queryKey: SITE_KEYS.userAssignments(userId ?? 0),
    queryFn: async () => {
      const { data } = await api.get<UserSiteAssignment[]>(`/sites/assignments/user/${userId}`)
      return data
    },
    enabled: userId != null,
  })
}

export function useAssignUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { user_id: number; site_id: number; assigned_date: string }) => {
      const { data } = await api.post<SiteAssignment>('/sites/assign', payload)
      return data
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: SITE_KEYS.assignments })
      qc.invalidateQueries({ queryKey: SITE_KEYS.userAssignments(variables.user_id) })
    },
  })
}

export function useRemoveSiteAssignment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ assignmentId, userId }: { assignmentId: number; userId: number }) => {
      await api.delete(`/sites/assignments/${assignmentId}`)
      return userId
    },
    onSuccess: (userId) => {
      qc.invalidateQueries({ queryKey: SITE_KEYS.assignments })
      qc.invalidateQueries({ queryKey: SITE_KEYS.userAssignments(userId) })
    },
  })
}
