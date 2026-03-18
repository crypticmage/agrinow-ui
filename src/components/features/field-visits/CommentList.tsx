'use client'
import { useComments } from '@/hooks/queries/useSiteComments'
import { ChatBubble } from './ChatBubble'
import { ChatSkeleton } from '@/components/Skeletons'
import { useAppStore } from '@/stores/appStore'
import { useEffect, useRef } from 'react'
import { MessageSquare } from 'lucide-react'

interface CommentListProps {
  siteId: number
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
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-medium text-foreground">No field visits yet</p>
        <p className="text-xs text-muted-foreground mt-1">Be the first to log a visit for this site.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1">
      {comments.map((c) => (
        <ChatBubble
          key={c.id}
          comment={c}
          isMine={c.user_id === undefined ? false : true} // can refine with currentUser comparison when user IDs are available
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
