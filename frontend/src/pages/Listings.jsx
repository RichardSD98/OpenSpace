import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { SearchX } from 'lucide-react'
import api from '../api/axios'
import ListingCard from '../components/ListingCard'
import EmptyState, { LaunchingSoonState } from '../components/EmptyState'
import ListingSearch, {
  BUDGETS,
  SORT_OPTIONS,
  UNIT_TYPES,
  budgetFromQuery,
  buildListingParams,
  chipFromQuery,
  hasActiveFilters,
  optionFromValue,
  sharedRentFromQuery,
} from '../components/ListingSearch'
import { SkeletonCard } from '../components/Skeleton'
import Footer from '../components/ui/Footer'
import { useReveal } from '../context/useReveal'

const PAGE_SIZE = 12

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

export default function Listings() {
  const pageRef = useReveal()
  const reduceMotion = useReducedMotion()
  const [searchParams, setSearchParams] = useSearchParams()
  const initial = useMemo(() => new URLSearchParams(searchParams), [])

  const [listings, setListings] = useState([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(Math.max(1, Number(initial.get('page')) || 1))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [neighborhood, setNeighborhood] = useState(initial.get('neighborhood') || '')
  const [unitType, setUnitType] = useState(optionFromValue(UNIT_TYPES, initial.get('unitType') || ''))
  const [budget, setBudget] = useState(budgetFromQuery(initial.get('minRent'), initial.get('maxRent')))
  const [sort, setSort] = useState(optionFromValue(SORT_OPTIONS, initial.get('sort') || 'newest'))
  const [activeChip, setActiveChip] = useState(chipFromQuery(initial))
  const [sharedRent, setSharedRent] = useState(sharedRentFromQuery(initial))
  // Whether the request behind the current results narrowed anything, which
  // decides which of the two empty states applies.
  const [isFiltered, setFiltered] = useState(hasActiveFilters(initial))

  const makeParams = useCallback((pageNumber = page) => buildListingParams({
    neighborhood,
    unitType,
    budget,
    activeChip,
    sharedRent,
    sort,
    page: pageNumber,
    limit: PAGE_SIZE,
  }), [activeChip, budget, neighborhood, page, sharedRent, sort, unitType])

  const fetchListings = useCallback(async (pageNumber = page) => {
    setLoading(true)
    setError('')
    try {
      const params = makeParams(pageNumber)
      setSearchParams(params, { replace: true })
      const { data } = await api.get(`/listings?${params}`)
      setFiltered(hasActiveFilters(params))
      setListings(data.listings || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      setPage(data.page || pageNumber)
    } catch {
      setError('Could not load listings. Is the server running?')
    } finally {
      setLoading(false)
    }
  }, [makeParams, page, setSearchParams])

  useEffect(() => {
    fetchListings(page)
  }, [fetchListings, page])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchListings(1)
  }

  const handleChipChange = (chip) => {
    setActiveChip(chip)
    setPage(1)
  }

  const handleSharedRentChange = (next) => {
    setSharedRent(next)
    setPage(1)
  }

  const goToPage = (nextPage) => {
    const bounded = Math.min(Math.max(nextPage, 1), pages)
    setPage(bounded)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetFilters = () => {
    setNeighborhood('')
    setUnitType(UNIT_TYPES[0])
    setBudget(BUDGETS[0])
    setSort(SORT_OPTIONS[0])
    setActiveChip('All')
    setSharedRent(false)
    setPage(1)
  }

  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, total)

  return (
    <div ref={pageRef}>
      <section className="listings-page-hero">
        <div className="hero-tag">All rentals</div>
        <h1>Browse every available listing.</h1>
        <p className="hero-p">
          Search Windhoek rentals, narrow the list with practical filters, and sort by what matters most.
        </p>
      </section>

      <ListingSearch
        neighborhood={neighborhood}
        setNeighborhood={setNeighborhood}
        unitType={unitType}
        setUnitType={setUnitType}
        budget={budget}
        setBudget={setBudget}
        sort={sort}
        setSort={(nextSort) => { setSort(nextSort); setPage(1) }}
        activeChip={activeChip}
        setActiveChip={handleChipChange}
        sharedRent={sharedRent}
        setSharedRent={handleSharedRentChange}
        onSubmit={handleSearch}
        showSort
      />

      <div className="listings-summary">
        <div>
          <h2>Available options</h2>
          <p>
            {loading ? 'Loading listings...' : `${start}-${end} of ${total} listing${total === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          type="button"
          className="filter"
          onClick={resetFilters}
        >
          Reset filters
        </button>
      </div>

      <div className="listings-wrap">
        {error && (
          <p style={{ color: 'var(--grey)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>
        )}
        {loading ? (
          <div className="listings">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          // "Try different filters" is only true advice when filters are
          // actually set. On an empty marketplace it sends the reader off to
          // adjust controls that were never the problem.
          isFiltered ? (
            <EmptyState
              tone="bare"
              icon={SearchX}
              title="No matches for these filters"
              description="Nothing in Windhoek fits every filter at once. Widening the budget or the neighbourhood usually helps."
              action={{ onClick: resetFilters, label: 'Reset filters' }}
            />
          ) : (
            <LaunchingSoonState tone="bare" />
          )
        ) : (
          <motion.div
            className="listings"
            key={page}
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            variants={reduceMotion ? undefined : gridVariants}
          >
            {listings.map((listing, i) => (
              <ListingCard key={listing._id} listing={listing} index={i} />
            ))}
          </motion.div>
        )}
      </div>

      {pages > 1 && (
        <nav className="pagination" aria-label="Listings pagination">
          <button type="button" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
            Previous
          </button>
          {Array.from({ length: pages }).map((_, i) => {
            const pageNumber = i + 1
            if (pages > 7 && Math.abs(pageNumber - page) > 2 && pageNumber !== 1 && pageNumber !== pages) {
              if (pageNumber === 2 || pageNumber === pages - 1) return <span key={pageNumber}>...</span>
              return null
            }
            return (
              <button
                type="button"
                key={pageNumber}
                className={pageNumber === page ? 'active' : ''}
                onClick={() => goToPage(pageNumber)}
              >
                {pageNumber}
              </button>
            )
          })}
          <button type="button" onClick={() => goToPage(page + 1)} disabled={page >= pages}>
            Next
          </button>
        </nav>
      )}

      <Footer />
    </div>
  )
}
