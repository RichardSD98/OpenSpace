/**
 * Responsive skeleton loaders that scale with viewport and match component layouts.
 */

export function SkeletonBlock({
  className = '',
  width,
  height,
  rounded = 'rounded-sm',
  style = {},
  'aria-label': ariaLabel = 'Loading',
}) {
  return (
    <div
      className={`skeleton ${rounded} ${className}`}
      style={{ width, height, ...style }}
      role="status"
      aria-label={ariaLabel}
      aria-busy="true"
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 sm:gap-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          height="0.875rem"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  )
}

/** Matches Card layout — responsive image + text blocks. */
export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`flex flex-col rounded-sm border border-[var(--border)] p-4 sm:p-5 md:p-6 ${className}`}
      role="status"
      aria-label="Loading card"
      aria-busy="true"
    >
      <SkeletonBlock className="mb-4 aspect-video w-full" />
      <div className="mb-3 flex items-start justify-between gap-3">
        <SkeletonBlock height="1.25rem" className="w-2/5" />
        <SkeletonBlock height="1.25rem" className="w-1/4 rounded-full" />
      </div>
      <SkeletonText lines={2} className="mb-4" />
      <div className="flex gap-3 border-t border-[var(--border)] pt-3">
        <SkeletonBlock height="0.75rem" className="w-1/4" />
        <SkeletonBlock height="0.75rem" className="w-1/3" />
      </div>
    </div>
  )
}

/** Matches ImageGallery grid — adapts column count via CSS grid. */
export function SkeletonGallery({ count = 6, className = '' }) {
  return (
    <div
      className={`grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5 ${className}`}
      role="status"
      aria-label="Loading gallery"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className={[
            'aspect-landscape w-full',
            i === 0 ? 'sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[18rem]' : '',
          ].filter(Boolean).join(' ')}
        />
      ))}
    </div>
  )
}

/** Hero section skeleton with fluid typography placeholders. */
export function SkeletonHero({ className = '' }) {
  return (
    <div className={`py-section-y ${className}`} role="status" aria-label="Loading hero" aria-busy="true">
      <SkeletonBlock height="0.75rem" className="mb-4 w-32" />
      <SkeletonBlock height="clamp(2rem, 5vw, 3.5rem)" className="mb-4 w-full max-w-xl" />
      <SkeletonBlock height="clamp(2rem, 5vw, 3.5rem)" className="mb-6 w-4/5 max-w-lg" />
      <SkeletonText lines={2} className="mb-8 max-w-md" />
      <div className="flex flex-wrap gap-3">
        <SkeletonBlock height="2.75rem" className="w-36 sm:w-40" />
        <SkeletonBlock height="2.75rem" className="w-36 sm:w-40" />
      </div>
    </div>
  )
}

/** Grid of skeleton cards — responsive columns. */
export function SkeletonCardGrid({ count = 3, className = '' }) {
  return (
    <div
      className={`grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 ${className}`}
      role="status"
      aria-label="Loading cards"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
