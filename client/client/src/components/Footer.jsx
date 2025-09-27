import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>{t('footer.about.title', 'About Mann-Mitra')}</h3>
            <p>{t('footer.about.description', 'We provide comprehensive mental health screening and support services to help individuals get the care they need.')}</p>
          </div>
          
          <div className="footer-section">
            <h3>{t('footer.quickLinks.title', 'Quick Links')}</h3>
            <ul>
              <li><a href="/">{t('footer.quickLinks.home', 'Home')}</a></li>
              <li><a href="/screening">{t('footer.quickLinks.screening', 'Screening')}</a></li>
              <li><a href="/resources">{t('footer.quickLinks.resources', 'Resources')}</a></li>
              <li><a href="/forum">{t('footer.quickLinks.forum', 'Forum')}</a></li>
              <li><a href="/booking">{t('footer.quickLinks.booking', 'Book Appointment')}</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="text-red-600 font-semibold">{t('footer.emergency.title', '🚨 Crisis Emergency')}</h3>
            <div className="emergency-contacts bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-red-800 font-bold mb-2">IMMEDIATE HELP AVAILABLE</p>
              
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-semibold text-red-700">National Suicide Prevention Lifeline</p>
                  <p className="text-red-600">📞 <a href="tel:988" className="hover:underline font-bold">988</a></p>
                </div>
                
                <div>
                  <p className="font-semibold text-red-700">Crisis Text Line</p>
                  <p className="text-red-600">📱 Text <strong>HOME</strong> to <a href="sms:741741" className="hover:underline font-bold">741741</a></p>
                </div>
                
                <div>
                  <p className="font-semibold text-red-700">Emergency Services</p>
                  <p className="text-red-600">📞 <a href="tel:911" className="hover:underline font-bold">911</a></p>
                </div>
                
                <div className="pt-2 border-t border-red-300">
                  <p className="font-semibold text-red-700">Crisis Email Support</p>
                  <p className="text-red-600">✉️ <a href="mailto:crisis@mann-mitra.edu" className="hover:underline">crisis@mann-mitra.edu</a></p>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                <p className="text-xs text-yellow-800 font-medium">
                  If you're having thoughts of self-harm, please reach out immediately. You're not alone.
                </p>
              </div>
            </div>
          </div>
          
          <div className="footer-section">
            <h3>{t('footer.support.title', 'Support')}</h3>
            <ul>
              <li><a href="/about">{t('footer.support.about', 'About Us')}</a></li>
              <li><a href="#privacy">{t('footer.support.privacy', 'Privacy Policy')}</a></li>
              <li><a href="#terms">{t('footer.support.terms', 'Terms of Service')}</a></li>
              <li><a href="#contact">{t('footer.support.contact', 'Contact Us')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} {t('footer.copyright', 'Mental Health Support Platform. All rights reserved.')}</p>
            <div className="footer-disclaimer">
              <p><small>{t('footer.disclaimer', 'This platform is not a substitute for professional medical advice. If you are in crisis, please contact emergency services immediately.')}</small></p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;