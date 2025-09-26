import { useState } from 'react'
import { Link } from 'react-router-dom'

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: 'All Resources', icon: '📚' },
    { id: 'stress', name: 'Stress Management', icon: '😌' },
    { id: 'anxiety', name: 'Anxiety Support', icon: '🧘‍♂️' },
    { id: 'sleep', name: 'Better Sleep', icon: '😴' },
    { id: 'academic', name: 'Academic Pressure', icon: '📖' },
    { id: 'social', name: 'Social Skills', icon: '👥' }
  ]

  const resources = [
    {
      id: 1,
      title: "5-Minute Breathing Exercise",
      description: "Quick relaxation technique for instant calm",
      type: "Audio Guide",
      category: "stress",
      duration: "5 min",
      difficulty: "Beginner",
      image: "🎧"
    },
    {
      id: 2,
      title: "Exam Anxiety Toolkit",
      description: "Strategies to manage pre-exam nerves",
      type: "PDF Guide",
      category: "anxiety",
      duration: "15 min read",
      difficulty: "Intermediate",
      image: "📄"
    },
    {
      id: 3,
      title: "Progressive Muscle Relaxation",
      description: "Full body relaxation for better sleep",
      type: "Video",
      category: "sleep",
      duration: "20 min",
      difficulty: "Beginner",
      image: "🎥"
    },
    {
      id: 4,
      title: "Time Management for Students",
      description: "Balance studies, work, and personal life",
      type: "Interactive Course",
      category: "academic",
      duration: "45 min",
      difficulty: "All levels",
      image: "⏰"
    },
    {
      id: 5,
      title: "Building Confidence in Social Situations",
      description: "Tips for better social interactions",
      type: "Article Series",
      category: "social",
      duration: "10 min read",
      difficulty: "Intermediate",
      image: "💬"
    },
    {
      id: 6,
      title: "Mindful Study Sessions",
      description: "Focus techniques for better learning",
      type: "Audio Guide",
      category: "academic",
      duration: "12 min",
      difficulty: "Beginner",
      image: "🎧"
    }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const emergencyContacts = [
    { name: "Campus Counseling Center", number: "ext. 2345", hours: "Mon-Fri 9AM-5PM" },
    { name: "24/7 Crisis Helpline", number: "1-800-273-8255", hours: "Available 24/7" },
    { name: "Student Emergency Line", number: "ext. 911", hours: "Available 24/7" }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Hub</h1>
          <p className="text-gray-600 max-w-2xl">
            Self-help tools, guides, and resources to support your mental wellness journey. 
            All materials are created specifically for student life.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Resources
              </label>
              <input
                type="text"
                placeholder="Find what you need..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
              <h3 className="font-semibold text-red-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Need Immediate Help?
              </h3>
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-red-900">{contact.name}</div>
                    <div className="text-red-700">{contact.number}</div>
                    <div className="text-red-600 text-xs">{contact.hours}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Link
                to="/screening"
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
              >
                <div className="text-blue-600 mb-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Take Assessment</h3>
                <p className="text-sm text-gray-600">Quick mental health check-in</p>
              </Link>

              <Link
                to="/chat"
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-green-300"
              >
                <div className="text-green-600 mb-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Talk to Buddy</h3>
                <p className="text-sm text-gray-600">Get instant AI support</p>
              </Link>

              <Link
                to="/forum"
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-300"
              >
                <div className="text-purple-600 mb-3">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Join Community</h3>
                <p className="text-sm text-gray-600">Connect with peers</p>
              </Link>
            </div>

            {/* Resources Grid */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {activeCategory === 'all' ? 'All Resources' : categories.find(c => c.id === activeCategory)?.name}
                <span className="text-sm font-normal text-gray-500 ml-2">({filteredResources.length} resources)</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{resource.image}</div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {resource.type}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {resource.duration}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        {resource.difficulty}
                      </span>
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                      Access Resource
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                <p className="text-gray-600">Try adjusting your search or category filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Resources