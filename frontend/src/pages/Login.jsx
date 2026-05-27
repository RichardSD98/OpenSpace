import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      toast.error(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <div className="form-wrap">
        <h1 className="form-heading">Sign in</h1>
        <p className="form-sub">Welcome back to OpenSpace.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Email address</label>
            <input required type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" />
          </div>
          <div className="form-field">
            <label className="form-label">Password</label>
            <input required type="password" placeholder="Your password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} className="form-input" />
          </div>
          <button type="submit" disabled={loading} className="btn-main"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem 1.6rem' }}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--grey)', textAlign: 'center' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: 'var(--fg)', fontWeight: 500 }}>Create account</Link>
        </p>
      </div>
    </div>
  )
}
