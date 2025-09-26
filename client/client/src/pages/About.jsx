import { Link } from 'react-router-dom'

const About = () => {
  const features = [
    {
      title: "Anonymous & Safe",
      description: "Your privacy is our priority. Use all features without revealing your identity.",
      icon: "🔒"
    },
    {
      title: "Culturally Aware",
      description: "Built understanding Indian student culture, family dynamics, and academic pressures.",
      icon: "🇮🇳"
    },
    {
      title: "24/7 Available",
      description: "Get support whenever you need it - during exams, late nights, or weekends.",
      icon: "⏰"
    },
    {
      title: "Professional Backup",
      description: "AI support backed by real counselors when you need human intervention.",
      icon: "👥"
    }
  ]

  const team = [
    {
      name: "Dr. Priya Sharma",
      role: "Clinical Psychologist",
      qualification: "Ph.D. Clinical Psychology, AIIMS",
      focus: "Student mental health and crisis intervention"
    },
    {
      name: "Rajesh Kumar",
      role: "Lead Developer",
      qualification: "M.Tech Computer Science, IIT Delhi",
      focus: "AI/ML and secure platform development"
    },
    {
      name: "Meera Patel",
      role: "Peer Support Coordinator", 
      qualification: "M.A. Psychology, Jamia Millia",
      focus: "Training student volunteers and community building"
    }
  ]

  const stats = [
    { number: "25,000+", label: "Students helped" },
    { number: "500+", label: "Trained peer volunteers" },
    { number: "50+", label: "Partner colleges" },
    { number: "95%", label: "Satisfaction rate" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About Mann-Mitra
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We're building India's most trusted mental health platform for students. 
            Born from the understanding that student mental health needs are unique, 
            urgent, and often unaddressed.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Every student deserves access to mental health support without barriers, 
                stigma, or judgment. We're creating a space where seeking help is as 
                normal as asking for academic help.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform combines AI-powered immediate support with human expertise, 
                peer connections, and culturally sensitive resources designed specifically 
                for the Indian student experience.
              </p>
              <Link
                to="/chat"
                className="inline-flex items-center bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Experience Our Platform
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Why We Started</h3>
              <div className="space-y-4 text-gray-600">
                <p className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">•</span>
                  <span>1 in 4 Indian students experience mental health challenges</span>
                </p>
                <p className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">•</span>
                  <span>Most wait months or never seek help due to stigma</span>
                </p>
                <p className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">•</span>
                  <span>Existing services aren't designed for student life</span>
                </p>
                <p className="flex items-start">
                  <span className="text-emerald-600 mr-3 mt-1">•</span>
                  <span>Crisis situations need immediate, always-available support</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            What Makes Us Different
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Impact
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Meet Our Team
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-emerald-600 font-medium mb-2">{member.role}</p>
                <p className="text-sm text-gray-600 mb-3">{member.qualification}</p>
                <p className="text-xs text-gray-500">{member.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Empathy First</h3>
              <p className="text-gray-600">Every interaction is guided by genuine care and understanding.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Trust & Safety</h3>
              <p className="text-gray-600">Your privacy and safety are never compromised.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-3">Always Improving</h3>
              <p className="text-gray-600">We continuously evolve based on student needs and feedback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Questions About Our Platform?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            We're here to help. Reach out to learn more about how Mann-Mitra can support your college community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/chat"
              className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
            >
              Try Our Platform
            </Link>
            <a
              href="mailto:hello@Mann-Mitra.edu"
              className="border-2 border-emerald-600 text-emerald-600 px-8 py-3 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
            >
              Contact Us
            </a>
          </div>
          
          <div className="mt-12 pt-8 border-t border-emerald-200">
            <p className="text-sm text-gray-600">
              <strong>For Institutions:</strong> Interested in implementing Mann-Mitra at your college? 
              We provide training, support, and customization for institutional partnerships.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About