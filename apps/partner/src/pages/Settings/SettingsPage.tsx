import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import './Settings.css';

const SettingsPage: React.FC = () => {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;

    // Notification State
    const [settings, setSettings] = useState({
        newOrder: true,
        reviews: true,
        email: false
    });

    useEffect(() => {
        const savedSettings = localStorage.getItem('partner_settings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => {
            const newState = { ...prev, [key]: !prev[key] };
            localStorage.setItem('partner_settings', JSON.stringify(newState));
            return newState;
        });
    };

    const handleLanguageChange = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    return (
        <DashboardLayout pageTitle={t('sidebar.settings')}>
            <div className="settings-page">
                {/* LANGUAGE SECTION */}
                <div className="settings-section">
                    <h3 className="settings-section-title">
                        {currentLang === 'vi' ? 'Ngôn ngữ' : 'Language'}
                    </h3>
                    <p className="settings-section-desc">
                        {currentLang === 'vi'
                            ? 'Chọn ngôn ngữ hiển thị cho ứng dụng'
                            : 'Choose the display language for the application'}
                    </p>

                    <div className="language-options">
                        <button
                            className={`language-option ${currentLang === 'vi' ? 'active' : ''}`}
                            onClick={() => handleLanguageChange('vi')}
                        >
                            <span className="lang-flag">🇻🇳</span>
                            <div className="lang-info">
                                <span className="lang-name">Tiếng Việt</span>
                                <span className="lang-native">Vietnamese</span>
                            </div>
                            {currentLang === 'vi' && <span className="lang-check">✓</span>}
                        </button>

                        <button
                            className={`language-option ${currentLang === 'en' ? 'active' : ''}`}
                            onClick={() => handleLanguageChange('en')}
                        >
                            <span className="lang-flag">🇺🇸</span>
                            <div className="lang-info">
                                <span className="lang-name">English</span>
                                <span className="lang-native">Tiếng Anh</span>
                            </div>
                            {currentLang === 'en' && <span className="lang-check">✓</span>}
                        </button>
                    </div>
                </div>

                {/* NOTIFICATION SECTION */}
                <div className="settings-section">
                    <h3 className="settings-section-title">
                        {currentLang === 'vi' ? 'Thông báo' : 'Notifications'}
                    </h3>
                    <p className="settings-section-desc">
                        {currentLang === 'vi'
                            ? 'Quản lý cài đặt thông báo'
                            : 'Manage notification settings'}
                    </p>

                    <div className="settings-options">
                        <label className="setting-toggle">
                            <span>{currentLang === 'vi' ? 'Thông báo đơn hàng mới' : 'New order notifications'}</span>
                            <input
                                type="checkbox"
                                checked={settings.newOrder}
                                onChange={() => toggleSetting('newOrder')}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                        <label className="setting-toggle">
                            <span>{currentLang === 'vi' ? 'Thông báo đánh giá' : 'Review notifications'}</span>
                            <input
                                type="checkbox"
                                checked={settings.reviews}
                                onChange={() => toggleSetting('reviews')}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                        <label className="setting-toggle">
                            <span>{currentLang === 'vi' ? 'Thông báo email' : 'Email notifications'}</span>
                            <input
                                type="checkbox"
                                checked={settings.email}
                                onChange={() => toggleSetting('email')}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                    </div>
                </div>

                {/* ABOUT SECTION */}
                <div className="settings-section">
                    <h3 className="settings-section-title">
                        {currentLang === 'vi' ? 'Về ứng dụng' : 'About'}
                    </h3>
                    <div className="about-info">
                        <div className="about-row">
                            <span>{currentLang === 'vi' ? 'Phiên bản' : 'Version'}</span>
                            <span>1.0.0</span>
                        </div>
                        <div className="about-row">
                            <span>{currentLang === 'vi' ? 'Bản quyền' : 'Copyright'}</span>
                            <span>© 2026 Fast Bite</span>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
