'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Loader2, Mail, Sprout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import api from '@/lib/axiosInstance'

const schema = z.object({ email: z.string().email('Enter a valid email address') })
type FormValues = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (_values: FormValues) => {
    try {
      // Fire the API but ALWAYS show the same message regardless of response
      await api.post('/auth/forgot-password', { email: _values.email }).catch(() => {})
    } finally {
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1a0f] relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-green-900/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-emerald-900/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sprout className="h-7 w-7 text-green-400" />
          <span className="text-xl font-semibold text-white">SeedSense</span>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {submitted ? (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Mail className="h-6 w-6 text-green-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Check your email</h2>
              <p className="text-sm text-white/60">
                If that email is registered, a reset link was sent. Check your inbox and spam folder.
              </p>
              <Link href="/login" className="block mt-4 text-sm text-green-400 hover:text-green-300 transition-colors">
                ← Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Reset your password</h2>
                <p className="text-sm text-white/50 mt-1">Enter your email and we&apos;ll send you a reset link.</p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-white/70 text-sm">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    {...register('email')}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-green-400"
                  />
                  {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-500 text-white">
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : 'Send reset link'}
                </Button>
              </form>
              <Link href="/login" className="block mt-4 text-center text-sm text-white/40 hover:text-white/60 transition-colors">
                ← Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
