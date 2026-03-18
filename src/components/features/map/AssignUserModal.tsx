'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

const selectCls =
  'h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer'
import { useAssignUser } from '@/hooks/queries/useSites'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

const schema = z.object({
  user_id: z.string().min(1, 'Select a user'),
})
type FormValues = z.infer<typeof schema>

interface AssignUserModalProps {
  siteId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AssignUserModal({ siteId, open, onOpenChange }: AssignUserModalProps) {
  const assignUser = useAssignUser()
  const { data: users } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const { data } = await api.get<{ id: number; username: string; first_name: string; last_name: string }[]>('/users/')
      return data
    },
    enabled: open,
  })

  const { handleSubmit, register, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values: FormValues) => {
    if (!siteId) return
    try {
      await assignUser.mutateAsync({
        user_id: parseInt(values.user_id),
        site_id: siteId,
        assigned_date: format(new Date(), 'yyyy-MM-dd'),
      })
      toast.success('User assigned successfully!')
      reset()
      onOpenChange(false)
    } catch {
      toast.error('Failed to assign user.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Assign User to Site</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Select User *</Label>
            <select {...register('user_id')} className={selectCls} defaultValue="">
              <option value="">Choose a user…</option>
              {users?.map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.first_name} {u.last_name} (@{u.username})
                </option>
              ))}
            </select>
            {errors.user_id && <p className="text-xs text-destructive">{errors.user_id.message}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={assignUser.isPending}>
              {assignUser.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
