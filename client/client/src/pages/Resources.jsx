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
    <div className="min-h-screen" style={{ backgroundColor: '#F9F7F4' }}>
      {/* Hero Section - matching Home page style */}
      <section className="relative text-center py-16 rounded-2xl overflow-hidden mx-4 mt-4" style={{ backgroundColor: '#F9E6D0' }}>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold text-teal-800 mb-6">
            Resource Hub
          </h1>
          <p className="text-xl md:text-2xl text-teal-800 mb-8 max-w-3xl mx-auto leading-relaxed">
            Curated videos, relaxation audios, mental health guides, and training courses with certification options
          </p>
          <p className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto">
            Available in multiple regional languages with AI-powered recommendations to support your mental wellness journey
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-8 py-4 bg-teal-800 text-white font-semibold rounded-xl hover:bg-teal-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
              🤖 Get AI Recommendations
            </button>
            <button className="inline-flex items-center px-8 py-4 bg-teal-800 text-white font-semibold rounded-xl hover:bg-teal-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
              🏆 Start Certification
            </button>
          </div>
        </div>
      </section>

      {/* Search and Categories Section - matching Home page grid style */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-800 mb-4">Find Your Perfect Resource</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search through our curated collection or browse by category
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for videos, guides, courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-teal-800 focus:ring-2 focus:ring-teal-800 focus:ring-opacity-20 transition-all"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Categories Grid - matching Home page features style */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {categories.filter(cat => cat.id !== 'all').map((category) => (
              <div
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`group p-6 rounded-2xl border cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                  activeCategory === category.id 
                    ? 'border-teal-800 shadow-lg' 
                    : 'border-gray-200 shadow-md hover:border-teal-800'
                }`}
                style={{ backgroundColor: activeCategory === category.id ? '#F9E6D0' : '#FFFFFF' }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {category.id === 'videos' && 'Educational content and tutorials'}
                    {category.id === 'audios' && 'Meditation and relaxation sounds'}
                    {category.id === 'guides' && 'Comprehensive wellness guides'}
                    {category.id === 'courses' && 'Structured learning pathways'}
                    {category.id === 'certification' && 'Become a certified peer volunteer'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendations Section - matching Home page features style */}
      {activeCategory === 'all' && (
        <section className="px-4 py-12" style={{ backgroundColor: '#1A3438' }}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">🤖 AI-Powered Recommendations</h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Based on your interactions with Buddy and your personal wellness journey
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="text-4xl mb-4">🎧</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Stress Relief Audio</h3>
                <p className="text-gray-600 mb-6">Recommended based on your recent chat sessions</p>
                <button className="px-6 py-3 bg-teal-800 text-white rounded-xl hover:bg-teal-900 transition-colors font-semibold">
                  Listen Now
                </button>
              </div>
              
              <div className="bg-white rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Anxiety Management Guide</h3>
                <p className="text-gray-600 mb-6">Popular among students with similar concerns</p>
                <button className="px-6 py-3 bg-teal-800 text-white rounded-xl hover:bg-teal-900 transition-colors font-semibold">
                  Read Now
                </button>
              </div>
              
              <div className="bg-white rounded-2xl p-8 text-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Peer Training Course</h3>
                <p className="text-gray-600 mb-6">Help others while developing your skills</p>
                <button className="px-6 py-3 bg-teal-800 text-white rounded-xl hover:bg-teal-900 transition-colors font-semibold">
                  Start Course
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Certification Path - special section for certification category */}
      {activeCategory === 'certification' && (
        <section className="px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl p-8 border border-gray-200 shadow-lg" style={{ backgroundColor: '#F9E6D0' }}>
              <h2 className="text-3xl font-bold text-teal-800 mb-6 text-center">🏆 Certification Path</h2>
              <p className="text-lg text-gray-700 text-center mb-8">
                Become a certified peer volunteer to help other students in their mental health journey
              </p>
              
              <div className="space-y-6">
                {certificationPath.map((step, index) => (
                  <div key={index} className="flex items-start space-x-4 bg-white rounded-xl p-6 shadow-md">
                    <div className="w-10 h-10 bg-teal-800 text-white rounded-full flex items-center justify-center text-lg font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-600">{step.description}</p>
                    </div>
                    {index < certificationPath.length - 1 && (
                      <div className="w-0.5 h-8 bg-teal-800 mt-4"></div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <button className="px-8 py-4 bg-teal-800 text-white rounded-xl hover:bg-teal-900 transition-colors font-semibold text-lg">
                  Start Certification Journey
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions Section - matching Home page CTA style */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-teal-800 mb-4">Quick Actions</h2>
            <p className="text-lg text-gray-600">Need immediate support? Access these services right away</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link
              to="/chat"
              className="group p-8 rounded-2xl border border-gray-200 bg-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="text-center">
                <div className="text-teal-800 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Talk to Buddy</h3>
                <p className="text-gray-600 mb-6">Get instant AI support and guidance</p>
                <button className="px-6 py-3 bg-transparent border-2 border-teal-800 text-teal-800 rounded-xl hover:bg-teal-800 hover:text-white transition-colors font-semibold">
                  Start Chat
                </button>
              </div>
            </Link>

            <Link
              to="/booking"
              className="group p-8 rounded-2xl border border-gray-200 bg-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="text-center">
                <div className="text-teal-800 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Book Counsellor</h3>
                <p className="text-gray-600 mb-6">Schedule a session with a professional</p>
                <button className="px-6 py-3 bg-transparent border-2 border-teal-800 text-teal-800 rounded-xl hover:bg-teal-800 hover:text-white transition-colors font-semibold">
                  Book Now
                </button>
              </div>
            </Link>

            <Link
              to="/forum"
              className="group p-8 rounded-2xl border border-gray-200 bg-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
            >
              <div className="text-center">
                <div className="text-teal-800 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Peer Support</h3>
                <p className="text-gray-600 mb-6">Connect with fellow students</p>
                <button className="px-6 py-3 bg-transparent border-2 border-teal-800 text-teal-800 rounded-xl hover:bg-teal-800 hover:text-white transition-colors font-semibold">
                  Join Forum
                </button>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-teal-800 mb-4">
              {activeCategory === 'all' ? 'All Resources' : categories.find(c => c.id === activeCategory)?.name}
            </h2>
            <p className="text-gray-600">
              {filteredResources.length} resource{filteredResources.length !== 1 ? 's' : ''} available
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{resource.image}</div>
                    <div className="flex flex-col items-end space-y-2">
                      {resource.language && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                          {resource.language}
                        </span>
                      )}
                      {resource.certification && (
                        <span className="px-3 py-1 text-xs rounded-full font-medium" style={{ backgroundColor: '#F9E6D0', color: '#0F766E' }}>
                          🏆 Certification
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                    {resource.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {resource.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {resource.duration}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      resource.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                      resource.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      resource.difficulty === 'Advanced' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {resource.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                      {resource.type}
                    </span>
                    
                    {resource.category === 'courses' ? (
                      enrolledCourses.includes(resource.id) ? (
                        <Link
                          to={`/certification/course/${resource.id}`}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors"
                        >
                          Continue
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleEnrollCourse(resource.id)}
                          className="px-4 py-2 bg-teal-800 text-white rounded-xl text-sm font-semibold hover:bg-teal-900 transition-colors"
                        >
                          Enroll
                        </button>
                      )
                    ) : (
                      <button className="px-4 py-2 bg-teal-800 text-white rounded-xl text-sm font-semibold hover:bg-teal-900 transition-colors">
                        Access
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No resources found</h3>
              <p className="text-gray-600 mb-8">Try searching with different keywords or select a different category.</p>
              <button 
                onClick={() => {
                  setActiveCategory('all')
                  setSearchTerm('')
                }}
                className="px-6 py-3 bg-teal-800 text-white rounded-xl hover:bg-teal-900 transition-colors font-semibold"
              >
                Show All Resources
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Emergency Contacts Section */}
      <section className="px-4 py-12" style={{ backgroundColor: '#1A3438' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Emergency Support</h2>
          <p className="text-gray-300 mb-8">If you're experiencing a crisis, reach out immediately</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center">
                <h3 className="font-bold text-gray-900 mb-2">{contact.name}</h3>
                <p className="text-teal-800 font-semibold text-lg mb-1">{contact.number}</p>
                <p className="text-gray-600 text-sm">{contact.hours}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Resources