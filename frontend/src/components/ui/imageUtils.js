/**
 * Build a srcSet string from a base URL and width descriptors.
 * Works with Unsplash, Picsum, and any URL that accepts a `w` query param.
 */
export function buildSrcSet(baseUrl, widths = [400, 640, 960, 1200, 1600]) {
  if (!baseUrl || !supportsWidthParam(baseUrl)) return undefined
  const separator = baseUrl.includes('?') ? '&' : '?'
  return widths
    .map((w) => `${baseUrl}${separator}w=${w}&q=80&auto=format ${w}w`)
    .join(', ')
}

/** Only auto-generate srcSet for CDNs that support width query params. */
export function supportsWidthParam(url) {
  try {
    const host = new URL(url).hostname
    return (
      host.includes('unsplash.com') ||
      host.includes('picsum.photos') ||
      host.includes('images.unsplash.com')
    )
  } catch {
    return false
  }
}

/** Default sizes attribute for full-width hero images. */
export const SIZES_FULL = '(max-width: 640px) 100vw, (max-width: 960px) 90vw, 1200px'

/** Default sizes for gallery grid cells. */
export const SIZES_GALLERY = '(max-width: 640px) 100vw, (max-width: 960px) 50vw, 33vw'

/** Default sizes for card thumbnails. */
export const SIZES_CARD = '(max-width: 640px) 100vw, (max-width: 960px) 50vw, 400px'

/** Demo images — optimized Unsplash URLs for Windhoek / architecture theme. */
export const DEMO_IMAGES = [
  {
    id: 'apartment-1',
    src: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
    alt: 'Modern apartment living room with natural light',
    aspectRatio: '4/3',
  },
  {
    id: 'apartment-2',
    src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
    alt: 'Cozy studio apartment interior',
    aspectRatio: '4/3',
  },
  {
    id: 'house-1',
    src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6',
    alt: 'Suburban house with garden',
    aspectRatio: '16/9',
  },
  {
    id: 'room-1',
    src: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304',
    alt: 'Furnished bedroom with desk',
    aspectRatio: '3/4',
  },
  {
    id: 'kitchen-1',
    src: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55',
    alt: 'Bright kitchen with wooden cabinets',
    aspectRatio: '4/3',
  },
  {
    id: 'city-1',
    src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000',
    alt: 'City skyline at sunset',
    aspectRatio: '16/9',
  },
]
