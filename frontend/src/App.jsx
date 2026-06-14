import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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

function AppShell() {
  const { pathname } = useLocation()
  const hideNavbar = pathname === '/responsive-demo'

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/responsive-demo" element={<ResponsiveShowcase />} />
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/post-listing" element={<ProtectedRoute><PostListing /></ProtectedRoute>} />
        <Route path="/edit-listing/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
        <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
        <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/viewing-requests" element={<ProtectedRoute><ViewingRequests /></ProtectedRoute>} />
        <Route path="/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
      </Routes>
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
