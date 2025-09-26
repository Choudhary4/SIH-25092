import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { FiUser, FiLogIn, FiMessageSquare, FiBookOpen, FiUsers, FiHelpCircle, FiGlobe } from 'react-icons/fi'
import LanguageSwitcher from './common/LanguageSwitcher'

const navItems = [
  {
    path: '/chat',
    label: 'Buddy',
    icon: <FiMessageSquare />
  },
  {
    path: '/booking',
    label: 'Counsellor Talk',
    icon: <FiHelpCircle />
  },
  {
    path: '/forum',
    label: 'Peer Talk',
    icon: <FiUsers />
  },
  {
    path: '/resources',
    label: 'Resource Hub',
    icon: <FiBookOpen />
  },
  {
    path: '/about',
    label: 'About',
    icon: <FiGlobe />
  }
]

const Header = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const isActivePath = (path) => location.pathname.startsWith(path)

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16">

          {/* Logo as Home Link */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer">
              <span className="text-white font-bold text-lg select-none">MM</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent hidden sm:block">
              Mann-Mitra
            </span>
          </Link>

          {/* Navbar links */}
          <nav className="flex flex-1 items-center space-x-1 ml-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActivePath(item.path)
                    ? 'bg-teal-100 text-teal-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}
                  `}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right side – profile menu and toggler */}
          <div className="flex items-center space-x-1">

            {isAuthenticated ? (
              <div className="relative">
                <button
                  className="flex items-center space-x-2 px-3 py-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen((open) => !open)}
                  aria-label="User menu"
                  aria-expanded={isDropdownOpen}
                >
                  <FiUser className="w-6 h-6" />
                  <span className="hidden md:block">{user?.firstName || 'User'}</span>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <button
                      className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setIsDropdownOpen(false)
                        navigate('/about')
                      }}
                    >
                      <FiHelpCircle className="mr-2" /> <span>{t('nav.about')}</span>
                    </button>
                    <div className="px-4 py-2 hover:bg-gray-50">
                      <LanguageSwitcher />
                    </div>
                    <button
                      className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        logout()
                        setIsDropdownOpen(false)
                      }}
                    >
                      <FiLogIn className="mr-2" /> <span>{t('auth.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                onClick={() => navigate('/login')}
              >
                <FiLogIn className="mr-2" />
                <span>{t('auth.login')}</span>
              </button>
            )}

            <button
              onClick={() => setIsMenuOpen((open) => !open)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors ml-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* MOBILE NAV */}
        {isMenuOpen && (
          <nav className="lg:hidden border-t border-gray-200 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActivePath(item.path)
                    ? 'bg-teal-100 text-teal-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
            <button
              className="flex items-center px-4 py-3 w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              onClick={() => {
                setIsMenuOpen(false)
                navigate('/about')
              }}
            >
              <FiHelpCircle className="mr-2" />
              <span>{t('nav.about')}</span>
            </button>
            <div className="px-4 py-2">
              <LanguageSwitcher />
            </div>
            {!isAuthenticated && (
              <button
                className="flex items-center px-4 py-3 w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                onClick={() => {
                  setIsMenuOpen(false)
                  navigate('/login')
                }}
              >
                <FiLogIn className="mr-2" />
                <span>{t('auth.login')}</span>
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header
