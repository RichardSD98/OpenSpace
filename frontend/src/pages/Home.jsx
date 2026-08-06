import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import api from '../api/axios'
import ListingCard from '../components/ListingCard'
import { BUDGETS, FilterChips, UNIT_TYPES, buildListingParams } from '../components/ListingSearch'
import { SkeletonCard } from '../components/Skeleton'
import Footer from '../components/ui/Footer'
import { useReveal } from '../context/useReveal'
import { useAuth } from '../context/AuthContext'

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

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const reduceMotion = useReducedMotion()
  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(heroScroll, [0, 1], [1, 0.3])
  const heroY = useTransform(heroScroll, [0, 1], [0, 40])
  const [listings, setListings] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [unitType, setUnitType] = useState(UNIT_TYPES[0])
  const [budget, setBudget] = useState(BUDGETS[0])
  const [activeChip, setActiveChip] = useState('All')
  const [sharedRent, setSharedRent] = useState(false)
  const [counts, setCounts] = useState({ total: 0, hoods: 0 })
  const rawRecent = useRecentlyViewed()
  const recent = user?.role === 'lister'
    ? rawRecent.filter(l => l.landlord?._id === user._id)
    : rawRecent
  const statsRef = useRef(null)
  const listingsRef = useRef(null)
  const pageRef = useReveal()

  const fetchListings = useCallback(async (nbhood, ut, bgt, chip, shared) => {
    setLoading(true)
    setError('')
    try {
      const params = buildListingParams({
        neighborhood: nbhood,
        unitType: ut,
        budget: bgt,
        activeChip: chip,
        sharedRent: shared,
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

  useEffect(() => { fetchListings(neighborhood, unitType, budget, activeChip, sharedRent) }, [fetchListings, activeChip, sharedRent])

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
    fetchListings(neighborhood, unitType, budget, activeChip, sharedRent)
  }

  const viewAllParams = buildListingParams({
    neighborhood,
    unitType,
    budget,
    activeChip,
    sharedRent,
  })

  return (
    <div ref={pageRef}>
      {/* ── Hero ── */}
      <motion.section
        ref={heroRef}
        className="hero"
        style={reduceMotion ? undefined : { opacity: heroOpacity, y: heroY }}
      >
        <div className="hero-tag">Windhoek Rentals</div>
        <p className="hero-p">
          A simple platform connecting landlords and renters across Windhoek,{' '}
          Namibia. Browse free. List free.
        </p>
        <div className="hero-actions">
          <motion.button
            className="btn-main"
            onClick={() => listingsRef.current?.scrollIntoView({ behavior: 'smooth' })}
            whileHover={reduceMotion ? undefined : { scale: 1.03 }}
            whileTap={reduceMotion ? undefined : { scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            Browse listings
          </motion.button>
          {(!user || user.role === 'lister') && (
            <motion.button
              className="btn-ghost"
              onClick={() => navigate('/post-listing')}
              whileHover={reduceMotion ? undefined : { scale: 1.03 }}
              whileTap={reduceMotion ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              List a property
            </motion.button>
          )}
        </div>
      </motion.section>

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
        <FilterChips
          activeChip={activeChip}
          setActiveChip={setActiveChip}
          sharedRent={sharedRent}
          setSharedRent={setSharedRent}
        />
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
            <motion.div
              className="listings"
              initial={reduceMotion ? false : 'hidden'}
              animate="visible"
              variants={reduceMotion ? undefined : gridVariants}
            >
              {listings.map((l, i) => <ListingCard key={l._id} listing={l} index={i} />)}
            </motion.div>
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
