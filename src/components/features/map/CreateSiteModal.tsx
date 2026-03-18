'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, MapPin } from 'lucide-react'
import { useCreateSite } from '@/hooks/queries/useSites'
import { useGeolocation } from '@/hooks/useGeolocation'

const schema = z.object({
  site_name: z.string().min(1, 'Required'),
  site_description: z.string().min(1, 'Required'),
  created_date: z.string().min(1, 'Required'),
  close_date: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface CreateSiteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateSiteModal({ open, onOpenChange }: CreateSiteModalProps) {
  const createSite = useCreateSite()
  const { position, loading: geoLoading } = useGeolocation()
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      created_date: new Date().toISOString().slice(0, 10),
    },
  })

  // Auto-fill GPS when position becomes available and modal is open
  useEffect(() => {
    if (open && position) {
      setValue('latitude', position.lat.toFixed(6))
      setValue('longitude', position.lng.toFixed(6))
    }
  }, [open, position, setValue])

  const onSubmit = async (values: FormValues) => {
    try {
      await createSite.mutateAsync({
        site_name: values.site_name,
        site_description: values.site_description,
        created_date: values.created_date,
        close_date: values.close_date || null,
        latitude: values.latitude ? parseFloat(values.latitude) : null,
        longitude: values.longitude ? parseFloat(values.longitude) : null,
      })
      toast.success(`Site "${values.site_name}" created!`)
      reset({ created_date: new Date().toISOString().slice(0, 10) })
      onOpenChange(false)
    } catch {
      toast.error('Failed to create site.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Site</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Site Name *</Label>
            <Input {...register('site_name')} placeholder="e.g. Alpha Farm Block" />
            {errors.site_name && <p className="text-xs text-destructive">{errors.site_name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Description *</Label>
            <Input {...register('site_description')} placeholder="Brief description" />
            {errors.site_description && <p className="text-xs text-destructive">{errors.site_description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Start Date *</Label>
              <Input type="date" {...register('created_date')} />
              {errors.created_date && <p className="text-xs text-destructive">{errors.created_date.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Close Date</Label>
              <Input type="date" {...register('close_date')} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-600" />
              Location (GPS)
              {geoLoading && <span className="text-xs text-muted-foreground font-normal ml-1">detecting...</span>}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Input {...register('latitude')} placeholder="Latitude" className="font-mono text-sm" />
              </div>
              <div>
                <Input {...register('longitude')} placeholder="Longitude" className="font-mono text-sm" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Auto-filled from your current location</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createSite.isPending} className="bg-amber-600 hover:bg-amber-500 text-white">
              {createSite.isPending ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Creating...</> : 'Create Site'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
