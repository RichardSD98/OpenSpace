import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Flash from '../components/Flash'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=70'

const STATUS_LABEL = { pending: 'Pending', accepted: 'Accepted', declined: 'Declined' }
const STATUS_COLOR = { pending: '#b45309', accepted: '#16a34a', declined: '#dc2626' }

export default function MyRequests() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState(null)
  const [flash, setFlash] = useState({ type: '', msg: '' })

  useEffect(() => {
    if (user && user.role !== 'renter') { navigate('/'); return }
    api.get('/view-requests/my')
      .then(r => setRequests(Array.isArray(r.data) ? r.data : []))
      .catch(() => setFlash({ type: 'error', msg: 'Could not load your requests' }))
      .finally(() => setLoading(false))
    // Mark all responded requests as seen (clears the navbar badge)
    api.patch('/view-requests/mark-seen').catch(() => {})
  }, [user, navigate])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this viewing request?')) return
    setCancellingId(id)
    try {
      await api.delete(`/view-requests/${id}`)
      setRequests(rs => rs.filter(r => r.id !== id))
      setFlash({ type: 'success', msg: 'Request cancelled' })
    } catch (err) {
      setFlash({ type: 'error', msg: err.response?.data?.message || 'Could not cancel request' })
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <main className="my-requests-page">
      <h1 className="my-requests-title">
        My viewing requests
      </h1>
      <p className="my-requests-sub">
        Track the spaces you&apos;ve expressed interest in.
      </p>

      {loading && <p style={{ color: 'var(--grey)' }}>Loading…</p>}
      <Flash message={flash.msg} type={flash.type} />

      {!loading && requests.length === 0 && (
        <div className="my-requests-empty">
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>You haven&apos;t sent any viewing requests yet.</p>
          <Link to="/" className="btn-main">Browse listings</Link>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="my-requests-list">
          {requests.map(req => {
            const listing = req.listing
            if (!listing) return null
            const photo = listing.photos?.[0] || PLACEHOLDER

            return (
              <div key={req.id} className="my-request-card">
                <img
                  src={photo}
                  alt={listing.title}
                  className="my-request-img"
                />
                <div className="my-request-info">
                  <p className="my-request-listing-title">{listing.title}</p>
                  <p className="my-request-meta">
                    {listing.neighborhood} · N${listing.rent?.toLocaleString()}/mo · {listing.unitType}
                  </p>
                  {req.message && (
                    <p className="my-request-message">
                      &ldquo;{req.message}&rdquo;
                    </p>
                  )}
                  <p className="my-request-date">
                    Sent {new Date(req.created_at).toLocaleDateString('en-NA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="my-request-actions">
                  <span
                    className="my-request-status"
                    style={{ color: STATUS_COLOR[req.status] || STATUS_COLOR.pending }}
                  >
                    {STATUS_LABEL[req.status] || 'Pending'}
                  </span>
                  <Link to={`/listings/${listing.id}`} className="my-request-link">
                    View listing
                  </Link>
                  {(!req.status || req.status === 'pending') && (
                    <button
                      onClick={() => handleCancel(req.id)}
                      disabled={cancellingId === req.id}
                      className="my-request-cancel"
                    >
                      {cancellingId === req.id ? 'Cancelling…' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
