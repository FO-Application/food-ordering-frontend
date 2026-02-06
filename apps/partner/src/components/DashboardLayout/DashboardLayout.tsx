import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './DashboardLayout.css';
import restaurantService, { type RestaurantResponse } from '../../services/restaurantService';
import userService, { type UserProfile } from '../../services/userService';
import authService from '../../services/authService';
import notificationService, { type NotificationMessage } from '../../services/notificationService';
import orderService from '../../services/orderService';

interface DashboardLayoutProps {
    children: React.ReactNode;
    pageTitle: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);

    // Notification State
    const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<NotificationMessage | null>(null);
    const unreadCount = notifications.filter(n => !n.read).length;

    // New Orders Count State
    const [newOrdersCount, setNewOrdersCount] = useState<number>(0);

    // Format currency VND
    const formatCurrency = (amount: number | string | undefined) => {
        if (!amount) return '0 đồng';
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(num)) return amount + '';
        return new Intl.NumberFormat('vi-VN').format(Math.floor(num)) + ' đồng';
    };

    // Format notification body - detect and format currency patterns
    const formatNotificationBody = (body: string) => {
        // Match patterns like "Tổng tiền: 60000.00" or "60000" or "60000.00"
        return body.replace(/(\d+(?:\.\d+)?)/g, (match) => {
            const num = parseFloat(match);
            // Only format if it looks like a currency amount (> 1000)
            if (num >= 1000) {
                return new Intl.NumberFormat('vi-VN').format(Math.floor(num)) + ' đồng';
            }
            return match;
        });
    };

    // Get notification icon based on title/type
    const getNotificationIcon = (notification: NotificationMessage) => {
        const title = notification.title.toLowerCase();
        if (title.includes('đơn hàng mới') || title.includes('đơn mới')) {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            );
        }
        if (title.includes('thanh toán') || title.includes('tiền')) {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                    <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
            );
        }
        if (title.includes('hủy')) {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            );
        }
        // Default bell icon
        return (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
        );
    };

    // Get icon color class based on notification type
    const getNotificationIconClass = (notification: NotificationMessage) => {
        const title = notification.title.toLowerCase();
        if (title.includes('đơn hàng mới') || title.includes('đơn mới')) return 'icon-order';
        if (title.includes('thanh toán') || title.includes('tiền')) return 'icon-payment';
        if (title.includes('hủy')) return 'icon-cancel';
        return 'icon-default';
    };

    // Helper function to fetch new orders count
    const fetchNewOrdersCount = async () => {
        const restaurantId = localStorage.getItem('currentRestaurantId');
        if (!restaurantId) return;

        try {
            // Fetch CREATED orders
            const createdOrders = await orderService.getMerchantOrders(
                Number(restaurantId),
                'CREATED',
                0,
                100 // Get all pending orders
            );

            // Fetch PAID orders
            const paidOrders = await orderService.getMerchantOrders(
                Number(restaurantId),
                'PAID',
                0,
                100
            );

            const createdCount = createdOrders?.result?.totalElements || 0;
            const paidCount = paidOrders?.result?.totalElements || 0;
            const totalNew = createdCount + paidCount;

            setNewOrdersCount(totalNew);
        } catch (error) {
            console.warn('[DashboardLayout] Failed to fetch new orders count:', error);
        }
    };

    useEffect(() => {
        loadData();

        // Subscribe to notifications (In-App Bell) - Only real FCM notifications
        const unsubscribe = notificationService.onMessage((message) => {
            setNotifications(prev => [message, ...prev]);

            // If the notification is about a new order, immediately refresh the order count
            if (message.title.toLowerCase().includes('đơn') || message.title.toLowerCase().includes('order')) {
                console.log('[DashboardLayout] Order notification received, refreshing order count...');
                fetchNewOrdersCount();
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    // Register Topic Subscription when Restaurant & User are loaded
    useEffect(() => {
        const registerTopic = async () => {
            if (restaurant && user && user.id) {
                try {
                    const token = await notificationService.getFcmToken();
                    if (token) {
                        await notificationService.registerToken(
                            user.id.toString(),
                            token,
                            'MERCHANT',
                            restaurant.id
                        );
                        console.log(`[Dashboard] Subscribed to topic merchant-orders-${restaurant.id}`);
                    }
                } catch (error) {
                    console.warn('[Dashboard] Failed to subscribe to topic:', error);
                }
            }
        };

        registerTopic();
    }, [restaurant, user]);

    // Load notification history when restaurant is available
    useEffect(() => {
        const loadNotificationHistory = async () => {
            if (restaurant?.id) {
                try {
                    const history = await notificationService.getHistory(restaurant.id);
                    setNotifications(history);
                    console.log(`[Dashboard] Loaded ${history.length} notifications from history`);
                } catch (error) {
                    console.warn('[Dashboard] Failed to load notification history:', error);
                }
            }
        };

        loadNotificationHistory();
    }, [restaurant]);

    // Fetch pending orders count (CREATED + PAID) on mount and periodically
    useEffect(() => {
        // Initial fetch
        fetchNewOrdersCount();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchNewOrdersCount, 30000);

        return () => clearInterval(interval);
    }, [restaurant]);

    const toggleNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    const markAsRead = async (id: string) => {
        // Update local state immediately
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
        // Persist to backend
        await notificationService.markAsRead(id);
    };

    const markAllAsRead = async () => {
        // Update local state immediately
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        // Persist to backend
        if (restaurant?.id) {
            await notificationService.markAllAsRead(restaurant.id);
        }
    };

    const deleteNotification = async (id: string) => {
        // Update local state immediately
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Persist to backend
        await notificationService.deleteNotification(id);
    };

    const deleteAllNotifications = async () => {
        // Update local state immediately
        setNotifications([]);
        // Persist to backend
        if (restaurant?.id) {
            await notificationService.deleteAllNotifications(restaurant.id);
        }
    };

    const formatTime = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Vừa xong';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

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
            section: t('sidebar.dashboard'),
            items: [
                { path: '/dashboard', icon: 'home', label: 'Dashboard', badge: null as string | null },
                { path: '/dashboard/profile', icon: 'store', label: t('sidebar.profile'), badge: null as string | null },
            ]
        },
        {
            section: t('common.edit') === 'Edit' ? 'Manage' : 'Quản lý',
            items: [
                { path: '/dashboard/menu', icon: 'menu', label: t('sidebar.menu'), badge: null as string | null },
                { path: '/dashboard/orders', icon: 'orders', label: t('sidebar.orders'), badge: newOrdersCount > 0 ? newOrdersCount.toString() : null },
            ]
        },
        {
            section: t('common.edit') === 'Edit' ? 'Finance' : 'Tài chính',
            items: [
                { path: '/dashboard/wallet', icon: 'wallet', label: t('dashboard.wallet'), badge: null as string | null },
            ]
        },
        {
            section: t('common.edit') === 'Edit' ? 'Other' : 'Khác',
            items: [
                { path: '/dashboard/reviews', icon: 'star', label: t('sidebar.reviews'), badge: null as string | null },
                { path: '/dashboard/settings', icon: 'settings', label: t('sidebar.settings'), badge: null as string | null },
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
                        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                        <path d="M7 2v20" />
                        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
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
            case 'wallet':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 12V8H6a2 2 0 0 1-2-2 2 2 0 0 1 2-2h12v4" />
                        <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
                        <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
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
                                {restaurant.isActive ? t('profile.active') : t('profile.inactive')}
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
                            <p className="sidebar-user-role">{t('profile.owner')}</p>
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
                        <div className="notification-wrapper">
                            <button
                                className={`header-btn ${showNotifications ? 'active' : ''}`}
                                onClick={toggleNotifications}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                </svg>
                                {unreadCount > 0 && <span className="notification-dot"></span>}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="notification-dropdown">
                                    <div className="notification-header">
                                        <h3>{t('dashboard.notifications')}</h3>
                                        <div className="notification-actions">
                                            {unreadCount > 0 && (
                                                <button className="mark-read-btn" onClick={markAllAsRead}>
                                                    {t('dashboard.markAsRead')}
                                                </button>
                                            )}
                                            {notifications.length > 0 && (
                                                <button className="clear-all-btn" onClick={deleteAllNotifications}>
                                                    Xóa tất cả
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <div className="notification-empty">
                                                <p>{t('dashboard.noNotifications')}</p>
                                            </div>
                                        ) : (
                                            notifications.map(notification => (
                                                <div
                                                    key={notification.id}
                                                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                                                    onClick={() => {
                                                        markAsRead(notification.id);
                                                        setSelectedNotification(notification);
                                                        setShowNotifications(false);
                                                    }}
                                                >
                                                    <div className={`notification-icon ${getNotificationIconClass(notification)}`}>
                                                        {getNotificationIcon(notification)}
                                                    </div>
                                                    <div className="notification-content">
                                                        <p className="notification-title">{notification.title}</p>
                                                        <p className="notification-body">{formatNotificationBody(notification.body)}</p>
                                                        <span className="notification-time">{formatTime(notification.receivedAt)}</span>
                                                    </div>
                                                    <button
                                                        className="notification-delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteNotification(notification.id);
                                                        }}
                                                        title="Xóa thông báo"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                            <line x1="18" y1="6" x2="6" y2="18" />
                                                            <line x1="6" y1="6" x2="18" y2="18" />
                                                        </svg>
                                                    </button>
                                                    {!notification.read && <span className="unread-indicator"></span>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link to="/restaurant-selection" className="back-to-selection">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 12H5M12 19l-7-7 7-7" />
                            </svg>
                            <span>{t('dashboard.switchBranch')}</span>
                        </Link>
                    </div>
                </header>

                <div className="dashboard-content">
                    {children}
                </div>
            </main>

            {/* Notification Detail Modal */}
            {selectedNotification && (
                <div className="notification-modal-overlay" onClick={() => setSelectedNotification(null)}>
                    <div className="notification-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="notification-modal-header">
                            <div className={`notification-modal-icon ${getNotificationIconClass(selectedNotification)}`}>
                                {getNotificationIcon(selectedNotification)}
                            </div>
                            <button className="notification-modal-close" onClick={() => setSelectedNotification(null)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="notification-modal-body">
                            <h2 className="notification-modal-title">{selectedNotification.title}</h2>
                            <p className="notification-modal-content">{formatNotificationBody(selectedNotification.body)}</p>
                            <div className="notification-modal-meta">
                                <span className="notification-modal-time">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <circle cx="12" cy="12" r="10" />
                                        <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                    {formatTime(selectedNotification.receivedAt)}
                                </span>
                            </div>
                            {selectedNotification.data?.orderId && (
                                <div className="notification-modal-actions">
                                    <button
                                        className="notification-modal-btn primary"
                                        onClick={() => {
                                            navigate('/dashboard/orders');
                                            setSelectedNotification(null);
                                        }}
                                    >
                                        Xem đơn hàng
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardLayout;
