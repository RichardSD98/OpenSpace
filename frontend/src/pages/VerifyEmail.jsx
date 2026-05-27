import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('No verification token found.')
      return
    }
    api.get(`/auth/verify-email?token=${token}`)
      .then(r => {
        setStatus('success')
        setMessage(r.data.message)
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Verification failed.')
      })
  }, [searchParams])

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '420px' }}>
        {status === 'verifying' && (
          <p style={{ color: 'var(--grey)' }}>Verifying your email…</p>
        )}
        {status === 'success' && (
          <>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', marginBottom: '0.75rem' }}>
              ✓ Email verified
            </h1>
            <p style={{ color: 'var(--grey)', marginBottom: '1.5rem' }}>{message}</p>
            <Link to="/login" className="btn-main">Log in to OpenSpace</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2rem', marginBottom: '0.75rem' }}>
              Link expired
            </h1>
            <p style={{ color: 'var(--grey)', marginBottom: '1.5rem' }}>{message}</p>
            <Link to="/register" className="btn-main">Register again</Link>
          </>
        )}
      </div>
    </div>
  )
}
