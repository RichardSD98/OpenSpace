import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=70'

const STATUS_LABEL = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
}

const STATUS_COLOR = {
  pending: '#b45309',
  accepted: '#16a34a',
  declined: '#dc2626',
}

export default function MyRequests() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'renter') {
      toast.error('This page is for renters only')
      navigate('/')
      return
    }
    api.get('/view-requests/my')
      .then(r => setRequests(r.data))
      .catch(() => toast.error('Could not load your requests'))
      .finally(() => setLoading(false))
  }, [user, navigate])

  return (
    <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '0.4rem' }}>
        My viewing requests
      </h1>
      <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Track the spaces you've expressed interest in.
      </p>

      {loading && <p style={{ color: 'var(--grey)' }}>Loading…</p>}

      {!loading && requests.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--grey)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>You haven't sent any viewing requests yet.</p>
          <Link to="/" className="btn-main">Browse listings</Link>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {requests.map(req => {
            const listing = req.listing
            if (!listing) return null
            const photo = listing.photos?.[0] || PLACEHOLDER

            return (
              <div key={req._id} style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr auto',
                gap: '1.25rem',
                alignItems: 'center',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                overflow: 'hidden',
                background: 'var(--bg)',
              }}>
                <img
                  src={photo}
                  alt={listing.title}
                  style={{ width: '100px', height: '80px', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ padding: '0.75rem 0' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{listing.title}</p>
                  <p style={{ fontSize: '0.78rem', color: 'var(--grey)' }}>
                    {listing.neighborhood} · N${listing.rent?.toLocaleString()}/mo · {listing.unitType}
                  </p>
                  {req.message && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--grey)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                      "{req.message}"
                    </p>
                  )}
                  <p style={{ fontSize: '0.7rem', color: 'var(--grey)', marginTop: '0.3rem' }}>
                    Sent {new Date(req.createdAt).toLocaleDateString('en-NA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ padding: '0 1.25rem', textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.6rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: STATUS_COLOR[req.status] || STATUS_COLOR.pending,
                  }}>
                    {STATUS_LABEL[req.status] || 'Pending'}
                  </span>
                  <Link to={`/listings/${listing._id}`} style={{ fontSize: '0.75rem', color: 'var(--fg)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                    View listing
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
