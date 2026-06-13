import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDarkMode } from '../context/DarkModeContext'
import api from '../api/axios'

function RequestsBadge({ count }) {
  if (!count) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: '#dc2626', color: '#fff',
      fontSize: '0.6rem', fontWeight: 700, lineHeight: 1,
      minWidth: '16px', height: '16px', borderRadius: '8px',
      padding: '0 4px', marginLeft: '5px',
      verticalAlign: 'middle', position: 'relative', top: '-1px',
    }}>
      {count > 9 ? '9+' : count}
    </span>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useDarkMode()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [unseenCount, setUnseenCount] = useState(0)

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [location.pathname])

  // Fetch pending request count for listers
  useEffect(() => {
    if (user?.role !== 'lister') { setPendingCount(0); return }
    const fetch = () => {
      api.get('/view-requests/pending-count')
        .then(r => setPendingCount(r.data?.count || 0))
        .catch(() => {})
    }
    fetch()
    // Re-check whenever they navigate (they may have just acted on a request)
  }, [user, location.pathname])

  // Fetch unseen response count for renters
  useEffect(() => {
    if (user?.role !== 'renter') { setUnseenCount(0); return }
    api.get('/view-requests/unseen-count')
      .then(r => setUnseenCount(r.data?.count || 0))
      .catch(() => {})
  }, [user, location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <>
    {user && !user.isVerified && (
      <div style={{ background: '#fef3c7', color: '#92400e', textAlign: 'center', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
        Please verify your email address — check your inbox for a link from OpenSpace.
      </div>
    )}
    <nav className="site-nav">
      <a className="logo" href="/">OpenSpace</a>

      {/* Desktop nav */}
      <div className="nav-right">
        <Link to="/">Browse</Link>
        {user?.role === 'lister' && <Link to="/post-listing">List a Space</Link>}
        {user?.role === 'lister' && <Link to="/my-listings">My Listings</Link>}
        {user?.role === 'lister' && (
          <Link to="/viewing-requests" style={{ display: 'inline-flex', alignItems: 'center' }}>
            Requests<RequestsBadge count={pendingCount} />
          </Link>
        )}
        {user?.role === 'renter' && (
          <Link to="/my-requests" style={{ display: 'inline-flex', alignItems: 'center' }}>
            My Requests<RequestsBadge count={unseenCount} />
          </Link>
        )}
        {user?.role === 'renter' && <Link to="/favourites">Saved</Link>}
        {!user && <Link to="/post-listing">List a Space</Link>}
        {user && <Link to="/profile">Profile</Link>}

        <button className="dm-toggle" onClick={toggle} aria-label="Toggle dark mode">
          <Sun size={13} strokeWidth={1.8} className="dm-icon dm-sun" />
          <span className="dm-track"><span className="dm-thumb"></span></span>
          <Moon size={13} strokeWidth={1.8} className="dm-icon dm-moon" />
        </button>

        {user ? (
          <button className="nav-cta" onClick={handleLogout}>Log out</button>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register" className="nav-cta">Sign up</Link>
          </>
        )}
      </div>

      {/* Mobile right — dark toggle + hamburger */}
      <div className="nav-mobile-right">
        <button className="dm-toggle" onClick={toggle} aria-label="Toggle dark mode">
          <Sun size={13} strokeWidth={1.8} className="dm-icon dm-sun" />
          <span className="dm-track"><span className="dm-thumb"></span></span>
          <Moon size={13} strokeWidth={1.8} className="dm-icon dm-moon" />
        </button>
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen
            ? <X size={20} strokeWidth={1.8} />
            : <Menu size={20} strokeWidth={1.8} />
          }
        </button>
      </div>
    </nav>

    {/* Mobile drawer */}
    {menuOpen && (
      <div className="nav-drawer">
        <Link to="/">Browse</Link>
        {user?.role === 'lister' && <Link to="/post-listing">List a Space</Link>}
        {user?.role === 'lister' && <Link to="/my-listings">My Listings</Link>}
        {user?.role === 'lister' && (
          <Link to="/viewing-requests" style={{ display: 'flex', alignItems: 'center' }}>
            Requests<RequestsBadge count={pendingCount} />
          </Link>
        )}
        {user?.role === 'renter' && (
          <Link to="/my-requests" style={{ display: 'flex', alignItems: 'center' }}>
            My Requests<RequestsBadge count={unseenCount} />
          </Link>
        )}
        {user?.role === 'renter' && <Link to="/favourites">Saved</Link>}
        {!user && <Link to="/post-listing">List a Space</Link>}
        {user && <Link to="/profile">Profile</Link>}
        <div className="nav-drawer-bottom">
          {user ? (
            <button className="btn-main" onClick={handleLogout} style={{ width: '100%' }}>Log out</button>
          ) : (
            <>
              <Link to="/login" className="btn-ghost" style={{ textAlign: 'center' }}>Log in</Link>
              <Link to="/register" className="btn-main" style={{ textAlign: 'center' }}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    )}
    </>
  )
}

