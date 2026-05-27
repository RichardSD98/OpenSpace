import { useEffect, useState } from 'react'

const WINDHOEK_BBOX = '16.9,-22.7,17.2,-22.4'

function buildEmbedUrl(neighborhood, address) {
  const query = address
    ? `${address}, ${neighborhood}, Windhoek, Namibia`
    : `${neighborhood}, Windhoek, Namibia`
  return `https://www.openstreetmap.org/export/embed.html?bbox=${WINDHOEK_BBOX}&layer=mapnik&marker=&query=${encodeURIComponent(query)}`
}

export default function MapEmbed({ neighborhood, address }) {
  const [url, setUrl] = useState(null)
  const label = address ? `${address}, ${neighborhood}` : `${neighborhood}, Windhoek`

  useEffect(() => {
    if (!neighborhood) return
    setUrl(buildEmbedUrl(neighborhood, address))
  }, [neighborhood, address])

  if (!url) return null

  return (
    <div style={{ borderRadius: '2px', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <iframe
        title={label}
        src={url}
        width="100%"
        height="300"
        style={{ display: 'block', border: 'none' }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <p style={{ fontSize: '0.7rem', color: 'var(--grey)', padding: '0.35rem 0.75rem', margin: 0 }}>
        © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer"
          style={{ color: 'inherit' }}>OpenStreetMap</a> contributors
      </p>
    </div>
  )
}