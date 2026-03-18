'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { usePostComment } from '@/hooks/queries/useSiteComments'
import { useUploadImage } from '@/hooks/queries/useImages'
import { Button } from '@/components/ui/button'
import { Loader2, Image, Send, X } from 'lucide-react'
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

  const postComment = usePostComment()
  const uploadImage = useUploadImage()

  const onDrop = useCallback((files: File[]) => {
    if (files[0]) {
      setPendingFile(files[0])
      setPreview(URL.createObjectURL(files[0]))
    }
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
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
    } catch {
      toast.error('Failed to send comment.')
    }
  }

  const isSending = postComment.isPending || uploadImage.isPending

  return (
    <div {...getRootProps()} className="border-t bg-background p-3">
      <input {...getInputProps()} />
      {preview && (
        <div className="mb-2 relative inline-block">
          <img src={preview} alt="preview" className="h-16 w-auto rounded border object-cover" />
          <button onClick={clearFile} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-white rounded-full flex items-center justify-center">
            <X className="h-2.5 w-2.5" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Write a comment... (drag & drop image here)"
          rows={1}
          className="flex-1 resize-none rounded-lg border bg-muted/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
        <label className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg border hover:bg-muted transition-colors shrink-0">
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && onDrop([e.target.files[0]])} />
          <Image className="h-4 w-4 text-muted-foreground" />
        </label>
        <Button
          onClick={handleSend}
          disabled={isSending || (!text.trim() && !pendingFile)}
          size="icon"
          className="bg-amber-600 hover:bg-amber-500 text-white shrink-0"
        >
          {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
