import { useEffect, useRef, useState } from 'react'

export const UNIT_TYPES = [
  { label: 'Any type', value: '' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'Flat', value: 'flat' },
  { label: 'Single Room', value: 'single room' },
  { label: 'Studio', value: 'studio' },
]

export const BUDGETS = [
  { label: 'Any price', max: null, min: null },
  { label: 'Up to N$3,500', max: 3500, min: null },
  { label: 'Up to N$5,500', max: 5500, min: null },
  { label: 'Up to N$8,000', max: 8000, min: null },
  { label: 'N$8,000+', max: null, min: 8000 },
]

export const SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Lowest rent', value: 'rent-asc' },
  { label: 'Highest rent', value: 'rent-desc' },
  { label: 'Available soonest', value: 'available-asc' },
]

// The chips are mutually exclusive, so each one owns the query params it sets and
// both directions of the URL mapping read from this table.
export const CHIP_FILTERS = [
  { label: 'All', params: {} },
  { label: 'Near UNAM', params: { neighborhood: 'UNAM' } },
  { label: 'Near IUM', params: { neighborhood: 'IUM' } },
  { label: 'Furnished', params: { amenity: 'Furnished' } },
  { label: 'Water included', params: { amenity: 'Water included' } },
  { label: 'Pet friendly', params: { amenity: 'Pet-friendly' } },
  { label: 'Available now', params: { availableNow: 'true' } },
]

export const CHIPS = CHIP_FILTERS.map(chip => chip.label)

export function buildListingParams({ neighborhood, unitType, budget, activeChip, sharedRent, sort, page, limit }) {
  const params = new URLSearchParams()
  if (limit) params.set('limit', limit)
  if (page) params.set('page', page)
  if (sort) params.set('sort', sort.value || sort)
  if (unitType?.value) params.set('unitType', unitType.value)
  if (budget?.max) params.set('maxRent', budget.max)
  if (budget?.min) params.set('minRent', budget.min)
  if (neighborhood?.trim()) params.set('neighborhood', neighborhood.trim())

  const chip = CHIP_FILTERS.find(c => c.label === activeChip)
  for (const [key, value] of Object.entries(chip?.params || {})) params.set(key, value)

  // Independent of the chips — shared rent describes the deal, not the property,
  // so it stacks on top of whichever chip is active.
  if (sharedRent) params.set('sharedRent', 'true')

  return params
}

// Everything buildListingParams can set that actually narrows the result set.
// `sort`, `page` and `limit` are excluded — they reorder or window the results
// but never cause an empty one, so they must not make an empty page blame a
// filter that is not there.
const NARROWING_PARAMS = ['unitType', 'maxRent', 'minRent', 'neighborhood', 'amenity', 'availableNow', 'sharedRent']

// Read from the params that were actually sent, not from the form state — the
// two differ whenever someone types into a field without submitting, and the
// empty state should describe the request the results came from.
export function hasActiveFilters(params) {
  const search = typeof params === 'string' ? new URLSearchParams(params) : params
  return NARROWING_PARAMS.some(key => search.has(key))
}

export function chipFromQuery(params) {
  const match = CHIP_FILTERS.find(chip => {
    const entries = Object.entries(chip.params)
    return entries.length > 0 && entries.every(([key, value]) => params.get(key) === value)
  })
  return match?.label || 'All'
}

export function sharedRentFromQuery(params) {
  return params.get('sharedRent') === 'true'
}

export function optionFromValue(options, value) {
  return options.find(option => option.value === value) || options[0]
}

export function budgetFromQuery(minRent, maxRent) {
  return BUDGETS.find(option => (
    String(option.min || '') === String(minRent || '') &&
    String(option.max || '') === String(maxRent || '')
  )) || BUDGETS[0]
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

export function FilterChips({ activeChip, setActiveChip, sharedRent, setSharedRent }) {
  return (
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
      <span className="filter-sep" aria-hidden="true" />
      <button
        type="button"
        className={`filter${sharedRent ? ' on' : ''}`}
        aria-pressed={sharedRent}
        onClick={() => setSharedRent(!sharedRent)}
      >
        Shared rent
      </button>
    </div>
  )
}

export default function ListingSearch({
  neighborhood,
  setNeighborhood,
  unitType,
  setUnitType,
  budget,
  setBudget,
  sort,
  setSort,
  activeChip,
  setActiveChip,
  sharedRent,
  setSharedRent,
  onSubmit,
  showSort = false,
}) {
  return (
    <div className="search-wrap">
      <p className="search-label">Search listings</p>
      <form onSubmit={onSubmit}>
        <div className={`search-row${showSort ? ' search-row-wide' : ''}`}>
          <div className="s-field">
            <span className="s-label">Neighbourhood</span>
            <input
              className="s-input"
              type="text"
              placeholder="Katutura, Olympia, Khomasdal..."
              value={neighborhood}
              onChange={e => setNeighborhood(e.target.value)}
            />
          </div>
          <CustomSelect label="Type" value={unitType.label} options={UNIT_TYPES} onChange={setUnitType} />
          <CustomSelect label="Max Budget" value={budget.label} options={BUDGETS} onChange={setBudget} />
          {showSort && (
            <CustomSelect label="Sort" value={sort.label} options={SORT_OPTIONS} onChange={setSort} />
          )}
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
  )
}
