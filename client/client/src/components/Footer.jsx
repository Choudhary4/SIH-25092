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
            <h3>{t('footer.emergency.title', 'Emergency Contacts')}</h3>
            <div className="emergency-contacts">
              <p><strong>{t('footer.emergency.national', 'National Suicide Prevention')}</strong></p>
              <p>📞 988</p>
              <p><strong>{t('footer.emergency.crisis', 'Crisis Text Line')}</strong></p>
              <p>📱 Text HOME to 741741</p>
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