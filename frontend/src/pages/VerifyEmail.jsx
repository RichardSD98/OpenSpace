import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CheckCircle, Mail, AlertCircle } from 'lucide-react'
import { supabase } from '../api/supabase'

export default function VerifyEmail() {
  const location = useLocation()
  const email = location.state?.email
  const [status, setStatus] = useState(() => {
    // If we arrived here from registration (no token in URL), show "check inbox"
    const hash = window.location.hash
    return hash && hash.includes('access_token') ? 'verifying' : 'pending'
  })

  useEffect(() => {
    if (status !== 'verifying') return
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'success' : 'expired')
    })
  }, [status])

  return (
    <div className="form-page">
      <div style={{ textAlign: 'center', maxWidth: '420px', width: '100%' }}>

        {status === 'pending' && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <Mail size={24} strokeWidth={1.5} style={{ color: 'var(--fg)' }} />
            </div>
            <h1 className="form-heading" style={{ textAlign: 'center' }}>Check your inbox</h1>
            <p style={{ color: 'var(--grey)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.5rem' }}>
              We sent a verification link to
            </p>
            {email && (
              <p style={{ fontWeight: 500, color: 'var(--fg)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {email}
              </p>
            )}
            <p style={{ color: 'var(--grey)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Click the link in that email to activate your account. The link expires in 24 hours.
            </p>
            <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--grey)', textDecoration: 'underline' }}>
              Back to sign in
            </Link>
          </>
        )}

        {status === 'verifying' && (
          <p style={{ color: 'var(--grey)' }}>Verifying your email…</p>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid #16a34a33', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={24} strokeWidth={1.5} style={{ color: '#16a34a' }} />
            </div>
            <h1 className="form-heading" style={{ textAlign: 'center' }}>Email verified</h1>
            <p style={{ color: 'var(--grey)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Your account is ready. Welcome to OpenSpace.
            </p>
            <Link to="/" className="btn-main">Browse listings</Link>
          </>
        )}

        {status === 'expired' && (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid #dc262633', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <AlertCircle size={24} strokeWidth={1.5} style={{ color: '#dc2626' }} />
            </div>
            <h1 className="form-heading" style={{ textAlign: 'center' }}>Link expired</h1>
            <p style={{ color: 'var(--grey)', marginBottom: '2rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
              This verification link is invalid or has expired. Please register again.
            </p>
            <Link to="/register" className="btn-main">Register again</Link>
          </>
        )}

      </div>
    </div>
  )
}

