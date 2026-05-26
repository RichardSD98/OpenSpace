import { useEffect, useRef } from 'react'

export function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.15 }
    )
    const els = ref.current.querySelectorAll('.reveal, .reveal-left, .safety-item')
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  return ref
}
