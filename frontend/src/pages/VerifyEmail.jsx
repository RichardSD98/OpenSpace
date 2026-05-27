import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, AlertCircle } from 'lucide-react'
import { supabase } from '../api/supabase'

export default function VerifyEmail() {
  const [status, setStatus] = useState('verifying')

  useEffect(() => {
    // Supabase redirects here after clicking the email link.
    // It automatically handles the token via the URL hash — getSession() picks it up.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? 'success' : 'error')
    })
  }, [])

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '420px' }}>
        {status === 'verifying' && (
          <p style={{ color: 'var(--grey)' }}>Verifying your email…</p>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={40} strokeWidth={1.5} style={{ color: '#16a34a', marginBottom: '0.75rem' }} />
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', marginBottom: '0.75rem' }}>
              Email verified
            </h1>
            <p style={{ color: 'var(--grey)', marginBottom: '1.5rem' }}>Your account is ready. Welcome to OpenSpace.</p>
            <Link to="/" className="btn-main">Browse listings</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle size={40} strokeWidth={1.5} style={{ color: '#dc2626', marginBottom: '0.75rem' }} />
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', marginBottom: '0.75rem' }}>
              Link expired
            </h1>
            <p style={{ color: 'var(--grey)', marginBottom: '1.5rem' }}>This verification link is invalid or has expired.</p>
            <Link to="/register" className="btn-main">Register again</Link>
          </>
        )}
      </div>
    </div>
  )
}
