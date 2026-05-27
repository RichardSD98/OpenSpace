import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ImagePlus, X, Save } from 'lucide-react'
import api from '../api/axios'
import { supabase } from '../api/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import PhoneInput from '../components/PhoneInput'

const NEIGHBORHOODS = [
  'Katutura', 'Khomasdal', 'Klein Windhoek', 'Olympia',
  'Pioneers Park', 'Rocky Crest', 'Hochland Park', 'Eros',
  'Ludwigsdorf', 'Academia', 'Otjomuise', 'Wanaheda',
  'Dorado Park', 'Auasblick', 'Suiderhof',
]

const AMENITIES_OPTIONS = [
  'WiFi', 'Water included', 'Electricity included', 'Parking',
  'Security/Gate', 'Garden', 'Furnished', 'Pet-friendly',
  'Laundry', 'DSTV', 'Air conditioning',
]

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState(null)
  const [newPhotos, setNewPhotos] = useState([])
  const [newPreviews, setNewPreviews] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.get(`/listings/${id}`).then(({ data }) => {
      if (data.landlord?._id !== user?._id) {
        toast.error('Not authorized')
        navigate('/my-listings')
        return
      }
      setForm({
        ...data,
        rent: String(data.rent),
        deposit: String(data.deposit || ''),
        bedrooms: String(data.bedrooms),
        bathrooms: String(data.bathrooms),
        availableFrom: data.availableFrom?.split('T')[0] || '',
      })
    }).catch(() => {
      toast.error('Listing not found')
      navigate('/my-listings')
    })
  }, [id, user, navigate])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleNewPhotos = (e) => {
    const files = Array.from(e.target.files)
    setNewPhotos(p => [...p, ...files])
    setNewPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))])
  }

  const removeExistingPhoto = (url) => set('photos', form.photos.filter(p => p !== url))
  const removeNewPhoto = (i) => {
    setNewPhotos(p => p.filter((_, j) => j !== i))
    setNewPreviews(p => p.filter((_, j) => j !== i))
  }

  const toggleAmenity = (a) => set('amenities',
    form.amenities?.includes(a)
      ? form.amenities.filter(x => x !== a)
      : [...(form.amenities || []), a]
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let uploadedUrls = []
      if (newPhotos.length > 0) {
        uploadedUrls = await Promise.all(
          newPhotos.map(async (file) => {
            const ext = file.name.split('.').pop()
            const path = `${user._id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
            const { error } = await supabase.storage
              .from('listing-photos')
              .upload(path, file, { contentType: file.type })
            if (error) throw new Error(`Upload failed: ${error.message}`)
            const { data: { publicUrl } } = supabase.storage
              .from('listing-photos')
              .getPublicUrl(path)
            return publicUrl
          })
        )
      }
      const payload = {
        ...form,
        rent: Number(form.rent),
        deposit: Number(form.deposit) || 0,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        photos: [...(form.photos || []), ...uploadedUrls],
      }
      await api.put(`/listings/${id}`, payload)
      toast.success('Listing updated!')
      navigate(`/listings/${id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (!form) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span style={{ color: 'var(--grey)', fontSize: '0.85rem', fontWeight: 300 }}>Loading…</span>
      </div>
    )
  }

  return (
    <div className="form-page" style={{ alignItems: 'flex-start', paddingTop: '3rem' }}>
      <div className="form-wrap-wide">
        <button onClick={() => navigate(-1)} className="back-link" style={{ marginBottom: '1.5rem' }}>
          ← Back
        </button>
        <h1 className="form-heading">Edit listing</h1>
        <p className="form-sub">Update the details for this listing.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-section-title">Basic information</div>
            <div className="form-field">
              <label className="form-label">Title *</label>
              <input required value={form.title} onChange={e => set('title', e.target.value)} className="form-input" />
            </div>
            <div className="form-field">
              <label className="form-label">Description</label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                className="form-input" style={{ resize: 'vertical' }} />
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Unit type</label>
                <select value={form.unitType} onChange={e => set('unitType', e.target.value)} className="form-input">
                  {[
                    { value: 'apartment', label: 'Apartment' },
                    { value: 'flat', label: 'Flat' },
                    { value: 'single room', label: 'Single Room' },
                    { value: 'studio', label: 'Studio' },
                  ].map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Available from</label>
                <input type="date" value={form.availableFrom} onChange={e => set('availableFrom', e.target.value)} className="form-input" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Pricing</div>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Rent (N$)</label>
                <input type="number" min={0} value={form.rent} onChange={e => set('rent', e.target.value)} className="form-input" />
              </div>
              <div className="form-field">
                <label className="form-label">Deposit (N$)</label>
                <input type="number" min={0} value={form.deposit} onChange={e => set('deposit', e.target.value)} className="form-input" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Location</div>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Neighbourhood</label>
                <select value={form.neighborhood} onChange={e => set('neighborhood', e.target.value)} className="form-input">
                  {NEIGHBORHOODS.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Address</label>
                <input value={form.address || ''} onChange={e => set('address', e.target.value)} className="form-input" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Property details</div>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Bedrooms</label>
                <input type="number" min={0} value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} className="form-input" />
              </div>
              <div className="form-field">
                <label className="form-label">Bathrooms</label>
                <input type="number" min={0} value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} className="form-input" />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Availability</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--fg)' }}>
                <input type="checkbox" checked={form.isAvailable} onChange={e => set('isAvailable', e.target.checked)} />
                Mark as available
              </label>
            </div>
            <div className="form-field">
              <label className="form-label">Amenities</label>
              <div className="amenity-tags">
                {AMENITIES_OPTIONS.map(a => (
                  <button type="button" key={a}
                    className={`amenity-tag${form.amenities?.includes(a) ? ' on' : ''}`}
                    onClick={() => toggleAmenity(a)}>{a}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Contact information</div>
            <div className="form-field">
              <label className="form-label">Contact name</label>
              <input value={form.contactName} onChange={e => set('contactName', e.target.value)} className="form-input" />
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Phone</label>
                <PhoneInput
                  value={form.contactPhone}
                  onChange={val => set('contactPhone', val)}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Email</label>
                <input type="email" value={form.contactEmail || ''} onChange={e => set('contactEmail', e.target.value)} className="form-input" />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-title">Photos</div>
            {form.photos?.length > 0 && (
              <div className="photo-grid" style={{ marginBottom: '1rem' }}>
                {form.photos.map((url) => (
                  <div key={url} className="photo-thumb">
                    <img src={url} alt="" />
                    <button type="button" className="photo-remove" onClick={() => removeExistingPhoto(url)}>
                      <X size={12} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="photo-upload-zone">
              <ImagePlus size={18} strokeWidth={1.5} style={{ marginBottom: '0.3rem', color: 'var(--grey)' }} />
              <p className="photo-upload-hint">Add more photos</p>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleNewPhotos} />
            </label>
            {newPreviews.length > 0 && (
              <div className="photo-grid" style={{ marginTop: '0.75rem' }}>
                {newPreviews.map((src, i) => (
                  <div key={i} className="photo-thumb">
                    <img src={src} alt="" />
                    <button type="button" className="photo-remove" onClick={() => removeNewPhoto(i)}>
                      <X size={12} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-main"
            style={{ width: '100%', padding: '0.9rem 1.6rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            {submitting ? 'Saving…' : <><Save size={15} strokeWidth={1.8} /> Save changes</>}
          </button>
        </form>
      </div>
    </div>
  )
}