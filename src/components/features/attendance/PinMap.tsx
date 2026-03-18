'use client'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
})

interface PinMapProps {
  lat: number
  lng: number
}

export default function PinMap({ lat, lng }: PinMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      className="w-full h-full"
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]} />
      <Circle
        center={[lat, lng]}
        radius={50}
        pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.15 }}
      />
    </MapContainer>
  )
}
