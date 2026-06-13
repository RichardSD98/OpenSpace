import { Link } from 'react-router-dom'

const defaultColumns = [
  {
    title: 'Browse',
    links: [
      { label: 'All listings', to: '/' },
      { label: 'Apartments', to: '/' },
      { label: 'Bachelor Flats', to: '/' },
      { label: 'Single Rooms', to: '/' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'Sign up', to: '/register' },
      { label: 'Sign in', to: '/login' },
      { label: 'Post a listing', to: '/post-listing' },
      { label: 'About OpenSpace', href: '/' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of service', href: '/' },
      { label: 'Privacy policy', href: '/' },
      { label: 'Cookie policy', href: '/' },
    ],
  },
]

/**
 * Site footer — uses existing index.css layout (footer-inner grid + responsive breakpoints).
 */
export default function Footer({
  brand = 'OpenSpace',
  brandHref = '/',
  tagline = 'A simple platform connecting landlords and renters across Windhoek, Namibia. Browse free. List free.',
  columns = defaultColumns,
  bottomLeft,
  bottomRight = 'Built for Windhoek',
  showNeab = true,
  className = '',
}) {
  const year = new Date().getFullYear()

  return (
    <footer className={className} role="contentinfo">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to={brandHref} className="logo">
            {brand}
          </Link>
          <p>{tagline}</p>
          {showNeab && <span className="neab">NEAB Member</span>}
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h4>{col.title}</h4>
            <ul>
              {col.links.map(({ label, to, href }) => (
                <li key={label}>
                  {to ? (
                    <Link to={to}>{label}</Link>
                  ) : (
                    <a href={href}>{label}</a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>{bottomLeft || `© ${year} ${brand} · Windhoek, Namibia`}</p>
        <p>{bottomRight}</p>
      </div>
    </footer>
  )
}
