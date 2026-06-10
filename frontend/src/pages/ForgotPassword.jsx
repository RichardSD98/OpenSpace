import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import TurnstileCaptcha from '../components/TurnstileCaptcha'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const siteKeyPresent = !!import.meta.env.VITE_TURNSTILE_SITE_KEY

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { data } = await api.post('/auth/forgot-password', {
        email,
        captchaToken,
      })
      setSuccess(data?.message || 'If an account exists, reset instructions have been sent.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <div className="form-wrap">
        <h1 className="form-heading">Forgot password</h1>
        <p className="form-sub">Enter your email and we will send a secure reset link if an account exists.</p>

        {error && <div className="form-error-banner">{error}</div>}
        {success && (
          <div
            className="form-error-banner"
            style={{
              background: 'rgba(45,90,61,0.08)',
              borderColor: 'var(--green-border)',
              color: 'var(--green)',
            }}
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label className="form-label">Email address</label>
            <input
              required
              type="email"
              placeholder="you@example.com"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <TurnstileCaptcha
            onToken={setCaptchaToken}
            onError={(msg) => setError(msg)}
          />

          <button
            type="submit"
            disabled={loading || (siteKeyPresent && !captchaToken)}
            className="btn-main"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem 1.6rem' }}
          >
            {loading ? 'Sending reset link…' : 'Send reset link'}
          </button>
        </form>

        <p style={{ marginTop: '1.2rem', fontSize: '0.83rem', color: 'var(--grey)', lineHeight: 1.65 }}>
          Tip: use a password with at least 12 characters, uppercase and lowercase letters, a number, and a symbol.
        </p>

        <p style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--grey)', textAlign: 'center' }}>
          Back to{' '}
          <Link to="/login" style={{ color: 'var(--fg)', fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
