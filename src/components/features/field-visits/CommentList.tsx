'use client'
import { useComments } from '@/hooks/queries/useSiteComments'
import { ChatBubble } from './ChatBubble'
import { ChatSkeleton } from '@/components/Skeletons'
import { useAppStore } from '@/stores/appStore'
import { useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'
import { format, isToday, isYesterday, isSameDay } from 'date-fns'

interface CommentListProps {
  siteId: number
}

function DateDivider({ date }: { date: Date }) {
  const label = isToday(date)
    ? 'Today'
    : isYesterday(date)
    ? 'Yesterday'
    : format(date, 'MMMM d, yyyy')
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-[11px] text-muted-foreground/60 font-medium shrink-0">{label}</span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  )
}

export function CommentList({ siteId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(siteId)
  const { currentUser } = useAppStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments?.length])

  if (isLoading) return <ChatSkeleton />

  if (!comments?.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-muted/5">
        <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
          <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-medium text-foreground">No field visits yet</p>
        <p className="text-xs text-muted-foreground mt-1">Be the first to log a visit for this site.</p>
      </div>
    )
  }

  // Insert date dividers
  const withDividers: Array<{ type: 'divider'; date: Date } | { type: 'comment'; comment: typeof comments[number] }> = []
  let lastDate: Date | null = null
  for (const c of comments) {
    const d = new Date(c.timestamp)
    if (!lastDate || !isSameDay(d, lastDate)) {
      withDividers.push({ type: 'divider', date: d })
      lastDate = d
    }
    withDividers.push({ type: 'comment', comment: c })
  }

  return (
    <div className="flex-1 overflow-y-auto py-2 bg-muted/5">
      {withDividers.map((item, i) =>
        item.type === 'divider' ? (
          <DateDivider key={`divider-${i}`} date={item.date} />
        ) : (
          <ChatBubble
            key={item.comment.id}
            comment={item.comment}
            isMine={item.comment.username === currentUser?.userName}
          />
        )
      )}
      <div ref={bottomRef} />
    </div>
  )
}
