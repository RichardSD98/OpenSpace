import { useState } from 'react'
import { buildSrcSet } from './imageUtils'

const fitClasses = {
  cover: 'object-cover',
  contain: 'object-contain',
  fill: 'object-fill',
  none: 'object-none',
}

const aspectClasses = {
  auto: '',
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-portrait',
  landscape: 'aspect-landscape',
  wide: 'aspect-wide',
}

function resolveAspectRatio(aspectRatio) {
  if (aspectClasses[aspectRatio]) {
    return { className: aspectClasses[aspectRatio], style: undefined }
  }
  if (aspectRatio && aspectRatio.includes('/')) {
    return { className: '', style: { aspectRatio } }
  }
  return { className: '', style: undefined }
}

/**
 * Responsive image with srcSet, sizes, lazy loading, and aspect-ratio preservation.
 */
export default function ResponsiveImage({
  src,
  alt,
  srcSet,
  sizes = SIZES_FULL,
  widths,
  objectFit = 'cover',
  aspectRatio = 'auto',
  className = '',
  wrapperClassName = '',
  priority = false,
  onLoad,
  onError,
  ...props
}) {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const resolvedSrcSet = srcSet || (src ? buildSrcSet(src, widths) : undefined)
  const { className: aspectClass, style: aspectStyle } = resolveAspectRatio(aspectRatio)

  const handleLoad = (e) => {
    setLoaded(true)
    onLoad?.(e)
  }

  const handleError = (e) => {
    setFailed(true)
    onError?.(e)
  }

  return (
    <figure
      className={[
        'relative overflow-hidden',
        aspectClass,
        wrapperClassName,
      ].filter(Boolean).join(' ')}
      style={aspectStyle}
    >
      {!loaded && !failed && (
        <div
          className="absolute inset-0 skeleton"
          aria-hidden="true"
          role="presentation"
        />
      )}
      {failed ? (
        <div
          className="flex h-full min-h-[12rem] w-full items-center justify-center bg-[var(--img-a)] text-fluid-xs text-[var(--grey)]"
          role="img"
          aria-label={alt}
        >
          Image unavailable
        </div>
      ) : (
        <img
          src={src}
          srcSet={resolvedSrcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={[
            'block h-auto max-w-full w-full',
            fitClasses[objectFit] || fitClasses.cover,
            aspectRatio !== 'auto' ? 'h-full' : '',
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            className,
          ].filter(Boolean).join(' ')}
          {...props}
        />
      )}
    </figure>
  )
}
