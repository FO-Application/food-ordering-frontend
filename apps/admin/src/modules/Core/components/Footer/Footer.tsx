import { useTranslation } from 'react-i18next';
import './Footer.css';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="footer">
            <div className="footer-container">
                {/* Logo Row */}
                <div className="footer-logo-row">
                    <span className="footer-logo-text">Fast Bite</span>
                </div>

                {/* Divider */}
                <div className="footer-divider"></div>

                {/* Main Grid */}
                <div className="footer-main">
                    {/* Column 1 */}
                    <div className="footer-column">
                        <a href="#" className="footer-link">{t('footer.about')}</a>
                        <a href="#" className="footer-link">Blog</a>
                    </div>

                    {/* Column 2 */}
                    <div className="footer-column">
                        <a href="#" className="footer-link">{t('footer.restaurants')}</a>
                        <a href="#" className="footer-link">{t('footer.promotions')}</a>
                    </div>

                    {/* Column 3 */}
                    <div className="footer-column">
                        <a href="#" className="footer-link">{t('footer.helpCenter')}</a>
                        <a href="#" className="footer-link">{t('footer.contact')}</a>
                    </div>

                    {/* Column 4 - Social Icons */}
                    <div className="footer-column footer-social-col">
                        <div className="footer-social">
                            {/* Facebook */}
                            <a href="#" className="footer-social-link" aria-label="Facebook">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                </svg>
                            </a>

                            {/* Instagram */}
                            <a href="#" className="footer-social-link" aria-label="Instagram">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </a>

                            {/* Twitter */}
                            <a href="#" className="footer-social-link" aria-label="Twitter">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="footer-bottom">
                    <div className="footer-app-badges">
                        <a href="#">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" />
                        </a>
                        <a href="#">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
                        </a>
                    </div>

                    <div className="footer-copyright">
                        <span>{t('footer.copyright')}</span>
                        <span>•</span>
                        <a href="#" className="footer-bottom-link">{t('footer.termsConditions')}</a>
                        <span>•</span>
                        <a href="#" className="footer-bottom-link">{t('footer.privacyPolicy')}</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
