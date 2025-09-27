import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import image1 from '../assets/illustration_1.png'
import image2 from '../assets/illustration_2.png'
import image3 from '../assets/illustration_6.png'
import image4 from '../assets/illustration_10.png'
import image5 from '../assets/illustration.png'

const Home = () => {
  const { t } = useTranslation()

  const features = [
    {
      key: 'buddy',
      title: 'Buddy',
      // The description from the image is shorter
      description: 'An AI-powered, voice-enabled chatbot offering confidential mental health first aid in multiple regional languages.',
      path: '/chat',
      bgColor: '#F9E6D0'
    },
    {
      key: 'resources',
      title: 'Resource Hub',
      description: 'Videos, relaxation audios, guides, and courses with certification option. Curated content in multiple languages.',
      path: '/resources',
      bgColor: '#FFFFFF'
    },
    {
      key: 'peer',
      title: 'Peer Talk',
      // The description from the image is longer and has two paragraphs
      description: 'Anonymously connect with fellow students in a safe, moderated space. Share experiences and find support from a community that understands. Our discussions are guided by trained peer supporters to ensure conversations are always constructive and empathetic.',
      path: '/forum',
      bgColor: '#FFFFFF'
    },
    {
      key: 'counsellor',
      title: 'Counsellor Talk',
      description: 'Book online chat, video call, or online sessions with professional counsellors. Confidential and secure.',
      path: '/booking',
      bgColor: '#F9E6D0'
    }
];

const featuresData = [
    {
        title: 'Verified Anonymity',
        description: 'Verify your student status with your college ID. You will be anonymous to all peers. Your identity is held confidentially by an admin for emergency situations only.',
        buttonText: 'Explore',
        buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
    },
    {
        title: 'Smart First-Aid Chatbot',
        description: 'Get instant support and severity assessment from our AI, with direct referrals to counsellors for serious cases.',
        buttonText: 'Explore',
        buttonColor: 'bg-teal-400 hover:bg-teal-500',
    },
    {
        title: 'Secure Appointments',
        description: 'Privately book online or in-person sessions with our professional counsellors. All bookings are strictly confidential.',
        buttonText: 'Explore',
        buttonColor: 'bg-pink-300 hover:bg-pink-400',
    },
    {
        title: 'Guided Peer Support',
        description: 'Share issues anonymously in our safe, filtered forum. Trained peers provide guidance and help maintain a supportive, judgment-free environment.',
        buttonText: 'Explore',
        buttonColor: 'bg-[#2A3F47] hover:bg-[#1E2D33] text-white', // Dark teal/charcoal button
    },
    {
        title: 'Learn & Get Certified',
        description: 'Access a library of wellness guides, audios, and videos. Complete our training pathways to earn your certificate and volunteer as a peer supporter.',
        buttonText: 'Explore',
        buttonColor: 'bg-orange-400 hover:bg-orange-500',
    },
    {
        title: 'Centralized Admin Portal',
        description: 'Manage counsellors, certify student volunteers, and view anonymous wellness analytics and reports from a single, secure interface.',
        buttonText: 'Explore',
        buttonColor: 'bg-blue-500 hover:bg-blue-600',
    },
];


  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative text-center py-16 rounded-2xl overflow-hidden" style={{ backgroundColor: '#F9E6D0' }}>
        {/* Image 1 - Right Corner */}
        <img
          src={image1}
          alt="Illustration 1"
          className="absolute top-0 right-0 h-124 w-auto z-0"
        />
        {/* Image 2 - Left Corner */}
        <img
          src={image2}
          alt="Illustration 2"
          className="absolute bottom-0 left-0 h-124 w-auto z-0"
        />

        <div className="max-w-4xl mx-auto px-6 relative z-10"> {/* Added relative z-10 to ensure text is above images */}
          <h1 className="text-5xl md:text-7xl font-bold text-teal-800 mb-6">
            Mann-Mitra
          </h1>
          <p className="text-xl md:text-2xl text-teal-800 mb-8 max-w-3xl mx-auto leading-relaxed">
            Digital psychological support for students - Stress-free, stigma-free, accessible mental health solution
          </p>
          <p className="text-lg text-[#404040] mb-10 max-w-2xl mx-auto">
            Your trusted companion for mental wellness, connecting you with AI support, professional counsellors, peer guidance, and curated resources
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/chat"
              className="inline-flex items-center px-8 py-4 bg-teal-800 text-white font-semibold rounded-xl hover:bg-teal-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Talk To Buddy
            </Link>
            <Link
              to="/booking"
              className="inline-flex items-center px-8 py-4 bg-teal-800 text-white font-semibold rounded-xl hover:bg-teal-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Book Counsellor
            </Link>
          </div>
        </div>
      </section>
      <section className="relative grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden" > {/* Removed shadow-lg */}
    {/* Left Section - Text Content with light gray background to mimic the image */}
    <div className="p-12 flex flex-col justify-center bg-gray-100/70"> {/* Changed to light gray for the section's background color */}
        <p className="text-sm font-semibold text-gray-600 mb-2">HOW IT WORKS</p>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            We Help You<br />Prioritize Your<br />Mental Health
        </h2>
        <p className="text-lg text-gray-700 mb-8 max-w-md">
            Book online chat, video call, or online sessions with professional counsellors.
            Confidential and Secure
        </p>
        <Link
            to="/booking"
            className="inline-flex items-center px-8 py-4 bg-teal-800 text-white font-semibold rounded-xl hover:bg-teal-900 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl w-fit"
        >
            Counsellor Talk
        </Link>
    </div>

    {/* Right Section - Image without a dark green background, reduced vertical space, and NO background color */}
    <div className="relative bg-[#1A3438] flex items-center justify-center p-8"> {/* No explicit background color */}
        <img
            src={image5}
            alt="Illustration of a person with complex thoughts"
            className="max-w-xs h-auto object-contain"
        />
    </div>
</section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-2 gap-8">
    {/* The grid will display all four features in two rows */}
    {features.map((feature) => (
        <Link
            key={feature.key}
            to={feature.path}
            // Apply the custom background color using inline style
            style={{ backgroundColor: feature.bgColor }}
            // Use classes for border, rounded corners, shadow, and hover effects
            className={`group p-8 rounded-2xl border transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${feature.bgColor === '#FFFFFF' ? 'shadow-md border-gray-100' : 'shadow-lg border-transparent'}`}
        >
            <div className="flex flex-col h-full"> {/* Use flex-col and h-full to push the button to the bottom */}
                {/* Text Content */}
                <div className="flex-1">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-700 leading-relaxed">
                        {/* Split the Peer Talk description into two parts if it contains the second sentence */}
                        {feature.key === 'peer' && feature.description.split('. ').length > 1 
                            ? (
                                <>
                                    {feature.description.split('. ')[0]}.<br/><br/>
                                    {feature.description.split('. ').slice(1).join('. ')}
                                </>
                            )
                            : feature.description
                        }
                    </p>
                </div>

                {/* Learn More Button - Styled to match the image */}
                <div className="mt-8"> {/* Added margin-top to separate button from text */}
                    <button className={`inline-flex items-center px-6 py-3 text-base font-semibold rounded-xl border-2 transition-colors duration-200 
                        ${feature.bgColor === '#FFFFFF' 
                            ? 'bg-transparent border-gray-400 text-gray-800 hover:border-teal-700 hover:text-teal-700' 
                            : 'bg-transparent border-gray-700 text-gray-700 hover:border-teal-700 hover:text-teal-700'
                        }`}
                    >
                        Learn More
                    </button>
                </div>
            </div>
            {/* Note: Illustrations/icons are not included as they require separate image components. */}
        </Link>
    ))}
</section>

      {/* Solution Flow Section */}
      <section className="py-16 md:py-24">
    {/* Header Section: Centered title and subtitle, with 'EXPLORE & LEARN' tag */}
    <div className="max-w-4xl mx-auto text-center mb-16">
        <p className="text-sm font-semibold tracking-widest text-teal-700 uppercase mb-2">
            EXPLORE & LEARN
        </p>
        <h2 className="text-4xl md:text-5xl font-extrabold text-[#2A3F47] mb-4 leading-tight">
            Resources for<br />Your Well-being
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore expert insights, self-care guides, and tools to support your mental health.
        </p>
    </div>

    {/* Features Grid: 3 columns with light cards */}
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {featuresData.map((feature, index) => (
            <div
                key={index}
                className="bg-white rounded-3xl p-8 flex flex-col items-start shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]"
            >
                {/* Feature Title */}
                <h3 className="text-2xl font-bold text-[#2A3F47] mb-3">
                    {feature.title}
                </h3>
                
                {/* Feature Description */}
                <p className="text-gray-600 mb-8 flex-grow">
                    {feature.description}
                </p>
                
                {/* Explore Button */}
                <button
                    // The button color is dynamically set from the data array
                    className={`inline-flex items-center px-6 py-3 font-semibold rounded-xl text-white shadow-md transition-colors duration-200 w-full justify-center 
                        ${feature.buttonColor}`}
                >
                    {feature.buttonText}
                </button>
            </div>
        ))}
    </div>
</section>
    </div>
  )
}

export default Home