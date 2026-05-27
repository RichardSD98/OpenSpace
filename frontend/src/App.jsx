import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { DarkModeProvider } from './context/DarkModeContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ListingDetail from './pages/ListingDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import PostListing from './pages/PostListing'
import EditListing from './pages/EditListing'
import MyListings from './pages/MyListings'
import MyRequests from './pages/MyRequests'
import VerifyEmail from './pages/VerifyEmail'

export default function App() {
  return (
    <DarkModeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/post-listing" element={<ProtectedRoute><PostListing /></ProtectedRoute>} />
            <Route path="/edit-listing/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
            <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
            <Route path="/my-requests" element={<ProtectedRoute><MyRequests /></ProtectedRoute>} />
            <Route path="/verify-email" element={<VerifyEmail />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--bg-muted)',
                color: 'var(--fg)',
                border: '1px solid var(--border)',
                borderRadius: '2px',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.85rem',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </DarkModeProvider>
  )
}
