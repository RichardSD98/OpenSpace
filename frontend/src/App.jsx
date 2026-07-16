import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { AuthProvider } from './context/AuthContext'
import { DarkModeProvider } from './context/DarkModeContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import PostListing from './pages/PostListing'
import EditListing from './pages/EditListing'
import MyListings from './pages/MyListings'
import MyRequests from './pages/MyRequests'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ViewingRequests from './pages/ViewingRequests'
import Favourites from './pages/Favourites'
import ProfileSettings from './pages/ProfileSettings'
import ResponsiveShowcase from './pages/ResponsiveShowcase'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
}

function AppShell() {
  const location = useLocation()
  const hideNavbar = location.pathname === '/responsive-demo'
  const reduceMotion = useReducedMotion()

  return (
    <>
      {!hideNavbar && <Navbar />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={reduceMotion ? false : 'initial'}
          animate="animate"
          exit={reduceMotion ? undefined : 'exit'}
          variants={pageVariants}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/responsive-demo" element={<ResponsiveShowcase />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/post-listing" element={<ProtectedRoute allowedRoles={['lister']}><PostListing /></ProtectedRoute>} />
            <Route path="/edit-listing/:id" element={<ProtectedRoute allowedRoles={['lister']}><EditListing /></ProtectedRoute>} />
            <Route path="/my-listings" element={<ProtectedRoute allowedRoles={['lister']}><MyListings /></ProtectedRoute>} />
            <Route path="/my-requests" element={<ProtectedRoute allowedRoles={['renter']}><MyRequests /></ProtectedRoute>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/viewing-requests" element={<ProtectedRoute allowedRoles={['lister']}><ViewingRequests /></ProtectedRoute>} />
            <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppShell />
        </Router>
      </AuthProvider>
    </DarkModeProvider>
  )
}
