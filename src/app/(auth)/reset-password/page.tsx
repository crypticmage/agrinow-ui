'use client'
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/axiosInstance'

const schema = z
  .object({
    new_password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string(),
  })
  .refine((v) => v.new_password === v.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })
type FormValues = z.infer<typeof schema>

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) router.replace('/forgot-password')
  }, [token, router])

  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/auth/reset-password', { token, new_password: values.new_password })
      toast.success('Password reset successfully!')
      router.push('/login')
    } catch (error: any) {
      const status = error.response?.status
      if (status === 400 || status === 410) {
        setError('root', {
          message: 'This reset link has expired or has already been used.',
        })
      } else {
        setError('root', { message: 'Something went wrong. Please try again.' })
      }
    }
  }

  if (!token) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1a0f] relative overflow-hidden">
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-green-900/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-emerald-900/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sprout className="h-7 w-7 text-green-400" />
          <span className="text-xl font-semibold text-white">SeedSense</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Set new password</h2>
            <p className="text-sm text-white/50 mt-1">Choose a strong password (min. 6 characters).</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <div className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg p-3">
                {errors.root.message}{' '}
                <Link href="/forgot-password" className="underline hover:text-red-300">Request a new link</Link>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="new_password" className="text-white/70 text-sm">New password</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="••••••••"
                {...register('new_password')}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-green-400"
              />
              {errors.new_password && <p className="text-xs text-red-400">{errors.new_password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm_password" className="text-white/70 text-sm">Confirm password</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="••••••••"
                {...register('confirm_password')}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-green-400"
              />
              {errors.confirm_password && <p className="text-xs text-red-400">{errors.confirm_password.message}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-500 text-white">
              {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetting...</> : 'Reset password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
