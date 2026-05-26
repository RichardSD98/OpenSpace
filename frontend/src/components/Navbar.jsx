import { Link, useNavigate } from 'react-router-dom'
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
    <nav>
      <a className="logo" href="/">OpenSpace</a>

      <div className="nav-right">
        <Link to="/">Browse</Link>
        {user?.role === 'lister' && <Link to="/post-listing">List a Space</Link>}
        {user?.role === 'lister' && <Link to="/my-listings">My Listings</Link>}
        {user?.role === 'renter' && <Link to="/my-requests">My Requests</Link>}
        {!user && <Link to="/post-listing">List a Space</Link>}

        <button className="dm-toggle" onClick={toggle} aria-label="Toggle dark mode">
          <span className="dm-icon dm-sun">☀</span>
          <span className="dm-track"><span className="dm-thumb"></span></span>
          <span className="dm-icon dm-moon">☽</span>
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
  )
}
