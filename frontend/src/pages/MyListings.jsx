import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&q=80'

export default function MyListings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    api.get('/listings/my/listings')
      .then(({ data }) => setListings(data))
      .catch(() => toast.error('Could not load your listings'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggleAvailability = async (listing) => {
    try {
      const { data } = await api.put(`/listings/${listing._id}`, {
        ...listing,
        isAvailable: !listing.isAvailable,
      })
      setListings(ls => ls.map(l => l._id === data._id ? data : l))
      toast.success(data.isAvailable ? 'Marked as available' : 'Marked as unavailable')
    } catch {
      toast.error('Failed to update availability')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return
    setDeletingId(id)
    try {
      await api.delete(`/listings/${id}`)
      setListings(ls => ls.filter(l => l._id !== id))
      toast.success('Listing deleted')
    } catch {
      toast.error('Failed to delete listing')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span style={{ color: 'var(--grey)', fontSize: '0.85rem', fontWeight: 300 }}>Loading…</span>
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
