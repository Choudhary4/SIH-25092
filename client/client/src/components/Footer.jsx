import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  // Define the main background and text colors
  const bgColor = 'bg-[#F9E6D0]'; // Light peach/sand color
  const textColor = 'text-[#2A3F47]'; // Dark teal text for contrast
  const linkColor = 'text-teal-700 hover:text-teal-900 transition-colors'; // Teal for links

  return (
    // Main Footer: Light peach background with dark text
    <footer className={`${bgColor} ${textColor} pt-16 border-t border-gray-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12">
          
          {/* Section 1: About Mann-Mitra */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4">
              {t('footer.about.title', 'About Mann-Mitra')}
            </h3>
            <p className="text-sm leading-relaxed text-gray-700">
              {t('footer.about.description', 'We provide comprehensive mental health screening and support services to help individuals get the care they need.')}
            </p>
          </div>
          
          {/* Section 2: Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks.title', 'Quick Links')}</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a href="/" className={linkColor}>{t('footer.quickLinks.home', 'Home')}</a></li>
              <li><a href="/screening" className={linkColor}>{t('footer.quickLinks.screening', 'Screening')}</a></li>
              <li><a href="/resources" className={linkColor}>{t('footer.quickLinks.resources', 'Resources')}</a></li>
              <li><a href="/forum" className={linkColor}>{t('footer.quickLinks.forum', 'Forum')}</a></li>
              <li><a href="/booking" className={linkColor}>{t('footer.quickLinks.booking', 'Book Appointment')}</a></li>
            </ul>
          </div>
          
          {/* Section 3: Crisis Emergency - Highly Visible/Contrasting */}
          <div className="lg:col-span-2"> {/* Takes up more space on large screens */}
            <h3 className="text-2xl font-bold text-red-700 mb-4">
              {t('footer.emergency.title', '🚨 Crisis Emergency')}
            </h3>
            {/* The crisis box uses a dark, high-contrast background to ensure it stands out */}
            <div className="bg-[#2A3F47] p-5 rounded-xl border-2 border-red-500 shadow-xl">
              <p className="text-red-400 font-extrabold mb-3 uppercase tracking-wider">IMMEDIATE HELP AVAILABLE</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                
                {/* Contact: Lifeline */}
                <div>
                  <p className="font-semibold text-white">National Suicide Prevention Lifeline</p>
                  <p className="text-red-500 text-lg">📞 <a href="tel:988" className="hover:underline font-bold">988</a></p>
                </div>
                
                {/* Contact: Crisis Text */}
                <div>
                  <p className="font-semibold text-white">Crisis Text Line</p>
                  <p className="text-red-500 text-lg">📱 Text <strong>HOME</strong> to <a href="sms:741741" className="hover:underline font-bold">741741</a></p>
                </div>
                
                {/* Contact: Emergency Services */}
                <div>
                  <p className="font-semibold text-white">Emergency Services</p>
                  {/* Using blue for 911/emergency number for distinct look */}
                  <p className="text-blue-400 text-lg">📞 <a href="tel:911" className="hover:underline font-bold">911</a></p> 
                </div>
                
                {/* Contact: Crisis Email */}
                <div>
                  <p className="font-semibold text-white">Crisis Email Support</p>
                  <p className="text-blue-400 text-lg">✉️ <a href="mailto:crisis@mann-mitra.edu" className="hover:underline">crisis@mann-mitra.edu</a></p>
                </div>
              </div>
              
              {/* Alert Disclaimer */}
              <div className="mt-5 p-3 bg-yellow-600/30 border border-yellow-500 rounded-lg">
                <p className="text-xs text-yellow-100 font-medium">
                  If you're having thoughts of self-harm, please reach out immediately. You're not alone.
                </p>
              </div>
            </div>
          </div>
          
          {/* Section 4: Support */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4">{t('footer.support.title', 'Support')}</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li><a href="/about" className={linkColor}>{t('footer.support.about', 'About Us')}</a></li>
              <li><a href="#privacy" className={linkColor}>{t('footer.support.privacy', 'Privacy Policy')}</a></li>
              <li><a href="#terms" className={linkColor}>{t('footer.support.terms', 'Terms of Service')}</a></li>
              <li><a href="#contact" className={linkColor}>{t('footer.support.contact', 'Contact Us')}</a></li>
            </ul>
          </div>
          
        </div>
        
        {/* Footer Bottom: Copyright and Disclaimer */}
        <div className="py-6 border-t border-gray-300 text-center md:text-left">
          <div className="md:flex md:justify-between md:items-center text-xs space-y-3 md:space-y-0">
            <p className="text-gray-600">
              &copy; {currentYear} {t('footer.copyright', 'Mental Health Support Platform. All rights reserved.')}
            </p>
            <div className="footer-disclaimer max-w-lg md:text-right md:ml-auto">
              <p className="text-gray-500">
                <small>
                  {t('footer.disclaimer', 'This platform is not a substitute for professional medical advice. If you are in crisis, please contact emergency services immediately.')}
                </small>
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </footer>
  );
};

export default Footer;