import { HiAdjustments } from 'react-icons/hi';
import { NEIGHBORHOODS } from '../lib/neighborhoods';

const UNIT_TYPES = ['apartment', 'flat', 'single room', 'studio'];

export default function FilterSidebar({ filters, onChange, onReset }) {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <aside className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-5 space-y-6 h-fit sticky top-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-zinc-800 font-bold">
          <HiAdjustments className="w-4 h-4 text-blue-500" />
          Filters
        </div>
        <button
          onClick={onReset}
          className="text-xs text-blue-500 hover:text-blue-400 font-semibold"
        >
          Reset all
        </button>
      </div>

      {/* Unit Type */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Unit Type
        </p>
        <div className="space-y-2">
          {['', ...UNIT_TYPES].map((t) => (
            <label
              key={t || 'all'}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="radio"
                name="unitType"
                value={t}
                checked={filters.unitType === t}
                onChange={() => set('unitType', t)}
                className="accent-blue-500 w-4 h-4"
              />
              <span className="text-sm text-slate-600 group-hover:text-slate-800 capitalize">
                {t || 'All types'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Neighborhood */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Neighbourhood
        </p>
        <select
          value={filters.neighborhood}
          onChange={(e) => set('neighborhood', e.target.value)}
          className="w-full border border-zinc-200 rounded-xl px-3 py-2.5 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All neighbourhoods</option>
          {NEIGHBORHOODS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
          Rent Range (N$)
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={filters.minRent}
            onChange={(e) => set('minRent', e.target.value)}
            className="w-1/2 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={filters.maxRent}
            onChange={(e) => set('maxRent', e.target.value)}
            className="w-1/2 border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </aside>
  );
}
