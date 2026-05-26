import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import ListingCard from '../components/ListingCard'
import { useReveal } from '../context/useReveal'

const UNIT_TYPES = [
  { label: 'Any type', value: '' },
  { label: 'Apartment', value: 'Apartment' },
  { label: 'Bachelor Flat', value: 'Bachelor Flat' },
  { label: 'Single Room', value: 'Single Room' },
  { label: 'House', value: 'House' },
  { label: 'Townhouse', value: 'Townhouse' },
]

const BUDGETS = [
  { label: 'Any price', max: null, min: null },
  { label: 'Up to N$3,500', max: 3500, min: null },
  { label: 'Up to N$5,500', max: 5500, min: null },
  { label: 'Up to N$8,000', max: 8000, min: null },
  { label: 'N$8,000+', max: null, min: 8000 },
]

const CHIPS = ['All', 'Near UNAM', 'Near IUM', 'Furnished', 'Water included', 'Pet friendly', 'Available now']

const HOW_STEPS = [
  { n: '01', title: 'Browse listings', desc: 'Filter by neighbourhood, unit type, and price. Every listing shows full details upfront.' },
  { n: '02', title: 'Contact the landlord', desc: 'Send a viewing request or call directly — no middlemen, no commission fees.' },
  { n: '03', title: 'Agree and move in', desc: 'Arrange a viewing, agree on terms, sign a lease, and move in.' },
]

const RENTING_TIPS = [
  { num: '01', title: 'See it before you pay', desc: "Never transfer money before viewing the property in person. Genuine landlords always welcome viewings." },
  { num: '02', title: 'Meet at the property', desc: 'Arrange to meet the landlord at the actual address — not elsewhere.' },
  { num: '03', title: 'Get a written lease', desc: 'Always sign a written rental agreement before handing over any money.' },
  { num: '04', title: 'Trust your gut', desc: 'If something feels off, walk away. No legitimate landlord will pressure you.' },
]

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
  const statsRef = useRef(null)
  const listingsRef = useRef(null)
  const pageRef = useReveal()

  const fetchListings = useCallback(async (nbhood, ut, bgt) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ limit: 6 })
      if (ut?.value) params.append('unitType', ut.value)
      if (bgt?.max) params.append('maxRent', bgt.max)
      if (bgt?.min) params.append('minRent', bgt.min)
      if (nbhood.trim()) params.append('neighborhood', nbhood.trim())
      const { data } = await api.get(`/listings?${params}`)
      setListings(data.listings || [])
      setTotal(data.total || 0)
    } catch {
      setError('Could not load listings. Is the server running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchListings(neighborhood, unitType, budget) }, [fetchListings])

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
    fetchListings(neighborhood, unitType, budget)
  }

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
          <Link to="/">View all →</Link>
        </div>
        <div className="listings-wrap">
          {error && (
            <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
          )}
          {loading ? (
            <div className="listings">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="listing" style={{ minHeight: 260, opacity: 0.25 }} />
              ))}
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

      {/* ── Renting Tips ── */}
      <div className="safety">
        <div className="safety-left">
          <h2>Renting in Windhoek,<br />done <em>right</em>.</h2>
          <p className="safety-sub">
            OpenSpace connects you directly with landlords. Here's what to keep in mind before you sign anything.
          </p>
        </div>
        <div className="safety-items">
          {RENTING_TIPS.map(item => (
            <div key={item.num} className="safety-item">
              <span className="safety-num">{item.num}</span>
              <div>
                <p className="safety-item-title">{item.title}</p>
                <p className="safety-item-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="how">
        <div className="how-head reveal">
          <h2>How OpenSpace works</h2>
          <p style={{ marginTop: '0.5rem', fontSize: '0.88rem', color: 'var(--grey)', fontWeight: 300 }}>
            From search to signing, we make renting in Windhoek straightforward.
          </p>
        </div>
        <div className="steps">
          {HOW_STEPS.map(s => (
            <div key={s.n} className="step reveal">
              <div className="step-n">{s.n}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

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
      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <a className="logo" href="/">OpenSpace</a>
            <p>A simple platform connecting landlords and renters across Windhoek, Namibia. Browse free. List free.</p>
          </div>
          <div>
            <h4>Browse</h4>
            <ul>
              <li><Link to="/">All listings</Link></li>
              <li><a href="/">Apartments</a></li>
              <li><a href="/">Bachelor Flats</a></li>
              <li><a href="/">Single Rooms</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/register">Sign up</Link></li>
              <li><Link to="/login">Sign in</Link></li>
              <li><Link to="/post-listing">Post a listing</Link></li>
              <li><a href="/">About OpenSpace</a></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul>
              <li><a href="/">Terms of service</a></li>
              <li><a href="/">Privacy policy</a></li>
              <li><a href="/">Cookie policy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} OpenSpace · Windhoek, Namibia</p>
          <p>Built for Windhoek</p>
        </div>
      </footer>
    </div>
  )
}


