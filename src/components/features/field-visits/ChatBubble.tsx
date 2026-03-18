'use client'
import { SiteComment } from '@/hooks/queries/useSiteComments'
import { useThumbnail } from '@/hooks/queries/useImages'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ImageLightbox } from './ImageLightbox'

interface ChatBubbleProps {
  comment: SiteComment
  isMine: boolean
}

function Thumbnail({ imageId, onClick }: { imageId: number; onClick: () => void }) {
  const { data: thumb } = useThumbnail(imageId)
  if (!thumb) return null
  return (
    <button
      onClick={onClick}
      className="mt-1 block overflow-hidden rounded-lg border border-white/20 hover:opacity-90 transition-opacity"
    >
      <img src={thumb.data_uri} alt="attachment" className="w-48 h-32 object-cover" />
    </button>
  )
}

export function ChatBubble({ comment, isMine }: ChatBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <div className={cn('flex gap-2 mb-3', isMine ? 'flex-row-reverse' : 'flex-row')}>
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-1',
        isMine
          ? 'bg-amber-600 text-white'
          : 'bg-emerald-700 text-white'
      )}>
        {(comment.username ?? `U${comment.user_id}`).charAt(0).toUpperCase()}
      </div>
      <div className={cn('max-w-xs sm:max-w-sm', isMine ? 'items-end' : 'items-start', 'flex flex-col')}>
        <p className={cn('text-xs text-muted-foreground mb-0.5', isMine ? 'text-right' : 'text-left')}>
          {comment.username ?? `User #${comment.user_id}`} · {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
        </p>
        <div className={cn(
          'rounded-2xl px-3 py-2 text-sm',
          isMine
            ? 'bg-amber-600 text-white rounded-tr-sm'
            : 'bg-muted text-foreground rounded-tl-sm'
        )}>
          {comment.comment && <p>{comment.comment}</p>}
          {comment.image_id && (
            <Thumbnail imageId={comment.image_id} onClick={() => setLightboxOpen(true)} />
          )}
        </div>
      </div>
      {comment.image_id && (
        <ImageLightbox imageId={comment.image_id} open={lightboxOpen} onOpenChange={setLightboxOpen} />
      )}
    </div>
  )
}
