'use client'
import { Site } from '@/hooks/queries/useSites'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { MapPin } from 'lucide-react'

interface SiteListProps {
  sites: Site[]
  selectedSiteId: number | null
  onSiteSelect: (site: Site) => void
}

export function SiteList({ sites, selectedSiteId, onSiteSelect }: SiteListProps) {
  return (
    <div className="h-full overflow-y-auto space-y-2 p-3">
      {sites.length === 0 && (
        <div className="text-center text-sm text-muted-foreground py-8">No sites found</div>
      )}
      {sites.map((site) => {
        const isActive = !site.close_date || new Date(site.close_date) > new Date()
        const isSelected = selectedSiteId === site.id
        return (
          <button
            key={site.id}
            onClick={() => onSiteSelect(site)}
            className={cn(
              'w-full text-left rounded-lg p-3 border transition-all group',
              isSelected
                ? 'bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700'
                : 'bg-card border-border hover:border-amber-200 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'
            )}
          >
            <div className="flex items-start gap-2">
              <div className={cn(
                'mt-0.5 w-2.5 h-2.5 rounded-full shrink-0',
                isActive ? 'bg-emerald-500' : 'bg-gray-400'
              )} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{site.site_name}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{site.site_description}</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {isActive ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Active</span>
                  ) : (
                    <span>Closed {site.close_date ? format(new Date(site.close_date), 'MMM yyyy') : ''}</span>
                  )}
                </p>
              </div>
              <MapPin className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
            </div>
          </button>
        )
      })}
    </div>
  )
}
