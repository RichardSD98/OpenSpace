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

export const CHIPS = ['All', 'Near UNAM', 'Near IUM', 'Furnished', 'Water included', 'Pet friendly', 'Available now']

export function buildListingParams({ neighborhood, unitType, budget, activeChip, sort, page, limit }) {
  const params = new URLSearchParams()
  if (limit) params.set('limit', limit)
  if (page) params.set('page', page)
  if (sort) params.set('sort', sort.value || sort)
  if (unitType?.value) params.set('unitType', unitType.value)
  if (budget?.max) params.set('maxRent', budget.max)
  if (budget?.min) params.set('minRent', budget.min)
  if (neighborhood?.trim()) params.set('neighborhood', neighborhood.trim())

  if (activeChip === 'Near UNAM') params.set('neighborhood', 'UNAM')
  if (activeChip === 'Near IUM') params.set('neighborhood', 'IUM')
  if (activeChip === 'Furnished') params.set('amenity', 'Furnished')
  if (activeChip === 'Water included') params.set('amenity', 'Water included')
  if (activeChip === 'Pet friendly') params.set('amenity', 'Pet-friendly')
  if (activeChip === 'Available now') params.set('availableNow', 'true')

  return params
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
  )
}
