import React from 'react';
import '../ProfilePage/ProfilePage.css';

const HistoryPage: React.FC = () => {
    return (
        <div className="mobile-wrapper">
            <div className="page-container">
                <header className="page-header-simple">
                    <h2>Lịch sử đơn hàng</h2>
                </header>

                <main className="profile-content" style={{ textAlign: 'center', paddingTop: '3rem' }}>
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" style={{ margin: '0 auto 1.5rem' }}>
                        <rect x="3" y="2" width="18" height="20" rx="2" ry="2" />
                        <line x1="7" y1="7" x2="17" y2="7" />
                        <line x1="7" y1="12" x2="17" y2="12" />
                        <line x1="7" y1="17" x2="13" y2="17" />
                    </svg>
                    <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>Chưa có lịch sử</h3>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>
                        Lịch sử đơn hàng sẽ hiển thị ở đây<br />sau khi bạn hoàn thành chuyến đầu tiên
                    </p>
                </main>
            </div>
        </div>
    );
};

export default HistoryPage;
