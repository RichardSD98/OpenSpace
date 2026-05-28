import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [unverified, setUnverified] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setUnverified(false)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      const msg = err.message || 'Login failed'
      if (msg.includes('verify your email')) {
        setUnverified(true)
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    const { error: resendErr } = await supabase.auth.resend({ type: 'signup', email: form.email })
    setResending(false)
    if (!resendErr) setResent(true)
  }

  return (
    <div className="form-page">
      <div className="form-wrap">
        <h1 className="form-heading">Sign in</h1>
        <p className="form-sub">Welcome back to OpenSpace.</p>

        {error && (
          <div className="form-error-banner">{error}</div>
        )}

        {unverified && (
          <div className="form-error-banner" style={{ borderColor: 'var(--amber, #f59e0b)', background: 'rgba(245,158,11,0.06)' }}>
            <strong>Email not verified.</strong> Please check your inbox and click the verification link before signing in.
            {!resent ? (
              <button
                onClick={handleResend}
                disabled={resending}
                style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--fg)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
              >
                {resending ? 'Sending\u2026' : 'Resend verification email'}
              </button>
            ) : (
              <p style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--grey)' }}>Verification email sent \u2014 check your inbox.</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Email address</label>
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label className="form-label">Password</label>
            <input
              required
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-main"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.85rem 1.6rem' }}
          >
            {loading ? 'Signing in\u2026' : 'Sign in'}
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
