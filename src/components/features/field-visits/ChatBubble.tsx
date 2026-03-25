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

function Avatar({ name, isMine }: { name: string; isMine: boolean }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div className={cn(
      'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5 ring-2',
      isMine
        ? 'bg-primary text-primary-foreground ring-primary/20'
        : 'bg-emerald-600 text-white ring-emerald-600/20'
    )}>
      {initials || '?'}
    </div>
  )
}

function Thumbnail({ imageId, onClick }: { imageId: number; onClick: () => void }) {
  const { data: thumb } = useThumbnail(imageId)
  if (!thumb) return null
  return (
    <button
      onClick={onClick}
      className="mt-2 block overflow-hidden rounded-xl border border-white/10 hover:opacity-90 transition-opacity"
    >
      <img src={thumb.data_uri} alt="attachment" className="w-52 h-36 object-cover" />
    </button>
  )
}

export function ChatBubble({ comment, isMine }: ChatBubbleProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const displayName = comment.first_name
    ? `${comment.first_name}${comment.last_name ? ' ' + comment.last_name : ''}`
    : comment.username ?? `User #${comment.user_id}`
  const shortTime = format(new Date(comment.timestamp), 'h:mm a')

  return (
    <div className={cn('flex gap-2.5 px-4 py-1 group', isMine ? 'flex-row-reverse' : 'flex-row')}>
      <Avatar name={displayName} isMine={isMine} />

      <div className={cn('flex flex-col max-w-xs sm:max-w-sm lg:max-w-md', isMine ? 'items-end' : 'items-start')}>
        {/* Name + role */}
        <div className={cn('flex items-center gap-1.5 mb-1', isMine ? 'flex-row-reverse' : 'flex-row')}>
          <span className="text-xs font-medium text-foreground">{isMine ? 'You' : displayName}</span>
          {comment.role && !isMine && (
            <span className="text-[10px] text-muted-foreground/70 bg-muted px-1.5 py-px rounded capitalize">
              {comment.role}
            </span>
          )}
        </div>

        {/* Bubble */}
        <div className={cn(
          'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm',
          isMine
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-muted/80 text-foreground rounded-tl-sm border border-border/40'
        )}>
          {comment.comment && <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{comment.comment}</p>}
          {comment.image_id && (
            <Thumbnail imageId={comment.image_id} onClick={() => setLightboxOpen(true)} />
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground/50 mt-1">
          {shortTime}
        </span>
      </div>

      {comment.image_id && (
        <ImageLightbox imageId={comment.image_id} open={lightboxOpen} onOpenChange={setLightboxOpen} />
      )}
    </div>
  )
}
