import { Link } from 'react-router-dom'

/**
 * Site footer — uses existing index.css layout (footer-inner grid + responsive breakpoints).
 */
export default function Footer({
  brand = 'OpenSpace',
  brandHref = '/',
  bottomLeft,
  bottomRight = 'Built for Windhoek',
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
        </div>
      </div>

      <div className="footer-bottom">
        <p>{bottomLeft || `© ${year} ${brand} · Windhoek, Namibia`}</p>
        <p>{bottomRight}</p>
      </div>
    </footer>
  )
}
