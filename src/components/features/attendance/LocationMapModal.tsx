'use client'
import dynamic from 'next/dynamic'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MapPin } from 'lucide-react'

// Leaflet must be SSR-disabled
const PinMap = dynamic(() => import('./PinMap'), { ssr: false, loading: () => (
  <div className="h-64 flex items-center justify-center bg-muted rounded-lg text-sm text-muted-foreground">
    Loading map...
  </div>
)})

interface LocationMapModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lat: number
  lng: number
  label?: string
}

export function LocationMapModal({ open, onOpenChange, lat, lng, label }: LocationMapModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            Check-in Location
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {label && <p className="text-sm text-muted-foreground">{label}</p>}
          <p className="text-xs font-mono text-muted-foreground">{lat.toFixed(6)}, {lng.toFixed(6)}</p>
          <div className="rounded-xl overflow-hidden border h-64">
            <PinMap lat={lat} lng={lng} />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Open in Google Maps ↗
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
