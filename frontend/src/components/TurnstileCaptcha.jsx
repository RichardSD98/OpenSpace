import { useEffect, useRef } from 'react'

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY

// Keep latest callback refs so the effect never needs to re-run when parent re-renders

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-turnstile="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load CAPTCHA script')))
      return
    }

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.turnstile = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load CAPTCHA script'))
    document.head.appendChild(script)
  })
}

export default function TurnstileCaptcha({ onToken, onError }) {
  const containerRef = useRef(null)
  const widgetIdRef = useRef(null)
  // Stable refs so the effect never re-runs when the parent re-renders
  const onTokenRef = useRef(onToken)
  const onErrorRef = useRef(onError)
  useEffect(() => { onTokenRef.current = onToken }, [onToken])
  useEffect(() => { onErrorRef.current = onError }, [onError])

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return undefined

    let cancelled = false

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !window.turnstile || !containerRef.current) return

        if (widgetIdRef.current !== null) {
          window.turnstile.remove(widgetIdRef.current)
          widgetIdRef.current = null
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: 'auto',
          callback: (token) => onTokenRef.current(token),
          'expired-callback': () => onTokenRef.current(''),
          'error-callback': () => {
            onTokenRef.current('')
            onErrorRef.current?.('CAPTCHA verification failed. Please try again.')
          },
        })
      })
      .catch(() => {
        if (!cancelled) {
          onTokenRef.current('')
          onErrorRef.current?.('CAPTCHA could not be initialized. Please refresh and try again.')
        }
      })

    return () => {
      cancelled = true
      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, []) // no deps — callbacks accessed via refs

  if (!SITE_KEY) {
    return (
      <p style={{ fontSize: '0.78rem', color: 'var(--grey)', marginTop: '0.5rem' }}>
        CAPTCHA is disabled in this environment.
      </p>
    )
  }

  return <div ref={containerRef} style={{ marginTop: '0.6rem' }} />
}
