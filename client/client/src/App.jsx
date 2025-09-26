import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Screening from './pages/Screening'
import Chat from './pages/Chat'
import Booking from './pages/Booking'
import Forum from './pages/Forum'
import SimpleForum from './pages/SimpleForum'
import Moderator from './pages/Moderator'
import Admin from './pages/Admin'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'
import About from './pages/About'
import Resources from './pages/Resources'
function App() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Routes>
        {/* Auth routes - no header */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Main app routes - with header */}
        <Route path="/*" element={
          <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/screening" element={<Screening />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/forum" element={<ErrorBoundary><Forum /></ErrorBoundary>} />
                <Route path="/moderator" element={<Moderator />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path='/about' element={<About />} />
                <Route path='/resources' element = {<Resources/>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </>
        } />
      </Routes>
    </div>
  )
}

export default App
