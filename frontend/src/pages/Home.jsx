import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import ListingCard from '../components/ListingCard'
import { buildListingParams } from '../components/ListingSearch'
import { SkeletonCard } from '../components/Skeleton'
import Footer from '../components/ui/Footer'
import { useReveal } from '../context/useReveal'

function useRecentlyViewed() {
  const [recent, setRecent] = useState([])
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('os_recently_viewed') || '[]')
      setRecent(stored.slice(0, 4))
    } catch {}
  }, [])
  return recent
}

const UNIT_TYPES = [
  { label: 'Any type', value: '' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Flat', value: 'flat' },
  { label: 'Single Room', value: 'single room' },
  { label: 'Studio', value: 'studio' },
]

const BUDGETS = [
  { label: 'Any price', max: null, min: null },
  { label: 'Up to N$3,500', max: 3500, min: null },
  { label: 'Up to N$5,500', max: 5500, min: null },
  { label: 'Up to N$8,000', max: 8000, min: null },
  { label: 'N$8,000+', max: null, min: 8000 },
]

const CHIPS = ['All', 'Near UNAM', 'Near IUM', 'Furnished', 'Water included', 'Pet friendly', 'Available now']

function CustomSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const selected = options.find(o => o.label === value) || options[0]

  return (
    <div className="s-field" ref={ref}>
      <span className="s-label">{label}</span>
      <div className={`custom-select${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        <div className="cs-trigger">
          <span className="cs-value">{selected.label}</span>
          <span className="cs-arrow" />
        </div>
        <ul className="cs-dropdown" onClick={e => e.stopPropagation()}>
          {options.map(opt => (
            <li
              key={opt.label}
              className={`cs-option${opt.label === selected.label ? ' selected' : ''}`}
              onClick={() => { onChange(opt); setOpen(false) }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [unitType, setUnitType] = useState(UNIT_TYPES[0])
  const [budget, setBudget] = useState(BUDGETS[0])
  const [activeChip, setActiveChip] = useState('All')
  const [counts, setCounts] = useState({ total: 0, hoods: 0 })
  const recent = useRecentlyViewed()
  const statsRef = useRef(null)
  const listingsRef = useRef(null)
  const pageRef = useReveal()

  const fetchListings = useCallback(async (nbhood, ut, bgt, chip) => {
    setLoading(true)
    setError('')
    try {
      const params = buildListingParams({
        neighborhood: nbhood,
        unitType: ut,
        budget: bgt,
        activeChip: chip,
        limit: 6,
      })
      const { data } = await api.get(`/listings?${params}`)
      setListings(data.listings || [])
      setTotal(data.total || 0)
    } catch {
      setError('Could not load listings. Is the server running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchListings(neighborhood, unitType, budget, activeChip) }, [fetchListings, activeChip])

  useEffect(() => {
    if (!statsRef.current) return
    const el = statsRef.current
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      const targets = { total: Math.max(total, 340), hoods: 15 }
      const dur = 1200, steps = 40
      let i = 0
      const t = setInterval(() => {
        i++
        const p = i / steps
        setCounts({ total: Math.round(targets.total * p), hoods: Math.round(targets.hoods * p) })
        if (i >= steps) clearInterval(t)
      }, dur / steps)
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [total])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchListings(neighborhood, unitType, budget, activeChip)
  }

  const viewAllParams = buildListingParams({
    neighborhood,
    unitType,
    budget,
    activeChip,
  })

  return (
    <div ref={pageRef}>
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-tag">Windhoek Rentals</div>
        <h1>Find your space.<br /><span>Before you call.</span></h1>
        <p className="hero-p">
          Browse available apartments, flats and rooms across Windhoek.{' '}
          Direct from landlords — no agents, no commission.
        </p>
        <div className="hero-actions">
          <button
            className="btn-main"
            onClick={() => listingsRef.current?.scrollIntoView({ behavior: 'smooth' })}
          >
            Browse listings
          </button>
          <button className="btn-ghost" onClick={() => navigate('/post-listing')}>
            List a property
          </button>
        </div>
      </section>

      {/* ── Trust Line ── */}
      <div className="trust-line">
        <div className="trust-item"><span className="trust-dot" /> Free to browse</div>
        <div className="trust-item"><span className="trust-dot" /> Direct landlord contact</div>
        <div className="trust-item"><span className="trust-dot" /> No agent fees</div>
        <div className="trust-item"><span className="trust-dot" /> List your space free</div>
      </div>

      {/* ── Search ── */}
      <div className="search-wrap">
        <p className="search-label">Search listings</p>
        <form onSubmit={handleSearch}>
          <div className="search-row">
            <div className="s-field">
              <span className="s-label">Neighbourhood</span>
              <input
                className="s-input"
                type="text"
                placeholder="Katutura, Olympia, Khomasdal…"
                value={neighborhood}
                onChange={e => setNeighborhood(e.target.value)}
              />
            </div>
            <CustomSelect
              label="Type"
              value={unitType.label}
              options={UNIT_TYPES}
              onChange={setUnitType}
            />
            <CustomSelect
              label="Max Budget"
              value={budget.label}
              options={BUDGETS}
              onChange={setBudget}
            />
            <button type="submit" className="s-btn">Search</button>
          </div>
        </form>
        <div className="filters">
          {CHIPS.map(chip => (
            <button
              key={chip}
              type="button"
              className={`filter${activeChip === chip ? ' on' : ''}`}
              onClick={() => setActiveChip(chip)}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ── Listings ── */}
      <div ref={listingsRef}>
        <div className="sec-head">
          <h2>Latest listings</h2>
          <Link to={`/listings${viewAllParams.toString() ? `?${viewAllParams}` : ''}`}>View all →</Link>
        </div>
        <div className="listings-wrap">
          {error && (
            <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
          )}
          {loading ? (
            <div className="listings">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : listings.length === 0 ? (
            <div style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--grey)', fontSize: '0.9rem', fontWeight: 300 }}>
              No listings match your search. Try different filters.
            </div>
          ) : (
            <div className="listings">
              {listings.map((l, i) => <ListingCard key={l._id} listing={l} index={i} />)}
            </div>
          )}
        </div>
      </div>

      {/* ── Recently Viewed ── */}
      {recent.length > 0 && (
        <div>
          <div className="sec-head">
            <h2>Recently viewed</h2>
          </div>
          <div className="listings-wrap listings-wrap-recent">
            <div className="listings recently-viewed-list">
              {recent.map((l, i) => <ListingCard key={l.id} listing={l} index={i} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── Stats ── */}
      <div className="stats-wrap" ref={statsRef}>
        <div className="stats">
          <div className="stat reveal">
            <div className="stat-n">{counts.total}+</div>
            <div className="stat-l">Listings in Windhoek</div>
          </div>
          <div className="stat reveal">
            <div className="stat-n">{counts.hoods}</div>
            <div className="stat-l">Neighbourhoods</div>
          </div>
          <div className="stat reveal">
            <div className="stat-n">Free</div>
            <div className="stat-l">To browse</div>
          </div>
          <div className="stat reveal">
            <div className="stat-n">0</div>
            <div className="stat-l">Upfront platform fees</div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  )
}
