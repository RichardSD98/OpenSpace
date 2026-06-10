import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Search } from 'lucide-react'

export default function SelectDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  searchable = false,
  required = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const containerRef = useRef(null)
  const searchRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus search when opened
  useEffect(() => {
    if (open && searchable && searchRef.current) {
      searchRef.current.focus()
    }
  }, [open, searchable])

  const displayed = searchable && query.trim()
    ? options.filter(o => {
        const label = typeof o === 'string' ? o : o.label
        return label.toLowerCase().includes(query.toLowerCase())
      })
    : options

  const selectedLabel = (() => {
    if (!value) return null
    const match = options.find(o => (typeof o === 'string' ? o : o.value) === value)
    return match ? (typeof match === 'string' ? match : match.label) : value
  })()

  const handleSelect = (opt) => {
    const val = typeof opt === 'string' ? opt : opt.value
    onChange(val)
    setOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); setQuery('') }
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }} onKeyDown={handleKeyDown}>
      {/* Hidden native select for form validation */}
      {required && (
        <select
          required={required}
          value={value}
          onChange={() => {}}
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: 'absolute', opacity: 0, height: 0, width: 0,
            top: 0, left: 0, pointerEvents: 'none',
          }}
        >
          <option value="" />
          {options.map(o => {
            const v = typeof o === 'string' ? o : o.value
            return <option key={v} value={v}>{v}</option>
          })}
        </select>
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
          color: selectedLabel ? 'var(--fg)' : 'var(--grey)',
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
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedLabel || placeholder}
        </span>
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

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 200,
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '2px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          maxHeight: '260px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {searchable && (
            <div style={{
              padding: '0.5rem 0.75rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flexShrink: 0,
            }}>
              <Search size={13} strokeWidth={1.8} style={{ color: 'var(--grey)', flexShrink: 0 }} />
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search…"
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  background: 'transparent', fontFamily: 'Inter, sans-serif',
                  fontSize: '0.82rem', color: 'var(--fg)',
                }}
              />
            </div>
          )}

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {displayed.length === 0 && (
              <p style={{ padding: '0.75rem 1rem', fontSize: '0.82rem', color: 'var(--grey)' }}>
                No results
              </p>
            )}
            {displayed.map(opt => {
              const val = typeof opt === 'string' ? opt : opt.value
              const label = typeof opt === 'string' ? opt : opt.label
              const selected = val === value
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 1rem',
                    border: 'none',
                    background: selected ? 'var(--bg-muted)' : 'transparent',
                    color: selected ? 'var(--fg)' : 'var(--fg)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '0.85rem',
                    fontWeight: selected ? 500 : 400,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--bg-subtle)' }}
                  onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                >
                  {label}
                  {selected && (
                    <Check size={13} strokeWidth={2.5} style={{ color: 'var(--fg)', flexShrink: 0 }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
