'use client'
import { useEffect, useState } from 'react'
import { useAppStore } from '@/stores/appStore'

/** Read the JWT from the backend-set cookie (non-httpOnly, so JS-accessible). */
function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|;\s*)access_token=([^;]+)/)
  if (!match) return null
  const value = decodeURIComponent(match[1])
  // Backend sets value as "Bearer {token}"
  return value.startsWith('Bearer ') ? value.slice(7) : value
}

/** Decode JWT payload without verifying — just to read claims. */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

function isExpired(payload: Record<string, any>): boolean {
  return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()
}

export function useBootstrapSession() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated)
  const accessToken = useAppStore((s) => s.accessToken)
  const login = useAppStore((s) => s.login)
  const logout = useAppStore((s) => s.logout)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // If the in-memory token is gone (page refresh) but localStorage still
    // says the user is authenticated, try to restore the token from the cookie
    // that the backend set on login (non-httpOnly, 60-min max_age).
    if (isAuthenticated && !accessToken) {
      const token = getTokenFromCookie()
      if (token) {
        const payload = decodeJwtPayload(token)
        if (payload && !isExpired(payload)) {
          // Restore the session — display info comes from localStorage already,
          // we just need to put the token back in-memory.
          login(payload.username, payload.email, payload.role, token)
        } else {
          // Cookie expired — clear everything so user goes to login
          logout()
        }
      } else {
        // No cookie — session is gone, force re-login
        logout()
      }
    }
    setIsReady(true)
  }, [])

  // isAuthenticated is reactive — when logout()/login() is called inside the
  // effect and setIsReady(true) triggers a re-render, this reflects the new value.
  return { isReady, isAuthenticated }
}
