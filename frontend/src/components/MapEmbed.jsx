import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icons broken by Vite's asset handling
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const WINDHOEK_CENTER = [-22.5594, 17.0832]

export default function MapEmbed({ neighborhood, address }) {
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState(false)

  const query = address
    ? `${address}, ${neighborhood}, Windhoek, Namibia`
    : `${neighborhood}, Windhoek, Namibia`

  useEffect(() => {
    if (!neighborhood) return
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
    fetch(url, { headers: { 'Accept-Language': 'en' } })
      .then(r => r.json())
      .then(results => {
        if (results?.length > 0) {
          setCoords([parseFloat(results[0].lat), parseFloat(results[0].lon)])
        } else {
          setCoords(WINDHOEK_CENTER)
        }
      })
      .catch(() => {
        setCoords(WINDHOEK_CENTER)
        setError(true)
      })
  }, [query, neighborhood])

  if (!coords) {
    return (
      <div className="skeleton" style={{ height: '280px', borderRadius: '2px' }} />
    )
  }

  return (
    <div style={{
      border: '1px solid var(--border)',
      borderRadius: '2px',
      overflow: 'hidden',
      height: '280px',
    }}>
      {error && (
        <p style={{ fontSize: '0.75rem', color: 'var(--grey)', padding: '0.4rem 0.75rem', background: 'var(--bg-subtle)' }}>
          Showing approximate area
        </p>
      )}
      <MapContainer
        center={coords}
        zoom={15}
        style={{ height: error ? 'calc(100% - 1.6rem)' : '100%', width: '100%' }}
        scrollWheelZoom={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <Marker position={coords}>
          <Popup>
            {neighborhood}{address ? `, ${address}` : ''}, Windhoek
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
