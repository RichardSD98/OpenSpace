import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Phone, Mail, MessageCircle } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { SkeletonDetail } from '../components/Skeleton'

const PLACEHOLDER = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'

function Lightbox({ photos, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onPrev, onNext])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Prev */}
      {photos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); onPrev() }}
          style={{
            position: 'absolute', left: '1.25rem',
            background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
            fontSize: '1.5rem', width: '2.5rem', height: '2.5rem', borderRadius: '50%',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >‹</button>
      )}

      <img
        src={photos[index]}
        onClick={e => e.stopPropagation()}
        alt=""
        onError={e => { e.target.src = PLACEHOLDER }}
        style={{
          maxWidth: '90vw', maxHeight: '88vh',
          objectFit: 'contain', borderRadius: '2px',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
        }}
      />

      {/* Next */}
      {photos.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); onNext() }}
          style={{
            position: 'absolute', right: '1.25rem',
            background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
            fontSize: '1.5rem', width: '2.5rem', height: '2.5rem', borderRadius: '50%',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >›</button>
      )}

      {/* Counter */}
      {photos.length > 1 && (
        <span style={{
          position: 'absolute', bottom: '1.25rem',
          color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', letterSpacing: '0.06em',
        }}>{index + 1} / {photos.length}</span>
      )}

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '1rem', right: '1.25rem',
          background: 'none', border: 'none', color: '#fff',
          fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1,
        }}
      >✕</button>
    </div>
  )
}

