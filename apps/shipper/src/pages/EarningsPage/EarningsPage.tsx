import React from 'react';
import '../ProfilePage/ProfilePage.css';

const EarningsPage: React.FC = () => {
    return (
        <div className="mobile-wrapper">
            <div className="page-container">
                <header className="page-header-simple">
                    <h2>Thu nhập</h2>
                </header>

                <main className="profile-content">
                    <div className="profile-info-card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" style={{ margin: '0 auto 1rem' }}>
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: '#2563eb', fontWeight: '700' }}>0 đ</h1>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Tổng thu nhập hôm nay</p>
                    </div>

                    <div className="profile-info-card">
                        <div className="info-row">
                            <span className="info-label">Số chuyến hoàn thành</span>
                            <span className="info-value">0</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Thu nhập tuần này</span>
                            <span className="info-value">0 đ</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Thu nhập tháng này</span>
                            <span className="info-value">0 đ</span>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default EarningsPage;
