import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    profile: any;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, profile, onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            path: '/dashboard',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
            ),
            label: 'Trang chủ'
        },
        {
            path: '/history',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
            ),
            label: 'Lịch sử'
        },
        {
            path: '/earnings',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
            ),
            label: 'Thu nhập'
        },
        {
            path: '/profile',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
            label: 'Tài khoản'
        },
        {
            path: '/settings',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 1v6m0 6v6m6-12l-3 3m-6 6l-3 3m12 0l-3-3m-6-6l-3-3" />
                </svg>
            ),
            label: 'Cài đặt'
        },
    ];

    const handleNavigate = (path: string) => {
        navigate(path);
        onClose();
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Profile Section */}
                <div className="sidebar-profile">
                    <img
                        src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.firstName || 'User'}`}
                        alt="Avatar"
                        className="sidebar-avatar"
                    />
                    <h3>{profile?.firstName} {profile?.lastName}</h3>
                    <div className="sidebar-stats">
                        <div className="stat-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                            <span>5.0</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span>0 chuyến</span>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="sidebar-menu">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => handleNavigate(item.path)}
                        >
                            <span className="menu-icon">{item.icon}</span>
                            <span className="menu-label">{item.label}</span>
                            {location.pathname === item.path && (
                                <div className="active-indicator"></div>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Logout Button */}
                <button className="logout-btn" onClick={onLogout}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Đăng xuất</span>
                </button>
            </div>
        </>
    );
};

export default Sidebar;
