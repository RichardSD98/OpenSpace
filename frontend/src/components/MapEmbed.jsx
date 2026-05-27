import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default marker icon paths broken by bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Windhoek city center as fallback
const WINDHOEK = [-22.5609, 17.0658]

async function geocode(neighborhood, address) {
  const query = address
    ? `${address}, ${neighborhood}, Windhoek, Namibia`
    : `${neighborhood}, Windhoek, Namibia`
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
    }
  } catch {
    // fall through to default
  }
  return WINDHOEK
}

export default function MapEmbed({ neighborhood, address }) {
  const [coords, setCoords] = useState(null)
  const label = address ? `${address}, ${neighborhood}` : `${neighborhood}, Windhoek`

  useEffect(() => {
    if (!neighborhood) { setCoords(WINDHOEK); return }
    geocode(neighborhood, address).then(setCoords)
  }, [neighborhood, address])

  if (!coords) {
    return (
      <div style={{
        height: '300px', borderRadius: '2px', border: '1px solid var(--border)',
        background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ color: 'var(--grey)', fontSize: '0.8rem' }}>Loading map…</span>
      </div>
    )
  }

  return (
    <div style={{ height: '300px', borderRadius: '2px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <MapContainer
        center={coords}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords}>
          <Popup>{label}</Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
