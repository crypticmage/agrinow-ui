'use client'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { useSitesList } from '@/hooks/queries/useSites'
import { SiteList } from '@/components/features/map/SiteList'
import { SiteDetailSheet } from '@/components/features/map/SiteDetailSheet'
import { CreateSiteModal } from '@/components/features/map/CreateSiteModal'
import { AssignUserModal } from '@/components/features/map/AssignUserModal'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { MapSkeleton } from '@/components/Skeletons'
import { useAppStore } from '@/stores/appStore'
import { Plus } from 'lucide-react'
import type { Site } from '@/hooks/queries/useSites'

const SiteMap = dynamic(() => import('@/components/features/map/SiteMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
})

export default function FieldsMapPage() {
  const { currentUser } = useAppStore()
  const canManage = currentUser?.role === 'admin' || currentUser?.role === 'manager'

  const { data: sites = [], isLoading } = useSitesList()
  const [selectedSite, setSelectedSite] = useState<Site | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)

  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site)
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-6 pt-6 pb-3 shrink-0">
        <PageHeader
          title="Fields Map"
          subtitle="View and manage your agricultural sites"
          action={
            canManage ? (
              <Button
                onClick={() => setCreateOpen(true)}
                className="bg-amber-600 hover:bg-amber-500 text-white"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New Site
              </Button>
            ) : undefined
          }
        />
      </div>

      <div className="flex flex-1 min-h-0 gap-0 overflow-hidden">
        <div className="w-72 shrink-0 border-r overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {sites.length} Sites
            </p>
          </div>
          <SiteList
            sites={sites}
            selectedSiteId={selectedSite?.id ?? null}
            onSiteSelect={handleSiteSelect}
          />
        </div>

        <div className="flex-1 relative isolate">
          {isLoading ? (
            <div className="h-full p-4"><MapSkeleton /></div>
          ) : (
            <SiteMap
              sites={sites}
              selectedSiteId={selectedSite?.id ?? null}
              onSiteSelect={handleSiteSelect}
            />
          )}
        </div>
      </div>

      <SiteDetailSheet
        site={selectedSite}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onAssignUser={() => setAssignOpen(true)}
        canManage={canManage}
      />

      <CreateSiteModal open={createOpen} onOpenChange={setCreateOpen} />
      <AssignUserModal siteId={selectedSite?.id ?? null} open={assignOpen} onOpenChange={setAssignOpen} />
    </div>
  )
}
