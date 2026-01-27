import React from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import './PartnerDashboard.css';

const PartnerDashboard: React.FC = () => {
    return (
        <DashboardLayout pageTitle="Dashboard">
            <div className="dashboard-welcome">
                <div className="welcome-content">
                    <h2>Chào mừng trở lại!</h2>
                    <p>Quản lý nhà hàng của bạn từ đây. Xem thống kê, đơn hàng và nhiều hơn nữa.</p>
                </div>
                <div className="welcome-image">
                    <img
                        src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
                        alt="Restaurant atmosphere"
                    />
                </div>
            </div>

            <div className="dashboard-stats-grid">
                <div className="stat-card">
                    <div className="stat-card-icon orders">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </div>
                    <div className="stat-card-info">
                        <p className="stat-card-value">12</p>
                        <p className="stat-card-label">Đơn hàng hôm nay</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon revenue">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                    </div>
                    <div className="stat-card-info">
                        <p className="stat-card-value">2.4M</p>
                        <p className="stat-card-label">Doanh thu tháng</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon rating">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <div className="stat-card-info">
                        <p className="stat-card-value">4.8</p>
                        <p className="stat-card-label">Đánh giá trung bình</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-icon products">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    </div>
                    <div className="stat-card-info">
                        <p className="stat-card-value">45</p>
                        <p className="stat-card-label">Món trong thực đơn</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h3>Đơn hàng gần đây</h3>
                    <a href="/dashboard/orders" className="view-all-link">Xem tất cả →</a>
                </div>
                <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <p>Chưa có đơn hàng nào hôm nay</p>
                    <span>Các đơn hàng mới sẽ xuất hiện ở đây</span>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default PartnerDashboard;
