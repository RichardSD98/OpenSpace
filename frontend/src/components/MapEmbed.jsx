import { useEffect, useState } from 'react'

function buildEmbedUrl(neighborhood, address) {
  const query = address
    ? `${address}, ${neighborhood}, Windhoek, Namibia`
    : `${neighborhood}, Windhoek, Namibia`
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
}

export default function MapEmbed({ neighborhood, address }) {
  const [url, setUrl] = useState(null)
  const label = address ? `${address}, ${neighborhood}` : `${neighborhood}, Windhoek`
  const mapsLink = `https://www.google.com/maps/search/${encodeURIComponent(
    address ? `${address}, ${neighborhood}, Windhoek, Namibia` : `${neighborhood}, Windhoek, Namibia`
  )}`

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
        height="320"
        style={{ display: 'block', border: 'none' }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.75rem', background: 'var(--bg)' }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--grey)', margin: 0 }}>
          © Google Maps
        </p>
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: '0.7rem', color: 'var(--fg)', fontWeight: 500, textDecoration: 'none' }}
        >
          Open in Google Maps ↗
        </a>
      </div>
    </div>
  )
}
