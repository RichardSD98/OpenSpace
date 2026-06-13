import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Header,
  Footer,
  Section,
  Card,
  Button,
  ImageGallery,
  ResponsiveImage,
  SkeletonHero,
  SkeletonCardGrid,
  SkeletonGallery,
  DEMO_IMAGES,
  SIZES_FULL,
} from '../components/ui'

const NAV_LINKS = [
  { label: 'Browse', to: '/' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Cards', href: '#cards' },
  { label: 'Images', href: '#images' },
]

const SAMPLE_CARDS = [
  {
    title: 'Katutura Apartment',
    subtitle: 'Katutura, Windhoek',
    badge: 'Available',
    price: 'N$4,500 /mo',
    beds: '2 beds',
    image: DEMO_IMAGES[0],
  },
  {
    title: 'Olympia Studio',
    subtitle: 'Olympia, Windhoek',
    badge: 'Available',
    price: 'N$3,200 /mo',
    beds: '1 bed',
    image: DEMO_IMAGES[1],
  },
  {
    title: 'Khomasdal Room',
    subtitle: 'Khomasdal, Windhoek',
    badge: 'New',
    price: 'N$2,800 /mo',
    beds: 'Single room',
    image: DEMO_IMAGES[3],
  },
]

const GALLERY_IMAGES = DEMO_IMAGES.map((img, i) => ({
  ...img,
  featured: i === 0,
  caption: img.alt,
}))

export default function ResponsiveShowcase() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      <Header
        logo="OpenSpace"
        logoHref="/"
        navLinks={NAV_LINKS}
        actions={
          <>
            <Button variant="ghost" size="sm" to="/login">Log in</Button>
            <Button size="sm" to="/register">Sign up</Button>
          </>
        }
      />

      <main id="main-content">
        {/* Hero with responsive image */}
        <Section
          eyebrow="Responsive demo"
          title="Components that scale across every device"
          subtitle="Flexbox and CSS Grid layouts, fluid typography with clamp(), adaptive images via srcSet and sizes, lazy loading, and accessible skeleton states."
          className="border-b border-[var(--border)]"
        >
          {loading ? (
            <SkeletonHero />
          ) : (
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
              <div>
                <div className="mb-6 flex flex-wrap gap-3">
                  <Button size="md" href="#gallery">View gallery</Button>
                  <Button variant="ghost" size="md" to="/">
                    Back to listings
                  </Button>
                </div>
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="list">
                  {[
                    'Mobile-first breakpoints (640 / 768 / 960 / 1200px)',
                    'object-fit cover with preserved aspect ratio',
                    'Lazy-loaded srcSet for bandwidth savings',
                    'WCAG-friendly focus rings and ARIA labels',
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-fluid-sm font-light text-[var(--grey)]"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green)]" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <ResponsiveImage
                src={DEMO_IMAGES[2].src}
                alt={DEMO_IMAGES[2].alt}
                aspectRatio="landscape"
                sizes={SIZES_FULL}
                priority
                wrapperClassName="rounded-sm border border-[var(--border)]"
              />
            </div>
          )}
        </Section>

        {/* Image gallery */}
        <Section
          id="gallery"
          title="Image gallery"
          subtitle="Tap any image to open the lightbox. Grid adapts from 1 column on mobile to 3 on desktop."
          className="bg-[var(--bg-subtle)]"
        >
          {loading ? (
            <SkeletonGallery count={6} />
          ) : (
            <ImageGallery
              images={GALLERY_IMAGES}
              columns={{ default: 1, sm: 2, lg: 3 }}
            />
          )}
        </Section>

        {/* Cards grid */}
        <Section
          id="cards"
          title="Responsive cards"
          subtitle="Reusable Card component with image, badge, meta, and footer slots."
        >
          {loading ? (
            <SkeletonCardGrid count={3} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {SAMPLE_CARDS.map((item) => (
                <Card
                  key={item.title}
                  imageSrc={item.image.src}
                  imageAlt={item.image.alt}
                  imageAspect={item.image.aspectRatio || 'video'}
                  badge={item.badge}
                  title={item.title}
                  subtitle={item.subtitle}
                  meta={
                    <>
                      <span>{item.price}</span>
                      <span>{item.beds}</span>
                    </>
                  }
                  footer={
                    <Link
                      to="/"
                      className="text-fluid-xs font-medium text-[var(--fg)] no-underline hover:underline"
                    >
                      View details →
                    </Link>
                  }
                />
              ))}
            </div>
          )}
        </Section>

        {/* Single responsive image examples */}
        <Section
          id="images"
          title="Adaptive image loading"
          subtitle="Each image uses srcSet, sizes, max-width: 100%, height: auto, and object-fit for consistent rendering."
          className="border-t border-[var(--border)] bg-[var(--bg-subtle)]"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
            <figure>
              <ResponsiveImage
                src={DEMO_IMAGES[4].src}
                alt={DEMO_IMAGES[4].alt}
                aspectRatio="4/3"
                wrapperClassName="rounded-sm border border-[var(--border)]"
              />
              <figcaption className="mt-2 text-fluid-xs text-[var(--grey)]">
                4:3 aspect — ideal for interior photos
              </figcaption>
            </figure>
            <figure>
              <ResponsiveImage
                src={DEMO_IMAGES[5].src}
                alt={DEMO_IMAGES[5].alt}
                aspectRatio="wide"
                wrapperClassName="rounded-sm border border-[var(--border)]"
              />
              <figcaption className="mt-2 text-fluid-xs text-[var(--grey)]">
                21:9 wide — hero banners on desktop
              </figcaption>
            </figure>
          </div>

          <div className="mt-10 rounded-sm border border-[var(--border)] bg-[var(--bg)] p-4 sm:p-6">
            <h3 className="mb-3 font-serif text-fluid-lg text-[var(--fg)]">
              Test in DevTools
            </h3>
            <p className="text-fluid-sm font-light leading-relaxed text-[var(--grey)]">
              Open Chrome DevTools → Toggle device toolbar → try iPhone SE, iPad, and responsive
              widths. Watch the gallery columns, card grid, header drawer, and typography scale
              fluidly without horizontal overflow.
            </p>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  )
}
