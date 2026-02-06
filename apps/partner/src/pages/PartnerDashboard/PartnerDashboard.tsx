
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import orderService, { ORDER_STATUS_COLORS } from '../../services/orderService';
import notificationService from '../../services/notificationService';
import type { OrderResponse } from '../../services/orderService';
import './PartnerDashboard.css';

const PartnerDashboard: React.FC = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        todayOrders: 0,
        monthlyRevenue: 0,
        avgRating: 0,
        totalProducts: 45 // Hardcoded for now or fetch if API available
    });
    const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // 1. Get Restaurant ID from localStorage
                const restaurantId = localStorage.getItem('currentRestaurantId');

                if (!restaurantId) {
                    console.warn('No restaurant selected. Redirecting to selection page.');
                    setLoading(false);
                    return;
                }

                const id = Number(restaurantId);

                // 2. Fetch Recent Orders (no status filter means all statuses)
                const ordersData = await orderService.getMerchantOrders(id, undefined, 0, 5);

                // API response structure: { result: { content: [...], totalElements, ... } }
                if (ordersData?.result?.content) {
                    setRecentOrders(ordersData.result.content);
                }

                // 3. Fetch Merchant Stats
                const statsData = await orderService.getMerchantStats(id);
                if (statsData?.result) {
                    setStats({
                        todayOrders: statsData.result.ordersToday,
                        monthlyRevenue: statsData.result.totalRevenue,
                        avgRating: statsData.result.averageRating,
                        totalProducts: statsData.result.menuItems
                    });
                }

            } catch (error: any) {
                console.error("Failed to load dashboard data", error);
                console.error("Error details:", {
                    status: error.response?.status,
                    message: error.response?.data?.message,
                    data: error.response?.data
                });

                // Handle specific error cases
                if (error.response?.status === 400) {
                    const errorMsg = error.response?.data?.message || '';
                    if (errorMsg.includes('Invalid owner')) {
                        console.error('Invalid Owner ID detected.');
                        console.error('RestaurantId from localStorage:', localStorage.getItem('currentRestaurantId'));
                        // Temporarily disabled redirect to debug
                        // localStorage.removeItem('currentRestaurantId');
                        // window.location.href = '/restaurant-selection';
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Subscribe to new order notifications and refresh data
    useEffect(() => {
        const unsubscribe = notificationService.onMessage((message) => {
            console.log('[PartnerDashboard] New notification received, refreshing data...', message.title);
            // Auto-refresh dashboard when a new order notification arrives
            if (message.title.toLowerCase().includes('đơn') || message.title.toLowerCase().includes('order')) {
                // Re-fetch dashboard data
                const refreshData = async () => {
                    const restaurantId = localStorage.getItem('currentRestaurantId');
                    if (!restaurantId) return;
                    const id = Number(restaurantId);

                    try {
                        const ordersData = await orderService.getMerchantOrders(id, undefined, 0, 5);
                        if (ordersData?.result?.content) {
                            setRecentOrders(ordersData.result.content);
                        }

                        const statsData = await orderService.getMerchantStats(id);
                        if (statsData?.result) {
                            setStats({
                                todayOrders: statsData.result.ordersToday,
                                monthlyRevenue: statsData.result.totalRevenue,
                                avgRating: statsData.result.averageRating,
                                totalProducts: statsData.result.menuItems
                            });
                        }
                    } catch (error) {
                        console.error('[PartnerDashboard] Failed to refresh data:', error);
                    }
                };
                refreshData();
            }
        });

        return () => unsubscribe();
    }, []);

    const getStatusLabel = (status: string) => {
        // status is like 'CREATED', 'PAID'
        // Trans keys are in 'orders' namespace usually lowercased or exact map?
        // In vi.json: "orders": { "completed": "Hoàn thành", "preparing": "Đang nấu" ... }
        // I need to map status to key.
        const keyMap: Record<string, string> = {
            CREATED: 'new',
            PAID: 'paid',
            PREPARING: 'preparing',
            READY: 'ready',
            DELIVERING: 'delivering',
            COMPLETED: 'completed',
            CANCELED: 'canceled',
            WAITING_FOR_PICKUP: 'ready' // Map to ready or add new key
        };
        const key = keyMap[status] || 'new';
        return t(`orders.${key}`);
    };

    // Unified Icon Style
    const iconContainerStyle: React.CSSProperties = {
        width: '64px',
        height: '64px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--fastbite-primary-bg, #eff6ff)', // Fallback to light blue
        color: 'var(--fastbite-primary, #3b82f6)',
        flexShrink: 0
    };

    const svgStyle: React.CSSProperties = {
        width: '32px',
        height: '32px',
        strokeWidth: 2
    };

    return (
        <DashboardLayout pageTitle={t('dashboard.title')}>
            <div className="dashboard-welcome">
                <div className="welcome-content">
                    <h2>{t('dashboard.welcome')}!</h2>
                    <p>{t('dashboard.welcomeDesc')}</p>
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
                    <div style={iconContainerStyle}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={svgStyle}>
                            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="stat-card-info">
                        <p className="stat-card-value">{stats.todayOrders}</p>
                        <p className="stat-card-label">{t('dashboard.todayOrders')}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div style={iconContainerStyle}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={svgStyle}>
                            <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="stat-card-info">
                        <p className="stat-card-value">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.monthlyRevenue)}
                        </p>
                        <p className="stat-card-label">{t('dashboard.totalRevenue')}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div style={iconContainerStyle}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={svgStyle}>
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="stat-card-info">
                        <p className="stat-card-value">{stats.avgRating}</p>
                        <p className="stat-card-label">{t('dashboard.avgRating')}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div style={iconContainerStyle}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style={svgStyle}>
                            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <div className="stat-card-info">
                        <p className="stat-card-value">{stats.totalProducts}</p>
                        <p className="stat-card-label">{t('dashboard.menuItems')}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-section">
                <div className="section-header">
                    <h3>{t('dashboard.recentOrders')}</h3>
                    <Link to="/dashboard/orders" className="view-all-link">{t('dashboard.viewAll')} →</Link>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>{t('common.loading')}</div>
                ) : recentOrders.length > 0 ? (
                    <div className="recent-orders-list">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                                    <th style={{ padding: '16px', fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>{t('orders.orderId')}</th>
                                    <th style={{ padding: '16px', fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>{t('orders.customer')}</th>
                                    <th style={{ padding: '16px', fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>{t('orders.status')}</th>
                                    <th style={{ padding: '16px', fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>{t('orders.total')}</th>
                                    <th style={{ padding: '16px', fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>{t('orders.time')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 500 }}>#{order.id}</td>
                                        <td style={{ padding: '16px', fontSize: '0.875rem' }}>{order.customerName}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 500,
                                                backgroundColor: `${ORDER_STATUS_COLORS[order.orderStatus]}20`,
                                                color: ORDER_STATUS_COLORS[order.orderStatus]
                                            }}>
                                                {getStatusLabel(order.orderStatus)}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600 }}>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.grandTotal)}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.875rem', color: '#6b7280' }}>
                                            {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <p>{t('dashboard.noOrders')}</p>
                        <span>{t('dashboard.noOrdersDesc')}</span>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default PartnerDashboard;
