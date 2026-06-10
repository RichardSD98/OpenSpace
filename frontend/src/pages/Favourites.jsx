import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=70'

export default function Favourites() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/favourites')
      .then(r => setListings(r.data))
      .catch(() => toast.error('Could not load saved listings'))
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleRemove = async (listingId) => {
    setRemovingId(listingId)
    try {
      await api.delete(`/favourites/${listingId}`)
      setListings(ls => ls.filter(l => l._id !== listingId))
      toast.success('Removed from saved')
    } catch {
      toast.error('Could not remove listing')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '0.4rem' }}>
        Saved listings
      </h1>
      <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Listings you've saved for later.
      </p>

      {loading && <p style={{ color: 'var(--grey)' }}>Loading…</p>}

      {!loading && listings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--grey)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No saved listings yet.</p>
          <Link to="/" className="btn-main">Browse listings</Link>
        </div>
      )}

      {!loading && listings.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {listings.map(listing => {
            const photo = listing.photos?.[0] || PLACEHOLDER
            return (
              <div key={listing._id} style={{ border: '1px solid var(--border)', borderRadius: '2px', background: 'var(--bg)', overflow: 'hidden' }}>
                <div style={{ position: 'relative' }}>
                  <Link to={`/listings/${listing._id}`}>
                    <img
                      src={photo}
                      alt={listing.title}
                      onError={e => { e.target.src = PLACEHOLDER }}
                      style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                    />
                  </Link>
                  <button
                    onClick={() => handleRemove(listing._id)}
                    disabled={removingId === listing._id}
                    title="Remove from saved"
                    style={{
                      position: 'absolute', top: '0.6rem', right: '0.6rem',
                      background: 'rgba(0,0,0,0.45)', border: 'none', borderRadius: '50%',
                      width: '2rem', height: '2rem', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', color: '#fff',
                    }}
                  >
                    <Heart size={14} fill="currentColor" strokeWidth={0} />
                  </button>
                  {!listing.isAvailable && (
                    <span style={{
                      position: 'absolute', top: '0.6rem', left: '0.6rem',
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.06em',
                      textTransform: 'uppercase', padding: '0.2rem 0.5rem', borderRadius: '2px',
                    }}>
                      Taken
                    </span>
                  )}
                </div>
                <div style={{ padding: '0.85rem 1rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{listing.title}</p>
                  <p style={{ fontSize: '0.77rem', color: 'var(--grey)', marginBottom: '0.5rem' }}>
                    {listing.neighborhood} · {listing.unitType}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>N${listing.rent?.toLocaleString()}<span style={{ fontWeight: 400, color: 'var(--grey)', fontSize: '0.75rem' }}>/mo</span></p>
                    <Link to={`/listings/${listing._id}`} style={{ fontSize: '0.75rem', color: 'var(--fg)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                      View
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
