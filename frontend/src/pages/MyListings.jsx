import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Flash from '../components/Flash'
import { SkeletonListingRow } from '../components/Skeleton'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80'

export default function MyListings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [flash, setFlash] = useState({ type: '', msg: '' })

  useEffect(() => {
  if (user && user.role !== 'lister') {
    navigate('/')
    return
  }
  api.get('/listings/my/listings')
    .then(({ data }) => {
      if (!Array.isArray(data)) {
        console.error('Expected array, got:', typeof data, data)
        const hint = typeof data === 'string' && data.includes('<!DOCTYPE')
          ? ' (received HTML — check VITE_API_URL in Vercel env vars)'
          : ''
        setFlash({ type: 'error', msg: 'Could not load your listings — unexpected response' + hint })
        setListings([])
        return
      }
      setListings(data)
    })
    .catch((err) => setFlash({ type: 'error', msg: err.response?.data?.message || 'Could not load your listings' }))
    .finally(() => setLoading(false))
}, [user, navigate])

  const handleToggleAvailability = async (listing) => {
    try {
      const { data } = await api.put(`/listings/${listing._id}`, {
        ...listing,
        isAvailable: !listing.isAvailable,
      })
      setListings(ls => ls.map(l => l._id === data._id ? data : l))
      setFlash({ type: 'success', msg: data.isAvailable ? 'Marked as available' : 'Marked as unavailable' })
    } catch {
      setFlash({ type: 'error', msg: 'Failed to update availability' })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return
    setDeletingId(id)
    try {
      await api.delete(`/listings/${id}`)
      setListings(ls => ls.filter(l => l._id !== id))
      setFlash({ type: 'success', msg: 'Listing deleted' })
    } catch {
      setFlash({ type: 'error', msg: 'Failed to delete listing' })
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="my-listings-page">
        <div className="my-listings-header">
          <div>
            <div className="my-listings-title" style={{ height: '1.8rem', width: '180px', background: 'var(--bg-muted)', borderRadius: '2px' }} />
          </div>
        </div>
        <div className="my-listings-list">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonListingRow key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="my-listings-page">
      <div className="my-listings-header">
        <div>
          <h1 className="my-listings-title">My listings</h1>
          <p className="my-listings-sub">
            Hi {user?.name?.split(' ')[0]} — {listings.length} listing{listings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/post-listing" className="btn-main">+ New listing</Link>
      </div>
      <Flash message={flash.msg} type={flash.type} />

      {listings.length === 0 ? (
        <div className="my-listings-empty">
          <p className="my-listings-empty-text">No listings yet. Post your first property to get started.</p>
          <Link to="/post-listing" className="btn-main">Post a listing</Link>
        </div>
      ) : (
        <div className="my-listings-list">
          {listings.map(listing => (
            <div key={listing._id} className="my-listing-row">
              <div className="my-listing-thumb">
                <img
                  src={listing.photos?.[0] || PLACEHOLDER}
                  alt={listing.title}
                  onError={e => { e.target.src = PLACEHOLDER }}
                />
                <span className={`v-badge ${listing.isAvailable ? '' : 'taken'}`}>
                  {listing.isAvailable ? 'Available' : 'Taken'}
                </span>
              </div>
              <div className="my-listing-body">
                <div className="my-listing-info">
                  <h2 className="my-listing-title">{listing.title}</h2>
                  <p className="my-listing-meta">
                    {listing.unitType} · {listing.neighborhood} · {listing.bedrooms} bed
                  </p>
                  <p className="my-listing-price">N${listing.rent.toLocaleString()}<span>/mo</span></p>
                  <p className="my-listing-date">
                    Posted {new Date(listing.createdAt).toLocaleDateString('en-NA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="my-listing-actions">
                  <Link to={`/listings/${listing._id}`} className="action-btn">View</Link>
                  <Link to={`/edit-listing/${listing._id}`} className="action-btn">Edit</Link>
                  <button className="action-btn" onClick={() => handleToggleAvailability(listing)}>
                    {listing.isAvailable ? 'Mark taken' : 'Mark available'}
                  </button>
                  <button
                    className="action-btn danger"
                    onClick={() => handleDelete(listing._id)}
                    disabled={deletingId === listing._id}
                  >
                    {deletingId === listing._id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
