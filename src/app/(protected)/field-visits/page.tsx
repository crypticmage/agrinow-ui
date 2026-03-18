'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useSitesList, useMySites } from '@/hooks/queries/useSites'
import { useMyAssignments } from '@/hooks/queries/useSiteComments'
import { CommentList } from '@/components/features/field-visits/CommentList'
import { PostForm } from '@/components/features/field-visits/PostForm'
import { PageHeader } from '@/components/ui/page-header'
import { useAppStore } from '@/stores/appStore'
import type { Site } from '@/hooks/queries/useSites'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

function FieldVisitsContent() {
  const searchParams = useSearchParams()
  const siteParam = searchParams.get('site')
  const { currentUser } = useAppStore()
  const isAdminOrManager = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  // Admins/managers see all sites; farmers/agents see only assigned sites
  const { data: allSites = [] } = useSitesList()
  const { data: mySites = [] } = useMySites()
  const { data: myAssignments = [] } = useMyAssignments()

  const sites = isAdminOrManager ? allSites : mySites
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)

  // Auto-select from URL param
  useEffect(() => {
    if (siteParam && sites.length > 0) {
      const found = sites.find((s) => s.id === parseInt(siteParam))
      if (found) setSelectedSite(found)
    } else if (sites.length > 0 && !selectedSite) {
      setSelectedSite(sites[0])
    }
  }, [siteParam, sites])

  // Get current user's relation ID for posting
  const relationId = myAssignments.find((a) => a.site_id === selectedSite?.id)?.id

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left: site selector */}
      <div className="w-64 shrink-0 border-r flex flex-col">
        <div className="px-4 py-4 border-b">
          <PageHeader title="Field Visits" className="mb-0" />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sites.map((site) => {
            const isActive = !site.close_date || new Date(site.close_date) > new Date()
            return (
              <button
                key={site.id}
                onClick={() => setSelectedSite(site)}
                className={cn(
                  'w-full text-left rounded-lg px-3 py-2.5 transition-all text-sm',
                  selectedSite?.id === site.id
                    ? 'bg-amber-50 border border-amber-300 dark:bg-amber-900/20 dark:border-amber-700'
                    : 'hover:bg-muted/50'
                )}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', isActive ? 'bg-emerald-500' : 'bg-gray-400')} />
                  <span className="font-medium truncate">{site.site_name}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5 pl-3.5">{site.site_description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right: chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedSite ? (
          <>
            <div className="px-4 py-3 border-b bg-muted/20 shrink-0">
              <h2 className="font-semibold text-foreground">{selectedSite.site_name}</h2>
              <p className="text-xs text-muted-foreground">{selectedSite.site_description}</p>
            </div>
            <CommentList siteId={selectedSite.id} />
            {relationId != null ? (
              <PostForm siteId={selectedSite.id} relationId={relationId} />
            ) : isAdminOrManager ? (
              <PostForm siteId={selectedSite.id} relationId={0} />
            ) : (
              <div className="border-t p-3 text-center text-xs text-muted-foreground">
                You are not assigned to this site. Contact your manager to be assigned.
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Select a site to view field visits</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function FieldVisitsPage() {
  return (
    <Suspense>
      <FieldVisitsContent />
    </Suspense>
  )
}
