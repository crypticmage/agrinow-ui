'use client'
import { Site } from '@/hooks/queries/useSites'
import { useComments } from '@/hooks/queries/useSiteComments'
import { useSiteAssignments } from '@/hooks/queries/useSites'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Calendar, MessageSquare, Users } from 'lucide-react'

interface SiteDetailSheetProps {
  site: Site | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssignUser: () => void
  canManage: boolean
}

export function SiteDetailSheet({ site, open, onOpenChange, onAssignUser, canManage }: SiteDetailSheetProps) {
  const router = useRouter()
  const { data: comments } = useComments(site?.id ?? null)
  const { data: assignments } = useSiteAssignments()

  const siteAssignments = assignments?.filter((a) => a.site_id === site?.id) ?? []
  const previewComments = comments?.slice(0, 3) ?? []

  if (!site) return null

  const isActive = !site.close_date || new Date(site.close_date) > new Date()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            <SheetTitle>{site.site_name}</SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">{site.site_description}</p>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created {format(new Date(site.created_date), 'MMM d, yyyy')}</span>
            </div>
            {site.close_date && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span>· Closes {format(new Date(site.close_date), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Assigned Users ({siteAssignments.length})
              </h4>
              {canManage && (
                <Button variant="outline" size="sm" onClick={onAssignUser}>
                  + Assign
                </Button>
              )}
            </div>
            {siteAssignments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No users assigned yet.</p>
            ) : (
              <div className="space-y-1">
                {siteAssignments.slice(0, 5).map((a) => (
                  <div key={a.id} className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                    User #{a.user_id} · Assigned {format(new Date(a.assigned_date), 'MMM d, yyyy')}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium flex items-center gap-1.5 mb-2">
              <MessageSquare className="h-3.5 w-3.5" /> Recent Field Visits
            </h4>
            {previewComments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No visits recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {previewComments.map((c) => {
                  const fullName = c.first_name
                    ? `${c.first_name} ${c.last_name || ''}`.trim()
                    : null
                  const timeIST = new Date(c.timestamp).toLocaleTimeString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                  return (
                    <div key={c.id} className="text-xs bg-muted/40 rounded-lg p-2 space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          {fullName && <p className="font-medium truncate">{fullName}</p>}
                          {c.username && (
                            <p className="text-[11px] text-muted-foreground truncate">@{c.username}</p>
                          )}
                        </div>
                        {c.role && (
                          <span className="shrink-0 text-[10px] bg-muted px-1.5 py-0.5 rounded capitalize text-muted-foreground">
                            {c.role}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground truncate">{c.comment}</p>
                      <p className="text-[10px] text-muted-foreground/60">{timeIST} IST</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <Button
            className="w-full"
            onClick={() => {
              router.push(`/field-visits?site=${site.id}`)
              onOpenChange(false)
            }}
          >
            View Field Visits
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
