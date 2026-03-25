import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axiosInstance'

export interface AttendanceRecord {
  id: number
  user_id: number
  username: string | null
  date: string
  check_in: string | null
  check_out: string | null
  latitude: number | null
  longitude: number | null
  notes: string | null
  site_compliance: 'compliant' | 'non_compliant' | 'no_location' | 'no_site' | null
  site_distance_km: number | null
}

const KEYS = {
  today: ['attendance', 'today'] as const,
  my: ['attendance', 'my'] as const,
  all: (date?: string) => ['attendance', 'all', date ?? 'today'] as const,
}

export function useTodayAttendance() {
  return useQuery({
    queryKey: KEYS.today,
    queryFn: async () => {
      const { data } = await api.get<AttendanceRecord | null>('/attendance/today')
      return data
    },
  })
}

export function useMyAttendanceHistory() {
  return useQuery({
    queryKey: KEYS.my,
    queryFn: async () => {
      const { data } = await api.get<AttendanceRecord[]>('/attendance/my')
      return data
    },
  })
}

export function useAllAttendance(date?: string) {
  return useQuery({
    queryKey: KEYS.all(date),
    queryFn: async () => {
      const params = date ? `?target_date=${date}` : ''
      const { data } = await api.get<AttendanceRecord[]>(`/attendance/all${params}`)
      return data
    },
  })
}

export function useTeamMonthAttendance(year: number, month: number) {
  return useQuery({
    queryKey: ['attendance', 'team-month', year, month],
    queryFn: async () => {
      const { data } = await api.get<AttendanceRecord[]>(
        `/attendance/team-month?year=${year}&month=${month}`
      )
      return data
    },
    staleTime: 60_000,
  })
}

export function useCheckIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { latitude?: number; longitude?: number; notes?: string }) => {
      const { data } = await api.post<AttendanceRecord>('/attendance/check-in', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.today })
      qc.invalidateQueries({ queryKey: KEYS.my })
    },
  })
}

export function useCheckOut() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { notes?: string }) => {
      const { data } = await api.post<AttendanceRecord>('/attendance/check-out', payload)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.today })
      qc.invalidateQueries({ queryKey: KEYS.my })
    },
  })
}
