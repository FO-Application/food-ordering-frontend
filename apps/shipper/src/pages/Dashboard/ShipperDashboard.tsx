import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import shipperService from '../../services/shipperService';
import authService from '../../services/authService';
import { initializePushNotifications, OrderPushData } from '../../services/notificationService';
import ShipperMap from '../../components/ShipperMap';
import Sidebar from '../../components/Sidebar';
import './Dashboard.css';

interface OrderState {
    id: number;
    status: 'ACCEPTED' | 'DELIVERING' | 'COMPLETED';
}

interface OrderDetail {
    id: number;
    restaurantName: string;
    restaurantAddress: string;
    customerName: string;
    customerAddress: string;
    totalAmount: number;
    items: any[];
}

interface PendingOrder {
    orderId: string;
    pickupAddress: string;
    shippingFee: string;
    lat?: string;
    lon?: string;
}

const ShipperDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState(false);
    const [location, setLocation] = useState({ lat: 21.028511, lon: 105.854444 });
    const [currentOrder, setCurrentOrder] = useState<OrderState | null>(null);
    const [orderDetail, setOrderDetail] = useState<OrderDetail | null>(null);
    const [profile, setProfile] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pendingOrder, setPendingOrder] = useState<PendingOrder | null>(null);
    const [notificationEnabled, setNotificationEnabled] = useState(false);

    // Load profile and initialize notifications
    useEffect(() => {
        loadProfile();
        setupGeolocation();
    }, []);

    // Initialize FCM when profile is loaded
    useEffect(() => {
        if (profile?.id && !notificationEnabled) {
            setupNotifications(profile.id);
        }
    }, [profile]);

    const loadProfile = async () => {
        try {
            const data = await shipperService.getProfile();
            setProfile(data.result);

            // Check if vehicle registered
            try {
                await shipperService.getShipperProfile();
            } catch (err: any) {
                // If 400/404/500 -> Likely not registered
                console.warn("Shipper profile not found, redirecting to register...");
                navigate('/vehicle-register');
            }
        } catch (error) {
            console.error("Load profile error", error);
        }
    };

    const setupGeolocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setLocation({ lat: latitude, lon: longitude });
                },
                (err) => console.error("GPS Error", err),
                { enableHighAccuracy: true }
            );
        }
    };

    const setupNotifications = async (userId: number) => {
        const success = await initializePushNotifications(
            userId,
            (orderData: OrderPushData) => {
                // Called when new order push is received
                console.log('[Dashboard] New order received from FCM:', orderData);
                setPendingOrder({
                    orderId: orderData.orderId,
                    pickupAddress: orderData.pickupAddress || 'Đang tải...',
                    shippingFee: orderData.shippingFee || '0',
                    lat: orderData.lat,
                    lon: orderData.lon
                });
            }
        );
        setNotificationEnabled(success);
        if (success) {
            console.log('[Dashboard] Push notifications enabled');
        }
    };

    // Update location when online
    useEffect(() => {
        if (isOnline) {
            updateLocation(location.lat, location.lon);
        }
    }, [isOnline, location]);

    const updateLocation = async (lat: number, lon: number) => {
        try {
            await shipperService.updateLocation(lat, lon);
        } catch (e) { }
    };

    const toggleStatus = async () => {
        try {
            if (isOnline) {
                await shipperService.goOffline();
                setIsOnline(false);
                setPendingOrder(null);
            } else {
                await shipperService.updateLocation(location.lat, location.lon);
                setIsOnline(true);
            }
        } catch (err) {
            alert('Lỗi chuyển trạng thái');
        }
    };

    const fetchOrderDetails = async (id: number) => {
        try {
            const data = await shipperService.getOrderDetails(id);
            setOrderDetail(data.result);
        } catch (error) {
            console.error("Fetch details failed", error);
        }
    };

    const handleAcceptOrder = async (orderId: string) => {
        if (!orderId) return;
        try {
            await shipperService.acceptOrder(Number(orderId));
            setCurrentOrder({ id: Number(orderId), status: 'ACCEPTED' });
            fetchOrderDetails(Number(orderId));
            setPendingOrder(null);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Lỗi nhận đơn');
        }
    };

    const handleRejectOrder = () => {
        setPendingOrder(null);
    };

    const handlePickedUp = async () => {
        if (!currentOrder) return;
        try {
            await shipperService.pickedUpOrder(currentOrder.id);
            setCurrentOrder({ ...currentOrder, status: 'DELIVERING' });
        } catch (err: any) {
            alert('Lỗi cập nhật');
        }
    };

    const handleComplete = async () => {
        if (!currentOrder) return;
        try {
            await shipperService.completeOrder(currentOrder.id);
            setCurrentOrder(null);
            setOrderDetail(null);
            alert('Đã giao thành công!');
        } catch (err: any) {
            alert('Lỗi hoàn thành');
        }
    };

    const handleLogout = () => {
        if (window.confirm('Đăng xuất khỏi thiết bị?')) {
            authService.logout();
            navigate('/login');
        }
    };

    let destination = null;
    if (orderDetail && currentOrder) {
        if (currentOrder.status === 'ACCEPTED') {
            destination = { lat: location.lat + 0.001, lon: location.lon + 0.001, type: 'STORE' as const };
        } else if (currentOrder.status === 'DELIVERING') {
            destination = { lat: location.lat - 0.002, lon: location.lon + 0.002, type: 'CUSTOMER' as const };
        }
    }

    return (
        <div className="mobile-wrapper">
            <div className="dashboard-container">
                <ShipperMap location={location} destination={destination} />

                <Sidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    profile={profile}
                    onLogout={handleLogout}
                />

                <div className="top-bar-overlay">
                    <div className="income-pill">
                        <span className="amount">0</span>
                        <span className="unit">đ</span>
                    </div>

                    <button
                        className="profile-pill"
                        onClick={() => setSidebarOpen(true)}
                        style={{ cursor: 'pointer', border: 'none', padding: 0 }}
                    >
                        <img
                            src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.firstName || 'User'}`}
                            alt="Avatar"
                            className="avatar"
                        />
                    </button>
                </div>

                <div className="bottom-panel">
                    {/* Offline State */}
                    {!isOnline && (
                        <div className="offline-state">
                            <div className="status-text">Bạn đang ngoại tuyến</div>
                            <button className="power-btn" onClick={toggleStatus}>
                                Bật kết nối
                            </button>
                            {!notificationEnabled && (
                                <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.5rem', textAlign: 'center' }}>
                                    Vui lòng cho phép thông báo để nhận đơn
                                </p>
                            )}
                        </div>
                    )}

                    {/* Online - Searching for orders */}
                    {isOnline && !currentOrder && !pendingOrder && (
                        <div className="online-state">
                            <div className="radar-animation"></div>
                            <div className="status-text online">Đang chờ đơn hàng...</div>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem', textAlign: 'center' }}>
                                {notificationEnabled ? 'Bạn sẽ nhận thông báo khi có đơn mới' : 'Đang kết nối...'}
                            </p>
                            <button className="stop-btn" onClick={toggleStatus}>Tắt kết nối</button>
                        </div>
                    )}

                    {/* Incoming Order - From FCM Push */}
                    {pendingOrder && (
                        <div className="incoming-order-alert">
                            <h3>Có đơn hàng mới!</h3>
                            <div className="order-card" style={{ marginBottom: '1rem' }}>
                                <div className="location-row">
                                    <div className="dot start"></div>
                                    <div className="addr-text">
                                        {pendingOrder.pickupAddress}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                                    <span style={{ color: '#6b7280' }}>Đơn #{pendingOrder.orderId}</span>
                                    <span style={{ color: '#10b981', fontWeight: '600' }}>
                                        +{Number(pendingOrder.shippingFee).toLocaleString()}đ
                                    </span>
                                </div>
                            </div>
                            <div className="row-2">
                                <button className="reject-btn" onClick={handleRejectOrder}>Bỏ qua</button>
                                <button className="accept-btn" onClick={() => handleAcceptOrder(pendingOrder.orderId)}>
                                    Nhận đơn
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Active Order */}
                    {currentOrder && orderDetail && (
                        <div className="order-state">
                            <div className="order-card">
                                <div className="order-header">
                                    <span className="order-badge">
                                        {currentOrder.status === 'ACCEPTED' ? 'Đang lấy hàng' : 'Đang giao'}
                                    </span>
                                    <span className="order-price">#{currentOrder.id}</span>
                                </div>
                                <div className="location-row">
                                    <div className="dot start"></div>
                                    <div className="addr-text">
                                        {orderDetail.restaurantName}
                                        <br /><small>{orderDetail.restaurantAddress}</small>
                                    </div>
                                </div>
                                <div className="location-row">
                                    <div className="dot end"></div>
                                    <div className="addr-text">
                                        {orderDetail.customerName}
                                        <br /><small>{orderDetail.customerAddress}</small>
                                    </div>
                                </div>
                            </div>

                            <div className="slider-action-area">
                                {currentOrder.status === 'ACCEPTED' && (
                                    <button className="swipe-btn bg-green" onClick={handlePickedUp}>
                                        ĐÃ LẤY HÀNG
                                    </button>
                                )}
                                {currentOrder.status === 'DELIVERING' && (
                                    <button className="swipe-btn bg-blue" onClick={handleComplete}>
                                        ĐÃ GIAO HÀNG
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShipperDashboard;
