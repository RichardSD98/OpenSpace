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
      await register(form.email, form.password, {
        name: form.name,
        phone: form.phone,
        role: form.role,
      })
      toast.success('Check your email to verify your account!')
      navigate('/verify-email')
    } catch (err) {
      toast.error(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-head">
          <a className="logo" href="/">OpenSpace</a>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-sub">Join OpenSpace to browse or list rentals in Windhoek.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Full name</label>
            <input
              required
              placeholder="Your full name"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Email</label>
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
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label className="form-label">I want to</label>
            <div className="role-toggle">
              <button
                type="button"
                className={`role-btn${form.role === 'renter' ? ' active' : ''}`}
                onClick={() => set('role', 'renter')}
              >
                Find a rental
              </button>
              <button
                type="button"
                className={`role-btn${form.role === 'lister' ? ' active' : ''}`}
                onClick={() => set('role', 'lister')}
              >
                List a property
              </button>
            </div>
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}