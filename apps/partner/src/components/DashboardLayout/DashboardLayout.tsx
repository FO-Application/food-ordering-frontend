import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './DashboardLayout.css';
import restaurantService, { type RestaurantResponse } from '../../services/restaurantService';
import userService, { type UserProfile } from '../../services/userService';
import authService from '../../services/authService';

interface DashboardLayoutProps {
    children: React.ReactNode;
    pageTitle: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // Get restaurant ID from localStorage
            const restaurantId = localStorage.getItem('currentRestaurantId');
            if (restaurantId) {
                const restData = await restaurantService.getRestaurantById(Number(restaurantId));
                if (restData?.result) setRestaurant(restData.result);
            }

            const userData = await userService.getMyInfo();
            if (userData?.result) setUser(userData.result);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        }
    };

    const handleLogout = async () => {
        await authService.logout();
        localStorage.removeItem('currentRestaurantId');
        navigate('/login');
    };

    const getInitial = () => {
        if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'P';
    };

    const getUserDisplayName = () => {
        if (!user) return 'Đối tác';
        if (user.firstName && user.lastName) return `${user.lastName} ${user.firstName}`;
        return user.email?.split('@')[0] || 'Đối tác';
    };

    const isActive = (path: string) => location.pathname === path;

    const navItems = [
        {
            section: 'Tổng quan',
            items: [
                { path: '/dashboard', icon: 'home', label: 'Dashboard', badge: null as string | null },
                { path: '/dashboard/profile', icon: 'store', label: 'Hồ sơ nhà hàng', badge: null as string | null },
            ]
        },
        {
            section: 'Quản lý',
            items: [
                { path: '/dashboard/menu', icon: 'menu', label: 'Thực đơn', badge: null as string | null },
                { path: '/dashboard/orders', icon: 'orders', label: 'Đơn hàng', badge: '3' as string | null },
            ]
        },
        {
            section: 'Khác',
            items: [
                { path: '/dashboard/reviews', icon: 'star', label: 'Đánh giá', badge: null as string | null },
                { path: '/dashboard/settings', icon: 'settings', label: 'Cài đặt', badge: null as string | null },
            ]
        }
    ];

    const renderIcon = (iconName: string) => {
        switch (iconName) {
            case 'home':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                );
            case 'store':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                    </svg>
                );
            case 'menu':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                );
            case 'orders':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                );
            case 'star':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                );
            case 'settings':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <div className="dashboard-layout">
            {/* Sidebar Overlay for Mobile */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/restaurant-selection" className="sidebar-brand">
                        <span className="sidebar-logo">
                            <span className="accent">Fast</span>Manager
                        </span>
                    </Link>

                    {restaurant && (
                        <div className="sidebar-restaurant">
                            <p className="sidebar-restaurant-name">{restaurant.name}</p>
                            <span className={`sidebar-restaurant-status ${restaurant.isActive ? '' : 'inactive'}`}>
                                {restaurant.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                            </span>
                        </div>
                    )}
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((section, idx) => (
                        <div className="nav-section" key={idx}>
                            <p className="nav-section-title">{section.section}</p>
                            {section.items.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    {renderIcon(item.icon)}
                                    <span>{item.label}</span>
                                    {item.badge && <span className="badge">{item.badge}</span>}
                                </Link>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-user-avatar">{getInitial()}</div>
                        <div className="sidebar-user-info">
                            <p className="sidebar-user-name">{getUserDisplayName()}</p>
                            <p className="sidebar-user-role">Chủ quán</p>
                        </div>
                        <button className="sidebar-logout" onClick={handleLogout} title="Đăng xuất">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="dashboard-main">
                <header className="dashboard-header">
                    <div className="dashboard-header-left">
                        <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="12" x2="21" y2="12" />
                                <line x1="3" y1="6" x2="21" y2="6" />
                                <line x1="3" y1="18" x2="21" y2="18" />
                            </svg>
                        </button>
                        <h1 className="page-title">{pageTitle}</h1>
                    </div>

                    <div className="dashboard-header-right">
                        <button className="header-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            <span className="notification-dot"></span>
                        </button>
                        <Link to="/restaurant-selection" className="back-to-selection">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            <span>Đổi chi nhánh</span>
                        </Link>
                    </div>
                </header>

                <div className="dashboard-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
