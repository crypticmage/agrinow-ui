'use client'
import { useBootstrapSession } from '@/hooks/useBootstrapSession'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { AppLayout } from '@/components/layout/AppLayout'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isReady, isAuthenticated } = useBootstrapSession()
  const router = useRouter()

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isReady, isAuthenticated, router])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return <AppLayout>{children}</AppLayout>
}
