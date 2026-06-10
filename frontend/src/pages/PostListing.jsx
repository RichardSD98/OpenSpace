import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, ImagePlus } from 'lucide-react'
import api from '../api/axios'
import { supabase } from '../api/supabase'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import PhoneInput from '../components/PhoneInput'
import { NEIGHBORHOODS } from '../lib/neighborhoods'
import SelectDropdown from '../components/SelectDropdown'
import DatePicker from '../components/DatePicker'

const AMENITIES_OPTIONS = [
  'WiFi', 'Water included', 'Electricity included', 'Parking',
  'Security/Gate', 'Garden', 'Furnished', 'Pet-friendly',
  'Laundry', 'DSTV', 'Air conditioning',
]

const INITIAL = {
  title: '', description: '', unitType: 'apartment',
  rent: '', deposit: '', neighborhood: '', address: '',
  bedrooms: 1, bathrooms: 1,
  availableFrom: '', contactName: '', contactPhone: '', contactEmail: '',
  amenities: [], isAvailable: true,
}

export default function PostListing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState(INITIAL)
  const [photos, setPhotos] = useState([])
  const [previews, setPreviews] = useState([])
  const [submitting, setSubmitting] = useState(false)

  // Role guard — only listers can post
  useEffect(() => {
    if (user && user.role !== 'lister') {
      toast.error('Only listers can post listings')
      navigate('/')
    }
  }, [user, navigate])

  // Pre-fill contact fields from logged-in user's profile
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        contactName: user.name || '',
        contactPhone: user.phone || '',
        contactEmail: user.email || '',
      }))
    }
  }, [user])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    if (photos.length + files.length > 6) { toast.error('Maximum 6 photos'); return }
    setPhotos(p => [...p, ...files])
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))])
  }

  const removePhoto = (idx) => {
    setPhotos(p => p.filter((_, i) => i !== idx))
    setPreviews(p => p.filter((_, i) => i !== idx))
  }

  const toggleAmenity = (a) => set('amenities',
    form.amenities.includes(a)
      ? form.amenities.filter(x => x !== a)
      : [...form.amenities, a]
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.neighborhood) { toast.error('Please select a neighbourhood'); return }
    setSubmitting(true)
    try {
      // Upload photos directly to Supabase Storage
      let photoUrls = []
      if (photos.length > 0) {
        const uploads = await Promise.all(
          photos.map(async (file) => {
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
        photoUrls = uploads
      }
      const payload = {
        ...form,
        rent: Number(form.rent),
        deposit: Number(form.deposit) || 0,
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        photos: photoUrls,
      }
      const { data } = await api.post('/listings', payload)
      toast.success('Listing posted!')
      navigate(`/listings/${data._id}`)
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to post listing')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-page" style={{ alignItems: 'flex-start', paddingTop: '3rem' }}>
      <div className="form-wrap-wide">
        <h1 className="form-heading">Post a listing</h1>
        <p className="form-sub">Fill in the details to list your property on OpenSpace.</p>

        <form onSubmit={handleSubmit}>
          {/* Basic info */}
          <div className="form-section">
            <div className="form-section-title">Basic information</div>
            <div className="form-field">
              <label className="form-label">Listing title *</label>
              <input required placeholder="e.g. Spacious 2-bed apartment in Olympia" value={form.title}
                onChange={e => set('title', e.target.value)} className="form-input" />
            </div>
            <div className="form-field">
              <label className="form-label">Description</label>
              <textarea rows={4} placeholder="Describe the property, what's included, rules…"
                value={form.description} onChange={e => set('description', e.target.value)}
                className="form-input" style={{ resize: 'vertical' }} />
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Unit type *</label>
                <SelectDropdown
                  required
                  value={form.unitType}
                  onChange={v => set('unitType', v)}
                  options={[
                    { value: 'apartment', label: 'Apartment' },
                    { value: 'flat', label: 'Flat' },
                    { value: 'single room', label: 'Single Room' },
                    { value: 'studio', label: 'Studio' },
                  ]}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Available from *</label>
                <DatePicker
                  required
                  value={form.availableFrom}
                  onChange={v => set('availableFrom', v)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="form-section">
            <div className="form-section-title">Pricing</div>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Monthly rent (N$) *</label>
                <input required type="number" min={0} placeholder="e.g. 5500" value={form.rent}
                  onChange={e => set('rent', e.target.value)} className="form-input" />
              </div>
              <div className="form-field">
                <label className="form-label">Deposit (N$)</label>
                <input type="number" min={0} placeholder="e.g. 5500" value={form.deposit}
                  onChange={e => set('deposit', e.target.value)} className="form-input" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="form-section">
            <div className="form-section-title">Location</div>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Neighbourhood *</label>
                <SelectDropdown
                  required
                  searchable
                  value={form.neighborhood}
                  onChange={v => set('neighborhood', v)}
                  options={NEIGHBORHOODS}
                  placeholder="Select neighbourhood"
                />
              </div>
              <div className="form-field">
                <label className="form-label">Street address</label>
                <input placeholder="e.g. 12 Independence Ave" value={form.address}
                  onChange={e => set('address', e.target.value)} className="form-input" />
              </div>
            </div>
          </div>

          {/* Property details */}
          <div className="form-section">
            <div className="form-section-title">Property details</div>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Bedrooms</label>
                <input type="number" min={0} max={20} value={form.bedrooms}
                  onChange={e => set('bedrooms', e.target.value)} className="form-input" />
              </div>
              <div className="form-field">
                <label className="form-label">Bathrooms</label>
                <input type="number" min={0} max={10} value={form.bathrooms}
                  onChange={e => set('bathrooms', e.target.value)} className="form-input" />
              </div>
            </div>
            <div className="form-field">
              <label className="form-label">Amenities</label>
              <div className="amenity-tags">
                {AMENITIES_OPTIONS.map(a => (
                  <button type="button" key={a}
                    className={`amenity-tag${form.amenities.includes(a) ? ' on' : ''}`}
                    onClick={() => toggleAmenity(a)}>{a}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="form-section">
            <div className="form-section-title">Contact information</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--grey)', marginBottom: '1rem', marginTop: '-0.5rem' }}>
              Pre-filled from your profile. You can edit if needed.
            </p>
            <div className="form-field">
              <label className="form-label">Contact name *</label>
              <input required placeholder="Your full name" value={form.contactName}
                onChange={e => set('contactName', e.target.value)} className="form-input" />
            </div>
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Phone *</label>
                <PhoneInput
                  required
                  value={form.contactPhone}
                  onChange={val => set('contactPhone', val)}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Email</label>
                <input type="email" placeholder="you@example.com" value={form.contactEmail}
                  onChange={e => set('contactEmail', e.target.value)} className="form-input" />
              </div>
            </div>
          </div>

          {/* Photos */}
          <div className="form-section">
            <div className="form-section-title">Photos</div>
            <label className="photo-upload-zone">
              <ImagePlus size={20} strokeWidth={1.5} style={{ marginBottom: '0.4rem', color: 'var(--grey)' }} />
              <p className="photo-upload-hint" style={{ marginBottom: '0.25rem' }}>Click to upload photos</p>
              <p className="photo-upload-hint" style={{ fontSize: '0.75rem' }}>JPEG, PNG — max 5MB each, up to 6 photos</p>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoChange} />
            </label>
            {previews.length > 0 && (
              <div className="photo-grid">
                {previews.map((src, i) => (
                  <div key={i} className="photo-thumb">
                    <img src={src} alt="" />
                    <button type="button" className="photo-remove" onClick={() => removePhoto(i)}>
                      <X size={12} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting} className="btn-main"
            style={{ width: '100%', padding: '0.9rem 1.6rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            {submitting ? 'Posting…' : <><Upload size={15} strokeWidth={1.8} /> Post listing</>}
          </button>
        </form>
      </div>
    </div>
  )
}