import { useState } from 'react'
import { Link } from 'react-router-dom'

const Resources = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [enrolledCourses, setEnrolledCourses] = useState([])

  const categories = [
    { id: 'all', name: 'All Resources', icon: '📚' },
    { id: 'videos', name: 'Videos', icon: '🎥' },
    { id: 'audios', name: 'Relaxation Audios', icon: '🎧' },
    { id: 'guides', name: 'Mental Health Guides', icon: '�' },
    { id: 'courses', name: 'Training Courses', icon: '🎓' },
    { id: 'certification', name: 'Certification', icon: '🏆' }
  ]

  const resources = [
    // Videos
    {
      id: 1,
      title: "Understanding Mental Health - Hindi",
      description: "Comprehensive guide to mental health awareness in Hindi",
      type: "Video",
      category: "videos",
      duration: "15 min",
      language: "Hindi",
      image: "�",
      difficulty: "Beginner"
    },
    {
      id: 2,
      title: "Coping with Academic Stress",
      description: "Practical strategies for managing study pressure",
      type: "Video",
      category: "videos",
      duration: "12 min",
      language: "English",
      image: "🎥",
      difficulty: "All levels"
    },
    
    // Relaxation Audios
    {
      id: 3,
      title: "5-Minute Meditation - Tamil",
      description: "Quick mindfulness practice in Tamil",
      type: "Audio",
      category: "audios",
      duration: "5 min",
      language: "Tamil",
      image: "🎧",
      difficulty: "Beginner"
    },
    {
      id: 4,
      title: "Progressive Muscle Relaxation",
      description: "Full body relaxation technique for better sleep",
      type: "Audio",
      category: "audios",
      duration: "20 min",
      language: "English",
      image: "🎧",
      difficulty: "Intermediate"
    },
    {
      id: 5,
      title: "Nature Sounds for Focus",
      description: "Background sounds to improve concentration",
      type: "Audio",
      category: "audios",
      duration: "30 min",
      language: "N/A",
      image: "�",
      difficulty: "All levels"
    },

    // Mental Health Guides
    {
      id: 6,
      title: "Student Mental Health Guide",
      description: "Complete handbook for student mental wellness",
      type: "PDF Guide",
      category: "guides",
      duration: "30 min read",
      language: "English",
      image: "📖",
      difficulty: "All levels"
    },
    {
      id: 7,
      title: "Anxiety Management Workbook",
      description: "Practical exercises to manage anxiety effectively",
      type: "Interactive Guide",
      category: "guides",
      duration: "45 min",
      language: "English",
      image: "📋",
      difficulty: "Intermediate"
    },

    // Training Courses
    {
      id: 8,
      title: "Peer Support Training Course",
      description: "Become a certified peer volunteer to help other students",
      type: "Training Course",
      category: "courses",
      duration: "8 hours",
      language: "English",
      image: "🎓",
      difficulty: "Advanced",
      certification: true
    },
    {
      id: 9,
      title: "Mental Health First Aid",
      description: "Learn to recognize and respond to mental health crises",
      type: "Training Course",
      category: "courses",
      duration: "6 hours",
      language: "English",
      image: "🚑",
      difficulty: "Intermediate",
      certification: true
    },
    {
      id: 10,
      title: "Communication Skills for Support",
      description: "Develop effective listening and support skills",
      type: "Training Course",
      category: "courses",
      duration: "4 hours",
      language: "English",
      image: "💬",
      difficulty: "Beginner",
      certification: true
    }
  ]

  const certificationPath = [
    { step: 1, title: "Complete Training Modules", description: "Finish required courses" },
    { step: 2, title: "Pass Assessment Test", description: "Score 80% or higher" },
    { step: 3, title: "Counsellor Interview", description: "Professional evaluation" },
    { step: 4, title: "Admin Approval", description: "Final certification approval" },
    { step: 5, title: "Become Peer Volunteer", description: "Start helping other students" }
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

  const handleEnrollCourse = (courseId) => {
    if (!enrolledCourses.includes(courseId)) {
      setEnrolledCourses([...enrolledCourses, courseId])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Resource Hub
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Curated videos, relaxation audios, mental health guides, and training courses with certification options. 
                Available in multiple regional languages with AI-powered recommendations.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>🎥 Videos</span>
                <span>🎧 Audios</span>
                <span>📚 Guides</span>
                <span>🎓 Courses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Recommendations Section */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-8 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">🤖 AI Recommendations</h2>
              <p className="text-gray-600">Based on your recent interactions and preferences</p>
            </div>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Get Recommendations
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <span className="text-2xl mb-2 block">🎧</span>
              <h3 className="font-semibold text-gray-900">Stress Relief Audio</h3>
              <p className="text-sm text-gray-600">Recommended based on your recent chat</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <span className="text-2xl mb-2 block">📚</span>
              <h3 className="font-semibold text-gray-900">Anxiety Guide</h3>
              <p className="text-sm text-gray-600">Popular among students like you</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <span className="text-2xl mb-2 block">🎓</span>
              <h3 className="font-semibold text-gray-900">Peer Training</h3>
              <p className="text-sm text-gray-600">Help others while learning</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Resources
              </label>
              <input
                type="text"
                placeholder="Find what you need..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Certification Path */}
            {activeCategory === 'certification' && (
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 mb-6">
                <h3 className="font-semibold text-orange-900 mb-4 flex items-center">
                  <span className="mr-2">🏆</span>
                  Certification Path
                </h3>
                <div className="space-y-3">
                  {certificationPath.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-xs font-bold text-orange-600">
                        {step.step}
                      </div>
                      <div>
                        <div className="font-medium text-orange-900 text-sm">{step.title}</div>
                        <div className="text-orange-700 text-xs">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Help */}
            <div className="bg-teal-50 rounded-xl p-6 border border-teal-200">
              <h3 className="font-semibold text-teal-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Need Help?
              </h3>
              <div className="space-y-3">
                <Link to="/chat" className="block text-sm text-teal-700 hover:text-teal-800">
                  💬 Talk to Buddy
                </Link>
                <Link to="/booking" className="block text-sm text-teal-700 hover:text-teal-800">
                  👩‍⚕️ Book Counsellor
                </Link>
                <Link to="/forum" className="block text-sm text-teal-700 hover:text-teal-800">
                  👥 Peer Support
                </Link>
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

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 overflow-hidden group">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-4xl">{resource.image}</div>
                      <div className="flex items-center space-x-2">
                        {resource.language && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {resource.language}
                          </span>
                        )}
                        {resource.certification && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full">
                            🏆 Certification
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {resource.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {resource.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {resource.duration}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        resource.difficulty === 'Beginner' ? 'bg-green-100 text-green-600' :
                        resource.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-600' :
                        resource.difficulty === 'Advanced' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {resource.difficulty}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {resource.type}
                      </span>
                      
                      {resource.category === 'courses' ? (
                        enrolledCourses.includes(resource.id) ? (
                          <Link
                            to={`/certification/course/${resource.id}`}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                          >
                            Start Course
                          </Link>
                        ) : (
                          <button
                            onClick={() => handleEnrollCourse(resource.id)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                          >
                            Enroll Now
                          </button>
                        )
                      ) : (
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                          Access Now
                        </button>
                      )}
                    </div>
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