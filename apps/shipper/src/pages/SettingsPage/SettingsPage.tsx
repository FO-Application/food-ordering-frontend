import React from 'react';
import '../ProfilePage/ProfilePage.css';

const SettingsPage: React.FC = () => {
    const settingsItems = [
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            ),
            label: 'Thông báo'
        },
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                </svg>
            ),
            label: 'Ngôn ngữ'
        },
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            ),
            label: 'Bảo mật'
        },
        {
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            ),
            label: 'Trợ giúp'
        }
    ];

    return (
        <div className="mobile-wrapper">
            <div className="page-container">
                <header className="page-header-simple">
                    <h2>Cài đặt</h2>
                </header>

                <main className="profile-content">
                    <div className="profile-info-card">
                        {settingsItems.map((item, index) => (
                            <button
                                key={index}
                                className="menu-item"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.875rem',
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: '#374151',
                                    fontSize: '0.9375rem',
                                    fontWeight: '500',
                                    transition: 'background 0.2s',
                                    borderBottom: index < settingsItems.length - 1 ? '1px solid #f3f4f6' : 'none'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</span>
                                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
