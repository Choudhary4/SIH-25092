import { Routes, Route } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Header from './components/Header'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminLogin from './pages/AdminLogin'
import AdminSignup from './pages/AdminSignup'
import CounsellorLogin from './pages/CounsellorLogin'
import Screening from './pages/Screening'
import Chat from './pages/Chat'
import Booking from './pages/Booking'
import Forum from './pages/Forum'
import SimpleForum from './pages/SimpleForum'
import Moderator from './pages/Moderator'
import Admin from './pages/Admin'
import AdminDashboard from './pages/AdminDashboard'
import AdminDashboardNew from './pages/AdminDashboardNew'
import CounsellorDashboard from './pages/CounsellorDashboard'
import NotFound from './pages/NotFound'
import About from './pages/About'
import Resources from './pages/Resources'
import Footer from './components/Footer'
import StudentDashboard from './components/dashboards/StudentDashboard'

function App() {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Routes>
        {/* Auth routes - no header */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/counsellor/login" element={<CounsellorLogin />} />
        
        {/* Dashboard routes - no header */}
        <Route path="/admin/dashboard" element={<AdminDashboardNew />} />
        <Route path="/counsellor/dashboard" element={<CounsellorDashboard />} />
        
        {/* Main app routes - with header */}
        <Route path="/*" element={
          <>
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/screening" element={<Screening />} />
                <Route path='/dashboard' element = {<StudentDashboard/>}/>
                <Route path="/chat" element={<Chat />} />
                <Route path="/booking" element={<Booking />} />
                <Route path="/forum" element={<ErrorBoundary><Forum /></ErrorBoundary>} />
                <Route path="/moderator" element={<Moderator />} />
                <Route path="/admin" element={<Admin />} />
                <Route path='/about' element={<About />} />
                <Route path='/resources' element = {<Resources/>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  )
}

export default App
