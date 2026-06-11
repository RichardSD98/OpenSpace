import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Flash from '../components/Flash'
import PhoneInput from '../components/PhoneInput'

export default function ProfileSettings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState('')
  const [flash, setFlash] = useState({ type: '', msg: '' })
  const [deleteFlash, setDeleteFlash] = useState({ type: '', msg: '' })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFlash({ type: '', msg: '' })
    try {
      await api.put('/auth/profile', { name: form.name, phone: form.phone })
      setFlash({ type: 'success', msg: 'Profile updated' })
    } catch (err) {
      setFlash({ type: 'error', msg: err.response?.data?.message || 'Could not update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirmDelete !== user?.email) {
      setDeleteFlash({ type: 'error', msg: 'Email confirmation does not match' })
      return
    }
    setDeleting(true)
    try {
      await api.delete('/auth/account')
      logout()
      navigate('/')
    } catch (err) {
      setDeleteFlash({ type: 'error', msg: err.response?.data?.message || 'Could not delete account' })
      setDeleting(false)
    }
  }

  return (
    <div className="form-page" style={{ alignItems: 'flex-start', paddingTop: '3.5rem' }}>
      <div className="form-wrap">
        <h1 className="form-heading">Profile settings</h1>
        <p className="form-sub">Update your display name and phone number.</p>
        <Flash message={flash.msg} type={flash.type} />

        <form onSubmit={handleSave}>
          <div className="form-field">
            <label className="form-label">Full name</label>
            <input
              required
              className="form-input"
              placeholder="Your full name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Phone number</label>
            <PhoneInput value={form.phone} onChange={v => set('phone', v)} />
          </div>

          <div className="form-field">
            <label className="form-label">Email address</label>
            <input
              disabled
              className="form-input"
              value={user?.email || ''}
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
            <p style={{ fontSize: '0.73rem', color: 'var(--grey)', marginTop: '0.4rem' }}>
              Email cannot be changed here. To reset your password,{' '}
              <a href="/forgot-password" style={{ color: 'var(--fg)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                use the password reset page
              </a>.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-main"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.25rem' }}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#dc2626', marginBottom: '0.5rem', letterSpacing: '0.02em' }}>
            Delete account
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--grey)', marginBottom: '1.25rem', lineHeight: 1.65 }}>
            This permanently deletes your account, listings, and all data. This action cannot be undone and complies with GDPR right to erasure.
          </p>

          <div className="form-field">
            <label className="form-label">Type your email to confirm</label>
            <input
              className="form-input"
              placeholder={user?.email || 'your@email.com'}
              value={confirmDelete}
              onChange={e => setConfirmDelete(e.target.value)}
            />
          </div>

          <button
            type="button"
            disabled={deleting || confirmDelete !== user?.email}
            onClick={handleDeleteAccount}
            style={{
              width: '100%', padding: '0.85rem', marginTop: '0.25rem',
              background: confirmDelete === user?.email ? '#dc2626' : 'var(--bg-muted)',
              color: confirmDelete === user?.email ? '#fff' : 'var(--grey)',
              border: '1px solid var(--border)', borderRadius: '2px',
              fontSize: '0.85rem', fontWeight: 500, cursor: confirmDelete === user?.email ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {deleting ? 'Deleting account…' : 'Permanently delete my account'}
          </button>
          <Flash message={deleteFlash.msg} type={deleteFlash.type} style={{ marginTop: '0.75rem', marginBottom: 0 }} />
        </div>
      </div>
    </div>
  )
}
