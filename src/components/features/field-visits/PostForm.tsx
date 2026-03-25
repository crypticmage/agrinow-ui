'use client'
import { useState, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { usePostComment } from '@/hooks/queries/useSiteComments'
import { useUploadImage } from '@/hooks/queries/useImages'
import { Button } from '@/components/ui/button'
import { Loader2, ImageIcon, Send, X, Paperclip } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PostFormProps {
  siteId: number
  relationId: number
}

export function PostForm({ siteId, relationId }: PostFormProps) {
  const [text, setText] = useState('')
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const postComment = usePostComment()
  const uploadImage = useUploadImage()

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) {
      setPendingFile(files[0])
      setPreview(URL.createObjectURL(files[0]))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    noClick: true,
  })

  const clearFile = () => {
    setPendingFile(null)
    setPreview(null)
  }

  const handleSend = async () => {
    if (!text.trim() && !pendingFile) return
    try {
      let imageId: number | undefined
      if (pendingFile) {
        const meta = await uploadImage.mutateAsync(pendingFile)
        imageId = meta.id
      }
      await postComment.mutateAsync({
        site_user_relation_id: relationId,
        comment: text.trim(),
        image_id: imageId,
        type: imageId ? 'image' : 'text',
        siteId,
      })
      setText('')
      clearFile()
      textareaRef.current?.focus()
    } catch {
      toast.error('Failed to send comment.')
    }
  }

  const isSending = postComment.isPending || uploadImage.isPending
  const canSend = !isSending && (!!text.trim() || !!pendingFile)

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-t bg-background px-4 py-3 shrink-0 transition-colors',
        isDragActive && 'bg-primary/5 border-primary/30'
      )}
    >
      <input {...getInputProps()} />

      {/* Drag overlay hint */}
      {isDragActive && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 pointer-events-none">
          <p className="text-sm text-primary font-medium">Drop image to attach</p>
        </div>
      )}

      {/* Image preview */}
      {preview && (
        <div className="mb-2.5 relative inline-flex">
          <img
            src={preview}
            alt="preview"
            className="h-20 w-auto max-w-35 rounded-lg border object-cover shadow-sm"
          />
          <button
            type="button"
            onClick={clearFile}
            className="absolute -top-1.5 -right-1.5 h-5 w-5 bg-background border shadow-sm rounded-full flex items-center justify-center hover:bg-destructive hover:border-destructive hover:text-white transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
          {pendingFile && (
            <span className="absolute -bottom-1 left-0 right-0 text-center text-[10px] text-muted-foreground truncate px-1">
              {pendingFile.name}
            </span>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Write a field visit note…"
          rows={1}
          className="flex-1 resize-none rounded-lg border bg-muted/40 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground min-h-9 max-h-32 overflow-y-auto"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />

        <label className="cursor-pointer shrink-0">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => e.target.files?.[0] && onDrop([e.target.files[0]])}
          />
          <div className={cn(
            'h-9 w-9 rounded-lg border flex items-center justify-center transition-colors',
            pendingFile
              ? 'bg-primary/10 border-primary/30 text-primary'
              : 'hover:bg-muted text-muted-foreground'
          )}>
            {pendingFile ? <Paperclip className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
          </div>
        </label>

        <Button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="h-9 w-9 shrink-0"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground/50 mt-1.5 pl-0.5">
        Enter to send · Shift+Enter for new line · Drag & drop image
      </p>
    </div>
  )
}
