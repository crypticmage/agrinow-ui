'use client'
import { useFullImage } from '@/hooks/queries/useImages'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

interface ImageLightboxProps {
  imageId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImageLightbox({ imageId, open, onOpenChange }: ImageLightboxProps) {
  const { data: url, isLoading } = useFullImage(imageId, open && imageId != null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-2 bg-black/90 border-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        ) : url ? (
          <img src={url} alt="Full size" className="w-full h-auto max-h-[80vh] object-contain rounded" />
        ) : (
          <div className="flex items-center justify-center h-64 text-white/50 text-sm">Image not available</div>
        )}
      </DialogContent>
    </Dialog>
  )
}
