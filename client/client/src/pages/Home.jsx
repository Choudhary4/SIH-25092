import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Home = () => {
  const { t } = useTranslation()

  const features = [
    {
      key: 'screening',
      title: t('home.features.screening'),
      description: 'Take a comprehensive mental health assessment to understand your current state',
      icon: '🧠',
      path: '/screening',
      color: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200'
    },
    {
      key: 'chat',
      title: t('home.features.chat'),
      description: 'Get instant support from our AI-powered mental health assistant',
      icon: '💬',
      path: '/chat',
      color: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200'
    },
    {
      key: 'booking',
      title: t('home.features.booking'),
      description: 'Schedule appointments with licensed mental health professionals',
      icon: '📅',
      path: '/booking',
      color: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200'
    },
    {
      key: 'forum',
      title: t('home.features.forum'),
      description: 'Connect with others and share experiences in a supportive community',
      icon: '👥',
      path: '/forum',
      color: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200'
    }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            {t('home.welcome')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t('home.subtitle')}
          </p>
          <Link
            to="/screening"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {t('home.getStarted')}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
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

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-center text-white shadow-2xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your mental health journey?</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">Join thousands of users who have found support and guidance through our platform.</p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            to="/screening"
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Take Assessment
          </Link>
          <Link
            to="/chat"
            className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transform hover:scale-105 transition-all duration-200"
          >
            Chat Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home