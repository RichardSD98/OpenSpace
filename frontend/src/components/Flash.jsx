/**
 * Inline flash message — replaces toast notifications.
 * type: 'error' | 'success' | 'info'
 */
export default function Flash({ message, type = 'error', style = {} }) {
  if (!message) return null

  const styles = {
    error: {
      background: '#fef2f2',
      border: '1px solid #fecaca',
      color: '#dc2626',
    },
    success: {
      background: 'rgba(45,90,61,0.07)',
      border: '1px solid var(--green-border)',
      color: 'var(--green)',
    },
    info: {
      background: 'var(--bg-muted)',
      border: '1px solid var(--border)',
      color: 'var(--grey)',
    },
  }

  return (
    <div style={{
      ...styles[type] || styles.error,
      fontSize: '0.85rem',
      padding: '0.75rem 1rem',
      borderRadius: '2px',
      marginBottom: '1.25rem',
      lineHeight: 1.55,
      ...style,
    }}>
      {message}
    </div>
  )
}
