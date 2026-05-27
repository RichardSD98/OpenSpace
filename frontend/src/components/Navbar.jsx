import { Link, useNavigate } from 'react-router-dom'
import { Sun, Moon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDarkMode } from '../context/DarkModeContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useDarkMode()
  const navigate = useNavigate()

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
    <nav>
      <a className="logo" href="/">OpenSpace</a>

      <div className="nav-right">
        <Link to="/">Browse</Link>
        {user?.role === 'lister' && <Link to="/post-listing">List a Space</Link>}
        {user?.role === 'lister' && <Link to="/my-listings">My Listings</Link>}
        {user?.role === 'renter' && <Link to="/my-requests">My Requests</Link>}
        {!user && <Link to="/post-listing">List a Space</Link>}

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
    </nav>
    </>
  )
}
