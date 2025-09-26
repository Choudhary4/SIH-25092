import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Home = () => {
  const { t } = useTranslation()

  const features = [
    {
      key: 'buddy',
      title: 'Buddy',
      description: 'AI/Voice-based chatbot for mental health support with regional language support. Get instant guidance and severity assessment.',
      icon: '�',
      path: '/chat',
      color: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200 hover:from-teal-100 hover:to-teal-200'
    },
    {
      key: 'counsellor',
      title: 'Counsellor Talk',
      description: 'Book online chat, video call, or offline sessions with professional counsellors. Confidential and secure.',
      icon: '�‍⚕️',
      path: '/booking',
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200'
    },
    {
      key: 'peer',
      title: 'Peer Talk',
      description: 'Anonymous peer-to-peer discussion board where trained students provide guidance and support.',
      icon: '�',
      path: '/forum',
      color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200'
    },
    {
      key: 'resources',
      title: 'Resource Hub',
      description: 'Videos, relaxation audios, guides, and courses with certification options. Curated content in multiple languages.',
      icon: '�',
      path: '/resources',
      color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200'
    }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-br from-teal-50 via-white to-blue-50 rounded-2xl">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Mann-Mitra
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Digital psychological support for students - Stress-free, stigma-free, accessible mental health solution
          </p>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
            Your trusted companion for mental wellness, connecting you with AI support, professional counsellors, peer guidance, and curated resources
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/chat"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-teal-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Talk to Buddy
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
            <Link
              to="/booking"
              className="inline-flex items-center px-8 py-4 border-2 border-teal-600 text-teal-600 font-semibold rounded-xl hover:bg-teal-50 transform hover:scale-105 transition-all duration-200"
            >
              Book Counsellor
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 gap-8">
        {features.map((feature) => (
          <Link
            key={feature.key}
            to={feature.path}
            className={`group p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${feature.color}`}
          >
            <div className="flex items-start space-x-6">
              <div className="text-4xl group-hover:scale-110 transition-transform duration-200">{feature.icon}</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                <div className="mt-4 flex items-center text-blue-600 font-medium">
                  <span>Learn more</span>
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </section>

      {/* Solution Flow Section */}
      <section className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-2xl p-12 text-white shadow-2xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Our Solution Flow</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl mb-3">🔐</div>
            <p className="text-white/90">Students register anonymously via college email/roll number; only admin can view identity.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl mb-3">🤖</div>
            <p className="text-white/90">AI-powered Buddy chatbot provides support, assesses severity, and routes serious cases to counsellors.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl mb-3">👩‍⚕️</div>
            <p className="text-white/90">Students can confidentially book online/offline sessions with professional counsellors.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl mb-3">💬</div>
            <p className="text-white/90">Anonymous Peer Talk allows sharing issues, getting responses from trained peers, with content filtering.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl mb-3">📚</div>
            <p className="text-white/90">Resource Hub offers curated content and training courses with certification pathways for volunteers.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <div className="text-2xl mb-3">📊</div>
            <p className="text-white/90">Admin dashboard centralizes reports, counsellor management, student certification, and analytics.</p>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link
            to="/about"
            className="inline-flex items-center px-8 py-4 bg-white text-teal-600 font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Learn More About Our Mission
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home