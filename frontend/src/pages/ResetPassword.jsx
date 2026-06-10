import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import TurnstileCaptcha from '../components/TurnstileCaptcha'

function readRecoveryTokens() {
  const hash = window.location.hash.replace(/^#/, '')
  const hashParams = new URLSearchParams(hash)
  const searchParams = new URLSearchParams(window.location.search)

  return {
    accessToken: hashParams.get('access_token') || searchParams.get('access_token') || '',
    refreshToken: hashParams.get('refresh_token') || searchParams.get('refresh_token') || '',
  }
}

function getPasswordChecks(password) {
  return [
    { label: 'At least 12 characters', ok: password.length >= 12 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'One number', ok: /[0-9]/.test(password) },
    { label: 'One special character', ok: /[^A-Za-z0-9]/.test(password) },
  ]
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const tokens = useMemo(() => readRecoveryTokens(), [])

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [showCaptcha, setShowCaptcha] = useState(false)

  const checks = useMemo(() => getPasswordChecks(password), [password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!tokens.accessToken || !tokens.refreshToken) {
      setError('Reset link is invalid or expired. Please request a new reset email.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const { data } = await api.post('/auth/reset-password', {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        password,
        captchaToken,
      })
      setSuccess(data?.message || 'Password reset successful. Please sign in again.')
      setTimeout(() => navigate('/login'), 1400)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password. Please request a new link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <div className="form-wrap">
        <h1 className="form-heading">Reset password</h1>
        <p className="form-sub">Set a new strong password to secure your account.</p>

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
            <label className="form-label">New password</label>
            <input
              required
              type="password"
              placeholder="Create a strong password"
              className="form-input"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setShowCaptcha(true) }}
              onFocus={() => setShowCaptcha(true)}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Confirm password</label>
            <input
              required
              type="password"
              placeholder="Confirm your new password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '-0.4rem', marginBottom: '1rem' }}>
            {checks.map((rule) => (
              <p
                key={rule.label}
                style={{
                  fontSize: '0.78rem',
                  margin: '0.2rem 0',
                  color: rule.ok ? 'var(--green)' : 'var(--grey)',
                }}
              >
                {rule.ok ? '✓' : '•'} {rule.label}
              </p>
            ))}
          </div>

          {showCaptcha && (
            <TurnstileCaptcha
              onToken={setCaptchaToken}
              onError={(msg) => setError(msg)}
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-main"
            style={{ width: '100%', marginTop: '1rem', padding: '0.85rem 1.6rem' }}
          >
            {loading ? 'Resetting password…' : 'Reset password'}
          </button>
        </form>

        <p style={{ marginTop: '1.25rem', fontSize: '0.85rem', color: 'var(--grey)', textAlign: 'center' }}>
          Need a new link?{' '}
          <Link to="/forgot-password" style={{ color: 'var(--fg)', fontWeight: 500 }}>
            Request another reset email
          </Link>
        </p>
      </div>
    </div>
  )
}