export default function ListingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activePhoto, setActivePhoto] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [requested, setRequested] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(({ data }) => setListing(data))
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false))
  }, [id])

  const photoCount = listing?.photos?.length || 1
  const lightboxPrev = useCallback(() => setActivePhoto(i => (i - 1 + photoCount) % photoCount), [photoCount])
  const lightboxNext = useCallback(() => setActivePhoto(i => (i + 1) % photoCount), [photoCount])

  const handleRequestView = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error('Please login to request a viewing')
      navigate('/login')
      return
    }
    if (user.role === 'lister') {
      toast.error('Switch to a renter account to request viewings')
      return
    }
    setRequesting(true)
    try {
      await api.post(`/view-requests/${id}`, { message })
      setRequested(true)
      toast.success('Viewing request sent!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request')
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="detail-page">
        <SkeletonDetail />
      </div>
    )
  }

  if (!listing) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
        <p style={{ color: 'var(--grey)' }}>Listing not found.</p>
        <Link to="/" className="back-link" style={{ marginTop: '1rem', display: 'inline-block' }}>← Browse listings</Link>
      </div>
    )
  }

  const photos = listing.photos?.length ? listing.photos : [PLACEHOLDER]
  const isOwner = user?._id === listing.landlord?._id

  return (
    <div className="detail-page">
      {lightbox && (
        <Lightbox
          photos={photos}
          index={activePhoto}
          onClose={() => setLightbox(false)}
          onPrev={lightboxPrev}
          onNext={lightboxNext}
        />
      )}
      <button onClick={() => navigate(-1)} className="back-link">← Back to listings</button>

      <div className="detail-grid">
        {/* Left column */}
        <div className="detail-main">
          {/* Photo gallery */}
          <div className="detail-gallery">
            <img
              src={photos[activePhoto]}
              alt={listing.title}
              className="detail-main-photo"
              onClick={() => setLightbox(true)}
              onError={e => { e.target.src = PLACEHOLDER }}
              style={{ cursor: 'zoom-in' }}
            />
            {photos.length > 1 && (
              <div className="detail-thumbs">
                {photos.map((p, i) => (
                  <button key={i} onClick={() => setActivePhoto(i)}
                    className={`detail-thumb${i === activePhoto ? ' active' : ''}`}>
                    <img src={p} alt="" onError={e => { e.target.src = PLACEHOLDER }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title block */}
          <div className="detail-title-block">
            <div className="detail-badges">
              <span className="listing-type-pill">{listing.unitType}</span>
              <span className={`v-badge${listing.isAvailable ? '' : ' taken'}`}>
                {listing.isAvailable ? 'Available' : 'Not available'}
              </span>
            </div>
            <h1 className="detail-title">{listing.title}</h1>
            <p className="detail-location">📍 {listing.neighborhood}, Windhoek{listing.address ? ` — ${listing.address}` : ''}</p>
          </div>

          {/* Stats */}
          <div className="detail-stats">
            <div className="detail-stat">
              <span className="detail-stat-val">{listing.bedrooms}</span>
              <span className="detail-stat-label">Bedrooms</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-val">{listing.bathrooms}</span>
              <span className="detail-stat-label">Bathrooms</span>
            </div>
            <div className="detail-stat">
              <span className="detail-stat-val" style={{ fontSize: '0.85rem' }}>
                {new Date(listing.availableFrom).toLocaleDateString('en-NA', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              <span className="detail-stat-label">Available from</span>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="detail-section">
              <h2 className="detail-section-title">About this listing</h2>
              <p className="detail-description">{listing.description}</p>
            </div>
          )}

          {/* Amenities */}
          {listing.amenities?.length > 0 && (
            <div className="detail-section">
              <h2 className="detail-section-title">Amenities</h2>
              <div className="detail-amenities">
                {listing.amenities.map(a => (
                  <span key={a} className="detail-amenity">✓ {a}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <aside className="detail-sidebar">
          <div className="detail-price-card">
            <p className="detail-price">N${listing.rent.toLocaleString()}<span>/mo</span></p>
            {listing.deposit > 0 && (
              <p className="detail-deposit">Deposit: N${listing.deposit.toLocaleString()}</p>
            )}

            {/* Contact section — visible to everyone */}
            <div className="detail-contact" style={{ marginTop: '1.25rem' }}>
              <h3 className="detail-contact-title">Contact landlord</h3>
              <p className="detail-contact-name">{listing.contactName}</p>
              <a href={`tel:${listing.contactPhone}`} className="detail-contact-link">
                <Phone size={14} strokeWidth={1.8} style={{ marginRight: '0.4rem', flexShrink: 0 }} />
                {listing.contactPhone}
              </a>
              {listing.contactEmail && (
                <a href={`mailto:${listing.contactEmail}`} className="detail-contact-link">
                  <Mail size={14} strokeWidth={1.8} style={{ marginRight: '0.4rem', flexShrink: 0 }} />
                  {listing.contactEmail}
                </a>
              )}
              {listing.contactPhone && (
                <a
                  href={`https://wa.me/${listing.contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm interested in your listing: ${listing.title}`)}`}
                  className="btn-ghost"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.82rem' }}
                >
                  <MessageCircle size={14} strokeWidth={1.8} />
                  Message on WhatsApp
                </a>
              )}
            </div>

            {/* Viewing request — divider */}
            <div style={{ borderTop: '1px solid var(--border)', margin: '1.25rem 0' }} />

            {isOwner ? (
              <Link to={`/edit-listing/${id}`} className="btn-main" style={{ display: 'block', textAlign: 'center' }}>
                Edit listing
              </Link>
            ) : requested ? (
              <div className="detail-requested">✓ Viewing request sent</div>
            ) : user && user.role !== 'lister' ? (
              <form onSubmit={handleRequestView} className="detail-request-form">
                <p style={{ fontSize: '0.75rem', color: 'var(--grey)', marginBottom: '0.6rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  Or send a viewing request
                </p>
                <textarea
                  rows={3}
                  placeholder="Hi, I'd like to arrange a viewing…"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="form-input"
                  style={{ resize: 'vertical', marginBottom: '0.75rem' }}
                  disabled={!listing.isAvailable}
                />
                <button
                  type="submit"
                  disabled={requesting || !listing.isAvailable}
                  className="btn-main"
                  style={{ width: '100%', opacity: listing.isAvailable ? 1 : 0.45 }}
                >
                  {!listing.isAvailable ? 'Not available' : requesting ? 'Sending…' : 'Send viewing request'}
                </button>
              </form>
            ) : !user ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--grey)', marginBottom: '0.75rem', lineHeight: 1.6 }}>
                  <Link to="/register" style={{ color: 'var(--fg)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Sign up</Link>{' '}
                  or{' '}
                  <Link to="/login" style={{ color: 'var(--fg)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>log in</Link>{' '}
                  to send a viewing request directly to this landlord.
                </p>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  )
}
