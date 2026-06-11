import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Flash from '../components/Flash'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=70'

const STATUS_COLOR = { pending: '#b45309', accepted: '#16a34a', declined: '#dc2626' }
const STATUS_LABEL = { pending: 'Pending', accepted: 'Accepted', declined: 'Declined' }

export default function ViewingRequests() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [flash, setFlash] = useState({ type: '', msg: '' })

  useEffect(() => {
    if (user && user.role !== 'lister') { navigate('/'); return }
    api.get('/view-requests/all')
      .then(r => setRequests(Array.isArray(r.data) ? r.data : []))
      .catch(() => setFlash({ type: 'error', msg: 'Could not load viewing requests' }))
      .finally(() => setLoading(false))
  }, [user, navigate])

  const handleStatus = async (id, status) => {
    setUpdatingId(id)
    try {
      const { data } = await api.patch(`/view-requests/${id}/status`, { status })
      setRequests(rs => rs.map(r => r.id === id ? { ...r, status: data.status } : r))
      setFlash({ type: 'success', msg: status === 'accepted' ? 'Request accepted — renter notified' : 'Request declined — renter notified' })
    } catch (err) {
      setFlash({ type: 'error', msg: err.response?.data?.message || 'Could not update request' })
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const counts = {
    all: requests.length,
    pending: requests.filter(r => r.status === 'pending' || !r.status).length,
    accepted: requests.filter(r => r.status === 'accepted').length,
    declined: requests.filter(r => r.status === 'declined').length,
  }

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.25rem' }}>
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', marginBottom: '0.4rem' }}>
        Viewing requests
      </h1>
      <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
        Manage requests from renters who want to view your properties.
      </p>
      <Flash message={flash.msg} type={flash.type} />

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'accepted', 'declined'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.06em',
              textTransform: 'uppercase', padding: '0.4rem 0.9rem',
              border: '1px solid var(--border)', borderRadius: '2px', cursor: 'pointer',
              background: filter === f ? 'var(--fg)' : 'var(--bg)',
              color: filter === f ? 'var(--bg)' : 'var(--grey)',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {f} ({counts[f]})
          </button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--grey)' }}>Loading…</p>}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--grey)' }}>
          <p>{filter === 'all' ? 'No viewing requests yet.' : `No ${filter} requests.`}</p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(req => {
            const listing = req.listing
            const renter = req.renter
            const photo = listing?.photos?.[0] || PLACEHOLDER
            const status = req.status || 'pending'
            const isPending = status === 'pending'

            return (
              <div key={req.id} style={{
                border: '1px solid var(--border)', borderRadius: '2px',
                background: 'var(--bg)', overflow: 'hidden',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 0 }}>
                  <img src={photo} alt={listing?.title} style={{ width: '80px', height: '80px', objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{listing?.title || 'Listing'}</p>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase', color: STATUS_COLOR[status],
                      }}>
                        {STATUS_LABEL[status]}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--grey)' }}>
                      {listing?.neighborhood} · From{' '}
                      <strong style={{ color: 'var(--fg)' }}>{renter?.name || 'Renter'}</strong>
                      {renter?.phone && <> · {renter.phone}</>}
                    </p>
                    {req.message && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--grey)', fontStyle: 'italic', marginTop: '0.15rem' }}>
                        &ldquo;{req.message}&rdquo;
                      </p>
                    )}
                    <p style={{ fontSize: '0.68rem', color: 'var(--grey)', marginTop: '0.15rem' }}>
                      {new Date(req.created_at).toLocaleDateString('en-NA', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {renter?.email && <> · <a href={`mailto:${renter.email}`} style={{ color: 'var(--grey)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>{renter.email}</a></>}
                    </p>
                  </div>
                </div>

                {isPending && (
                  <div style={{
                    borderTop: '1px solid var(--border)', padding: '0.65rem 1rem',
                    display: 'flex', gap: '0.5rem', justifyContent: 'flex-end',
                  }}>
                    <button
                      onClick={() => handleStatus(req.id, 'declined')}
                      disabled={updatingId === req.id}
                      style={{
                        fontSize: '0.78rem', fontWeight: 500, padding: '0.4rem 1rem',
                        border: '1px solid var(--border)', borderRadius: '2px',
                        background: 'var(--bg)', color: 'var(--grey)', cursor: 'pointer',
                      }}
                    >
                      {updatingId === req.id ? '…' : 'Decline'}
                    </button>
                    <button
                      onClick={() => handleStatus(req.id, 'accepted')}
                      disabled={updatingId === req.id}
                      style={{
                        fontSize: '0.78rem', fontWeight: 500, padding: '0.4rem 1rem',
                        border: 'none', borderRadius: '2px',
                        background: 'var(--fg)', color: 'var(--bg)', cursor: 'pointer',
                      }}
                    >
                      {updatingId === req.id ? '…' : 'Accept'}
                    </button>
                  </div>
                )}

                {!isPending && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '0.5rem 1rem', textAlign: 'right' }}>
                    <Link
                      to={`/listings/${listing?._id}`}
                      style={{ fontSize: '0.75rem', color: 'var(--grey)', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                    >
                      View listing
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
