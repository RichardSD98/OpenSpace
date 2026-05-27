import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import PhoneInput from '../components/PhoneInput'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'renter' })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(form)
      toast.success('Account created! Check your email to verify your address.')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <div className="form-wrap">
        <h1 className="form-heading">Create account</h1>
        <p className="form-sub">Join OpenSpace — find or list rentals in Windhoek.</p>

        <div className="role-btns">
          <button
            type="button"
            className={`role-btn${form.role === 'renter' ? ' active' : ''}`}
            onClick={() => set('role', 'renter')}
          >
            I&apos;m a renter
          </button>
          <button
            type="button"
            className={`role-btn${form.role === 'lister' ? ' active' : ''}`}
            onClick={() => set('role', 'lister')}
          >
            I want to list
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Full name</label>
            <input
              required
              type="text"
              placeholder="John Shilongo"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Email address</label>
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Phone number</label>
            <PhoneInput
              value={form.phone}
              onChange={(val) => set('phone', val)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              required
              type="password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-main"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem 1.6rem' }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--grey)', textAlign: 'center' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--fg)', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
