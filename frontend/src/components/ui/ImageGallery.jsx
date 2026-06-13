import { useState, useCallback } from 'react'
import ResponsiveImage from './ResponsiveImage'
import { buildSrcSet, SIZES_GALLERY } from './imageUtils'

const GRID_COLS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

function gridClass(prefix, count) {
  return count ? `${prefix}${GRID_COLS[count] || GRID_COLS[1]}` : ''
}

/**
 * Responsive image gallery with CSS Grid, lightbox, and adaptive srcSet loading.
 */
export default function ImageGallery({
  images = [],
  columns = { default: 1, sm: 2, lg: 3 },
  gap = 'gap-3 sm:gap-4 md:gap-5',
  className = '',
  showLightbox = true,
  ariaLabel = 'Image gallery',
}) {
  const [activeIndex, setActiveIndex] = useState(null)

  const colClasses = [
    'grid',
    gridClass('', columns.default || 1),
    gridClass('sm:', columns.sm),
    gridClass('md:', columns.md),
    gridClass('lg:', columns.lg),
    gap,
    className,
  ].filter(Boolean).join(' ')

  const openLightbox = useCallback((index) => {
    if (showLightbox) setActiveIndex(index)
  }, [showLightbox])

  const closeLightbox = useCallback(() => setActiveIndex(null), [])

  const goPrev = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length))
  }, [images.length])

  const goNext = useCallback(() => {
    setActiveIndex((i) => (i === null ? null : (i + 1) % images.length))
  }, [images.length])

  if (!images.length) {
    return (
      <p className="text-fluid-sm text-[var(--grey)]" role="status">
        No images to display.
      </p>
    )
  }

  return (
    <>
      <div
        className={colClasses}
        role="list"
        aria-label={ariaLabel}
      >
        {images.map((image, index) => (
          <figure
            key={image.id || image.src || index}
            role="listitem"
            className={[
              'overflow-hidden rounded-sm border border-[var(--border)]',
              image.featured ? 'sm:col-span-2 sm:row-span-2' : '',
            ].filter(Boolean).join(' ')}
          >
            <button
              type="button"
              className="block w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg)] focus-visible:ring-offset-2"
              onClick={() => openLightbox(index)}
              aria-label={`View larger: ${image.alt || `Image ${index + 1}`}`}
            >
              <ResponsiveImage
                src={image.src}
                alt={image.alt || ''}
                srcSet={image.srcSet || buildSrcSet(image.src)}
                sizes={SIZES_GALLERY}
                aspectRatio={image.aspectRatio || 'landscape'}
                objectFit="cover"
              />
            </button>
            {image.caption && (
              <figcaption className="px-3 py-2 text-fluid-xs font-light text-[var(--grey)]">
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>

      {showLightbox && activeIndex !== null && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 p-4 sm:p-6 md:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          onClick={closeLightbox}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-sm p-2 text-white/80 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            ✕
          </button>

          <button
            type="button"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-sm p-3 text-white/80 transition-colors hover:text-white sm:left-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={(e) => { e.stopPropagation(); goPrev() }}
            aria-label="Previous image"
          >
            ‹
          </button>

          <div
            className="max-h-[85vh] max-w-[min(100%,56rem)] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <ResponsiveImage
              src={images[activeIndex].src}
              alt={images[activeIndex].alt || ''}
              srcSet={buildSrcSet(images[activeIndex].src, [800, 1200, 1600, 2000])}
              sizes="(max-width: 768px) 100vw, 896px"
              aspectRatio="auto"
              objectFit="contain"
              priority
              className="max-h-[85vh] w-auto mx-auto"
              wrapperClassName="flex items-center justify-center"
            />
            {images[activeIndex].caption && (
              <p className="mt-3 text-center text-fluid-sm text-white/80">
                {images[activeIndex].caption}
              </p>
            )}
          </div>

          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-3 text-white/80 transition-colors hover:text-white sm:right-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            onClick={(e) => { e.stopPropagation(); goNext() }}
            aria-label="Next image"
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}
