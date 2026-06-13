import ResponsiveImage from './ResponsiveImage'
import { SIZES_CARD } from './imageUtils'

/**
 * Flexible content card — stacks vertically on mobile, adapts padding at each breakpoint.
 */
export default function Card({
  image,
  imageAlt,
  imageSrc,
  imageAspect = 'video',
  badge,
  title,
  subtitle,
  meta,
  footer,
  children,
  onClick,
  href,
  className = '',
  imageClassName = '',
  loading = false,
  ariaLabel,
}) {
  const interactive = Boolean(onClick || href)

  const cardClasses = [
    'group flex h-full w-full flex-col',
    'border border-[var(--border)] bg-[var(--bg)]',
    'rounded-sm p-4 sm:p-5 md:p-6',
    'transition-colors duration-200',
    interactive ? 'cursor-pointer hover:bg-[var(--bg-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]' : '',
    className,
  ].filter(Boolean).join(' ')

  const content = (
    <>
      {(image || imageSrc) && (
        <div className={`relative mb-4 overflow-hidden rounded-sm ${imageClassName}`}>
          {loading ? (
            <div className="aspect-video w-full skeleton" aria-hidden="true" />
          ) : (
            <ResponsiveImage
              src={imageSrc || image?.src}
              alt={imageAlt || image?.alt || title || 'Card image'}
              aspectRatio={imageAspect}
              sizes={SIZES_CARD}
              className="transition-transform duration-300 group-hover:scale-[1.02]"
            />
          )}
          {badge && (
            <span className="absolute bottom-2 left-2 rounded-sm border border-[var(--green-border)] bg-[var(--bg)] px-2 py-0.5 text-[0.68rem] font-medium text-[var(--green)]">
              {badge}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 sm:gap-3">
        {(title || subtitle) && (
          <header>
            {title && (
              <h3 className="font-serif text-fluid-lg font-normal leading-snug text-[var(--fg)]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-fluid-sm font-light text-[var(--grey)]">{subtitle}</p>
            )}
          </header>
        )}

        {meta && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--border)] pt-3 text-fluid-xs font-light text-[var(--grey)]">
            {meta}
          </div>
        )}

        {children && (
          <div className="flex-1 text-fluid-sm font-light leading-relaxed text-[var(--grey)]">
            {children}
          </div>
        )}

        {footer && (
          <footer className="mt-auto border-t border-[var(--border)] pt-3 sm:pt-4">
            {footer}
          </footer>
        )}
      </div>
    </>
  )

  if (href) {
    return (
      <a href={href} className={cardClasses} aria-label={ariaLabel || title}>
        {content}
      </a>
    )
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`${cardClasses} text-left`}
        aria-label={ariaLabel || title}
      >
        {content}
      </button>
    )
  }

  return (
    <article className={cardClasses} aria-label={ariaLabel}>
      {content}
    </article>
  )
}
