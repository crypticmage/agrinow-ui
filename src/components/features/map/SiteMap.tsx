'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Site } from '@/hooks/queries/useSites'
import { format } from 'date-fns'

// Fix default marker icons (Next.js/Webpack gotcha)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

interface SiteMapProps {
  sites: Site[]
  selectedSiteId: number | null
  onSiteSelect: (site: Site) => void
}

export default function SiteMap({ sites, selectedSiteId, onSiteSelect }: SiteMapProps) {
  const sitesWithCoords = sites.filter(
    (s) => s.latitude != null && s.longitude != null
  ) as (Site & { latitude: number; longitude: number })[]

  // Default center: India
  const center: [number, number] =
    sitesWithCoords.length > 0
      ? [sitesWithCoords[0].latitude, sitesWithCoords[0].longitude]
      : [20.5937, 78.9629]

  return (
    <MapContainer
      center={center}
      zoom={sitesWithCoords.length > 0 ? 10 : 5}
      className="w-full h-full"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {sitesWithCoords.map((site) => {
        const isActive = !site.close_date || new Date(site.close_date) > new Date()
        const isSelected = site.id === selectedSiteId
        return (
          <Marker
            key={site.id}
            position={[site.latitude, site.longitude]}
            eventHandlers={{ click: () => onSiteSelect(site) }}
            icon={L.divIcon({
              className: '',
              html: `<div style="
                width:${isSelected ? 18 : 14}px;height:${isSelected ? 18 : 14}px;border-radius:50%;
                background:${isActive ? '#10b981' : '#9ca3af'};
                border:2px solid white;
                box-shadow:0 0 0 ${isSelected ? 4 : 2}px ${isActive ? '#10b981' : '#9ca3af'}60;
                transition:all 0.2s;
              "></div>`,
              iconSize: [isSelected ? 18 : 14, isSelected ? 18 : 14],
              iconAnchor: [isSelected ? 9 : 7, isSelected ? 9 : 7],
            })}
          >
            <Popup>
              <div className="text-sm">
                <strong>{site.site_name}</strong>
                <p className="text-xs text-gray-500 mt-0.5">{site.site_description}</p>
                {site.close_date && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Closed: {format(new Date(site.close_date), 'MMM d, yyyy')}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  {site.latitude.toFixed(4)}, {site.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
