import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './Header.css';
import { CartDropdown } from '../CartDropdown';
import { AuthModal } from '../../../Auth/components/AuthModal';
import { UserProfileModal } from '../UserProfileModal';
import { clearAllCookies } from '../../../../utils/cookie';
import userService, { type UserProfile } from '../../../../services/userService';
import authService from '../../../../services/authService';

const Header = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // User state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const currentLang = i18n.language;

  // Fetch current user on component mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    console.log('[Header] Starting fetchCurrentUser...');
    try {
      setIsLoadingUser(true);
      const response = await userService.getCurrentUser();
      console.log('[Header] userService.getCurrentUser response:', response);

      if (response && response.result) {
        console.log('[Header] Setting user state:', response.result);
        setUser(response.result);
      } else {
        console.warn('[Header] Response missing result:', response);
      }
    } catch (err: any) {
      // User not logged in or token expired
      console.error('[Header] fetchCurrentUser error:', err);
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const openAuth = () => {
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    setIsUserMenuOpen(false);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const handleLoginSuccess = () => {
    // Refresh user data after successful login
    fetchCurrentUser();
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('[Header] Logout API failed:', err);
    } finally {
      // Always clear local state and cookies
      clearAllCookies();
      setUser(null);
      setIsUserMenuOpen(false);
      console.log('[Header] Logged out successfully');

      // Optional: Redirect to home or reload
      // window.location.reload(); 
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  const toggleLangDropdown = () => {
    setIsLangDropdownOpen(!isLangDropdownOpen);
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return `${user.firstName} ${user.lastName}`.trim() || user.email;
  };

  return (
    <>
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          {/* Logo - GrabFood style */}
          <Link to="/" className="header-logo">
            <span className="header-logo-text">
              <span className="logo-fast">Fast</span>
              <span className="logo-bite">Bite</span>
            </span>
          </Link>

          {/* Desktop Actions - Clean Icons */}
          <div className="header-actions">
            <button className="header-btn-icon" aria-label="Cart" onClick={toggleCart}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6h15l-1.5 9h-12L6 6z" />
                <circle cx="9" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
                <path d="M6 6L5 3H2" />
              </svg>
            </button>

            {/* User Section - Show login button or user menu */}
            {!isLoadingUser && (
              <>
                {user ? (
                  <div className="header-user-wrapper">
                    <button className="header-user-btn" onClick={toggleUserMenu}>
                      <div className="user-avatar">
                        {user.firstName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="user-name">{getUserDisplayName()}</span>
                      <span className={`user-arrow ${isUserMenuOpen ? 'open' : ''}`}>▼</span>
                    </button>

                    {isUserMenuOpen && (
                      <div className="user-dropdown">
                        <div className="user-dropdown-header">
                          <p className="user-dropdown-name">{getUserDisplayName()}</p>
                          <p className="user-dropdown-email">{user.email}</p>
                        </div>
                        <div className="user-dropdown-divider"></div>
                        <button className="user-dropdown-item" onClick={openProfileModal}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                          {t('header.profile') || 'Tài khoản'}
                        </button>
                        <button className="user-dropdown-item" onClick={() => {/* Navigate to orders */ }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 6h15l-1.5 9h-12L6 6z" />
                            <circle cx="9" cy="20" r="1" />
                            <circle cx="18" cy="20" r="1" />
                            <path d="M6 6L5 3H2" />
                          </svg>
                          {t('header.orders') || 'Đơn hàng'}
                        </button>
                        <div className="user-dropdown-divider"></div>
                        <button className="user-dropdown-item logout" onClick={handleLogout}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                          </svg>
                          {t('header.logout') || 'Đăng xuất'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button className="header-btn-auth" onClick={openAuth}>{t('header.login')}</button>
                )}
              </>
            )}

            {/* Language Selector Dropdown */}
            <div className="header-lang-wrapper">
              <button className="header-lang-selector" onClick={toggleLangDropdown}>
                <span>{currentLang.toUpperCase()}</span>
                <span className={`lang-arrow ${isLangDropdownOpen ? 'open' : ''}`}>▼</span>
              </button>

              {isLangDropdownOpen && (
                <div className="lang-dropdown">
                  <button
                    className={`lang-option ${currentLang === 'en' ? 'active' : ''}`}
                    onClick={() => changeLanguage('en')}
                  >
                    🇺🇸 English
                  </button>
                  <button
                    className={`lang-option ${currentLang === 'vi' ? 'active' : ''}`}
                    onClick={() => changeLanguage('vi')}
                  >
                    🇻🇳 Tiếng Việt
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`header-mobile-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Navigation */}
        <nav className={`header-mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="header-mobile-actions">
            {user ? (
              <>
                <div className="mobile-user-info" onClick={openProfileModal}>
                  <div className="user-avatar large">
                    {user.firstName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="mobile-user-name">{getUserDisplayName()}</p>
                    <p className="mobile-user-email">{user.email}</p>
                  </div>
                </div>
                <button className="header-btn-auth full-width logout" onClick={handleLogout}>
                  {t('header.logout') || 'Đăng xuất'}
                </button>
              </>
            ) : (
              <button className="header-btn-auth full-width" onClick={openAuth}>{t('header.login')}</button>
            )}
            <div className="mobile-lang-selector">
              <button
                className={`mobile-lang-btn ${currentLang === 'en' ? 'active' : ''}`}
                onClick={() => changeLanguage('en')}
              >
                EN
              </button>
              <button
                className={`mobile-lang-btn ${currentLang === 'vi' ? 'active' : ''}`}
                onClick={() => changeLanguage('vi')}
              >
                VN
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Cart Dropdown */}
      <CartDropdown isOpen={isCartOpen} onClose={closeCart} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={closeAuth}
        onLoginSuccess={handleLoginSuccess}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        user={user}
        onUserUpdated={fetchCurrentUser}
      />
    </>
  );
};

export default Header;
