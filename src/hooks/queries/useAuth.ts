'use client'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import api from '@/lib/api'
import { useAppStore } from '@/stores/appStore'
import type { LoginResponse } from '@/types/auth'

interface LoginCredentials {
  identifier: string
  password: string
}

interface UseLoginOptions {
  /** Override post-auth navigation. Called instead of router.push('/dashboard'). */
  onNavigate?: () => void
}

export function useLogin(options?: UseLoginOptions) {
  const router = useRouter()
  const { login } = useAppStore()

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post<LoginResponse>('/auth/login', credentials)
      return data
    },
    onSuccess: (data) => {
      // Store token in memory (not localStorage) for Authorization header injection.
      // Backend's HTTPBearer reads from Authorization header, not cookie.
      login(data.username, data.email, data.role, data.access_token)
      // Also persist in a JS cookie so Next.js server components can read it
      // for SSR prefetch (same security level as localStorage).
      document.cookie = `auth-token=${data.access_token}; path=/; SameSite=Strict; max-age=28800`
      if (options?.onNavigate) {
        options.onNavigate()
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.detail ?? 'Login failed. Please try again.'
      toast.error(message)
    },
  })
}
