import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span style={{ color: 'var(--grey)', fontSize: '0.85rem', fontWeight: 300 }}>Loading…</span>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  return children
}
