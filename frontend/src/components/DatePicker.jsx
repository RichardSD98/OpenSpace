import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function parseDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function toISODate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDisplay(str) {
  const d = parseDate(str)
  if (!d) return ''
  return d.toLocaleDateString('en-NA', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  // Returns 0=Mon … 6=Sun (ISO week)
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

export default function DatePicker({ value, onChange, min, required = false }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  const today = new Date()
  const minDate = parseDate(min) || today

  const initialDate = parseDate(value) || minDate
  const [viewYear, setViewYear] = useState(initialDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth())

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      const d = parseDate(value) || minDate
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const handleDay = (day) => {
    const selected = new Date(viewYear, viewMonth, day)
    if (selected < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return
    onChange(toISODate(selected))
    setOpen(false)
  }

  const selectedDate = parseDate(value)
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  // Can we go back?
  const canPrev = viewYear > minDate.getFullYear() ||
    (viewYear === minDate.getFullYear() && viewMonth > minDate.getMonth())

  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  )
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {required && (
        <input
          type="hidden"
          required
          value={value || ''}
          onChange={() => {}}
        />
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid var(--border)',
          background: 'var(--bg)',
          color: value ? 'var(--fg)' : 'var(--grey)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.9rem',
          fontWeight: 400,
          padding: '0.75rem 1rem',
          borderRadius: '2px',
          cursor: 'pointer',
          textAlign: 'left',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          borderColor: open ? 'var(--fg)' : 'var(--border)',
        }}
      >
        <span>{value ? formatDisplay(value) : 'Select date…'}</span>
        <ChevronDown
          size={14}
          strokeWidth={1.8}
          style={{
            flexShrink: 0,
            marginLeft: '0.5rem',
            color: 'var(--grey)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        />
      </button>

      {/* Calendar panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          zIndex: 200,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '2px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          padding: '1rem',
          minWidth: '272px',
          userSelect: 'none',
        }}>
          {/* Month nav */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: '0.85rem',
          }}>
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canPrev}
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: '2px', padding: '0.3rem',
                cursor: canPrev ? 'pointer' : 'not-allowed',
                color: canPrev ? 'var(--fg)' : 'var(--border)',
                display: 'flex', alignItems: 'center',
              }}
            >
              <ChevronLeft size={14} strokeWidth={1.8} />
            </button>

            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.88rem', fontWeight: 500, color: 'var(--fg)',
              letterSpacing: '0',
            }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              style={{
                background: 'none', border: '1px solid var(--border)',
                borderRadius: '2px', padding: '0.3rem',
                cursor: 'pointer', color: 'var(--fg)',
                display: 'flex', alignItems: 'center',
              }}
            >
              <ChevronRight size={14} strokeWidth={1.8} />
            </button>
          </div>

          {/* Day of week headers */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
            marginBottom: '0.35rem',
          }}>
            {DOW.map(d => (
              <span key={d} style={{
                textAlign: 'center', fontSize: '0.65rem',
                fontWeight: 600, letterSpacing: '0.07em',
                textTransform: 'uppercase', color: 'var(--grey)',
                padding: '0.2rem 0',
              }}>
                {d}
              </span>
            ))}
          </div>

          {/* Day grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {cells.map((day, idx) => {
              if (day === null) return <span key={`e-${idx}`} />

              const cellDate = new Date(viewYear, viewMonth, day)
              const minCompare = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
              const isDisabled = cellDate < minCompare
              const isSelected = selectedDate &&
                cellDate.getFullYear() === selectedDate.getFullYear() &&
                cellDate.getMonth() === selectedDate.getMonth() &&
                cellDate.getDate() === selectedDate.getDate()
              const isToday =
                cellDate.getFullYear() === today.getFullYear() &&
                cellDate.getMonth() === today.getMonth() &&
                cellDate.getDate() === today.getDate()

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !isDisabled && handleDay(day)}
                  style={{
                    border: isToday && !isSelected
                      ? '1px solid var(--border)'
                      : '1px solid transparent',
                    borderRadius: '2px',
                    padding: '0.3rem 0',
                    fontSize: '0.8rem',
                    fontWeight: isSelected ? 600 : 400,
                    fontFamily: 'Inter, sans-serif',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    background: isSelected ? 'var(--fg)' : 'transparent',
                    color: isDisabled
                      ? 'var(--border)'
                      : isSelected
                        ? 'var(--bg)'
                        : 'var(--fg)',
                    textAlign: 'center',
                    transition: 'background 0.1s ease',
                  }}
                  onMouseEnter={e => {
                    if (!isDisabled && !isSelected)
                      e.currentTarget.style.background = 'var(--bg-muted)'
                  }}
                  onMouseLeave={e => {
                    if (!isSelected)
                      e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
