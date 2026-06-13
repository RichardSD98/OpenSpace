import { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Container from './Container'
import Button from './Button'

/**
 * Fully responsive site header with mobile drawer navigation.
 * Uses semantic HTML, ARIA attributes, and Flexbox layout.
 */
export default function Header({
  logo = 'OpenSpace',
  logoHref = '/',
  navLinks = [],
  actions,
  sticky = true,
  className = '',
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const toggleMenu = useCallback(() => setMenuOpen((o) => !o), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  return (
    <header
      className={[
        sticky ? 'sticky top-0 z-[100]' : '',
        'border-b border-[var(--border)] bg-[var(--bg)]',
        className,
      ].filter(Boolean).join(' ')}
    >
      <Container
        as="div"
        className="flex h-14 items-center justify-between gap-4 sm:h-[3.75rem]"
      >
        <Link
          to={logoHref}
          className="font-serif text-fluid-lg font-medium tracking-tight text-[var(--fg)] no-underline shrink-0"
          aria-label={`${logo} home`}
        >
          {logo}
        </Link>

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-6 md:flex lg:gap-8"
          aria-label="Main navigation"
        >
          {navLinks.map(({ label, to, href }) =>
            to ? (
              <Link
                key={label}
                to={to}
                className="relative text-fluid-xs text-[var(--grey)] no-underline transition-colors hover:text-[var(--fg)] after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-[var(--fg)] after:transition-all hover:after:w-full"
              >
                {label}
              </Link>
            ) : (
              <a
                key={label}
                href={href}
                className="relative text-fluid-xs text-[var(--grey)] no-underline transition-colors hover:text-[var(--fg)]"
              >
                {label}
              </a>
            )
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {actions}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="flex items-center justify-center rounded-sm p-2 text-[var(--fg)] md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg)]"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {menuOpen ? <X size={22} strokeWidth={1.8} /> : <Menu size={22} strokeWidth={1.8} />}
        </button>
      </Container>

      {/* Mobile drawer */}
      <div
        id="mobile-nav-drawer"
        className={[
          'fixed inset-x-0 top-14 z-[99] border-b border-[var(--border)] bg-[var(--bg)] md:hidden',
          'transition-all duration-300 ease-out',
          menuOpen ? 'visible opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-2 pointer-events-none',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        hidden={!menuOpen}
      >
        <Container as="nav" className="flex flex-col py-4" aria-label="Mobile navigation">
          {navLinks.map(({ label, to, href }) =>
            to ? (
              <Link
                key={label}
                to={to}
                onClick={closeMenu}
                className="border-b border-[var(--border)] py-3.5 text-fluid-sm text-[var(--fg)] no-underline last:border-b-0"
              >
                {label}
              </Link>
            ) : (
              <a
                key={label}
                href={href}
                onClick={closeMenu}
                className="border-b border-[var(--border)] py-3.5 text-fluid-sm text-[var(--fg)] no-underline last:border-b-0"
              >
                {label}
              </a>
            )
          )}
          {actions && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {actions}
            </div>
          )}
        </Container>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 top-14 z-[98] bg-black/20 md:hidden"
          aria-label="Close navigation menu"
          onClick={closeMenu}
        />
      )}
    </header>
  )
}

export function HeaderActions({ children }) {
  return <>{children}</>
}

export function HeaderCta({ children, ...props }) {
  return (
    <Button size="sm" {...props}>
      {children}
    </Button>
  )
}
