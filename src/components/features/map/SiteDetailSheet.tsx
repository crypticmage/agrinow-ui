'use client'
import { Site } from '@/hooks/queries/useSites'
import { useComments } from '@/hooks/queries/useSiteComments'
import { useSiteAssignments } from '@/hooks/queries/useSites'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { CalendarDays, MapPin, UserPlus, Users, MessageSquare, Clock } from 'lucide-react'

interface SiteDetailSheetProps {
  site: Site | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssignUser: () => void
  canManage: boolean
}

function UserAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return (
    <div
      className={`${size === 'md' ? 'h-8 w-8 text-xs' : 'h-6 w-6 text-[10px]'} rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold shrink-0`}
    >
      {initials}
    </div>
  )
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
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0 overflow-hidden">

        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-start justify-between gap-3 pr-7">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={isActive ? 'default' : 'secondary'} className="text-[10px] h-4 px-1.5 shrink-0">
                  {isActive ? 'Active' : 'Closed'}
                </Badge>
              </div>
              <SheetTitle className="text-lg leading-tight">{site.site_name}</SheetTitle>
              {site.site_description && (
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{site.site_description}</p>
              )}
            </div>
          </div>
        </SheetHeader>

        <Separator />

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Dates */}
          <div className="px-5 py-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground w-20 shrink-0">Started</span>
              <span className="font-medium">{format(new Date(site.created_date), 'MMM d, yyyy')}</span>
            </div>
            {site.close_date && (
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground w-20 shrink-0">Closes</span>
                <span className="font-medium">{format(new Date(site.close_date), 'MMM d, yyyy')}</span>
              </div>
            )}
            {(site.latitude != null && site.longitude != null) && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground w-20 shrink-0">Location</span>
                <span className="font-medium font-mono text-xs">
                  {Number(site.latitude).toFixed(4)}, {Number(site.longitude).toFixed(4)}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Assigned Users */}
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Assigned Users</span>
                {siteAssignments.length > 0 && (
                  <span className="text-xs text-muted-foreground font-normal">({siteAssignments.length})</span>
                )}
              </div>
              {canManage && (
                <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" onClick={onAssignUser}>
                  <UserPlus className="h-3 w-3" />
                  Assign
                </Button>
              )}
            </div>

            {siteAssignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No users assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-1.5">
                {siteAssignments.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                    <UserAvatar name={`User ${a.user_id}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium">User #{a.user_id}</p>
                      <p className="text-[11px] text-muted-foreground">
                        Assigned {format(new Date(a.assigned_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
                {siteAssignments.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    +{siteAssignments.length - 5} more
                  </p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Recent Field Visits */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-1.5 text-sm font-medium mb-3">
              <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Recent Field Visits</span>
              {previewComments.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal">({previewComments.length})</span>
              )}
            </div>

            {previewComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">No visits recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {previewComments.map((c) => {
                  const fullName = c.first_name
                    ? `${c.first_name} ${c.last_name || ''}`.trim()
                    : c.username || 'Unknown'
                  const timeIST = new Date(c.timestamp).toLocaleTimeString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  })
                  const dateStr = format(new Date(c.timestamp), 'MMM d')
                  return (
                    <div key={c.id} className="rounded-lg border bg-card p-3 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <UserAvatar name={fullName} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium leading-tight truncate">{fullName}</p>
                            {c.role && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5 shrink-0 capitalize">
                                {c.role}
                              </Badge>
                            )}
                          </div>
                          {c.username && (
                            <p className="text-[11px] text-muted-foreground">@{c.username}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2">{c.comment}</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{dateStr} · {timeIST} IST</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <SheetFooter className="px-5 py-4 border-t bg-muted/30 shrink-0">
          <Button
            className="w-full"
            onClick={() => {
              router.push(`/field-visits?site=${site.id}`)
              onOpenChange(false)
            }}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            View All Field Visits
          </Button>
        </SheetFooter>

      </SheetContent>
    </Sheet>
  )
}
