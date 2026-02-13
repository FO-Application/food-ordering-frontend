import { useState, useEffect, useCallback } from 'react';
import { getMyOrders, getOrderById, cancelOrder, type OrderResponse } from '../../../../services/orderService';
import notificationService from '../../../../services/notificationService';
import { getProxiedImageUrl } from '../../../../utils/urlUtils';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import ToastNotification from '../ToastNotification/ToastNotification';
import ReviewSection from '../ReviewSection/ReviewSection';
import './OrderHistorySidebar.css';

interface OrderHistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

// Order status mapping
const STATUS_MAP: Record<string, { label: string; color: string }> = {
    CREATED: { label: 'Chờ xác nhận', color: '#f59e0b' },
    CONFIRMED: { label: 'Đã xác nhận', color: '#3b82f6' },
    PREPARING: { label: 'Đang chuẩn bị', color: '#8b5cf6' },
    READY: { label: 'Sẵn sàng giao', color: '#06b6d4' },
    PICKED_UP: { label: 'Đang giao', color: '#ec4899' },
    DELIVERED: { label: 'Đã giao', color: '#10b981' },
    COMPLETED: { label: 'Hoàn thành', color: '#10b981' },
    CANCELLED: { label: 'Đã hủy', color: '#ef4444' },
    PAID: { label: 'Đã thanh toán', color: '#10b981' },
};

const OrderHistorySidebar = ({ isOpen, onClose }: OrderHistorySidebarProps) => {
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    const [orderToCancel, setOrderToCancel] = useState<number | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);

    const fetchOrders = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getMyOrders(0, 20);
            setOrders(response.content || []);
        } catch (err: any) {
            console.error('Failed to fetch orders:', err);
            setError('Không thể tải lịch sử đơn hàng');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch orders when sidebar opens
    useEffect(() => {
        if (isOpen) {
            fetchOrders();
        }
    }, [isOpen, fetchOrders]);

    // Subscribe to real-time notifications for order status updates
    useEffect(() => {
        const unsubscribe = notificationService.onMessage((message) => {
            console.log('[OrderHistorySidebar] Notification received:', message.title);
            // Check if notification is related to order status change
            if (message.title.toLowerCase().includes('đơn') ||
                message.title.toLowerCase().includes('order') ||
                message.data?.type === 'ORDER_STATUS_CHANGED' ||
                message.data?.orderId) {
                console.log('[OrderHistorySidebar] Order-related notification, refreshing orders...');
                fetchOrders();

                // If viewing a specific order detail, refresh that too
                if (selectedOrder && message.data?.orderId === String(selectedOrder.id)) {
                    getOrderById(selectedOrder.id).then(setSelectedOrder).catch(console.error);
                }
            }
        });
        return () => unsubscribe();
    }, [fetchOrders, selectedOrder]);

    const handleViewDetail = async (orderId: number) => {
        try {
            const order = await getOrderById(orderId);
            setSelectedOrder(order);
        } catch (err) {
            console.error('Failed to fetch order details:', err);
        }
    };

    const confirmCancelOrder = (orderId: number) => {
        setOrderToCancel(orderId);
        setIsConfirmOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!orderToCancel) return;

        setIsCancelling(true);
        setIsConfirmOpen(false); // Close modal immediately or wait? Better close and show loading

        try {
            await cancelOrder(orderToCancel);
            // Refresh orders
            await fetchOrders();
            setSelectedOrder(null);
            setToastMessage('Đã hủy đơn hàng thành công!');
        } catch (err: any) {
            console.error('Failed to cancel order:', err);
            setToastMessage(err.response?.data?.message || 'Không thể hủy đơn hàng. Đơn hàng có thể đã được xử lý.');
        } finally {
            setIsCancelling(false);
            setOrderToCancel(null);
        }
    };

    const getStatusInfo = (status: string) => {
        return STATUS_MAP[status] || { label: status, color: '#6b7280' };
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price: number) => {
        return price?.toLocaleString('vi-VN') + ' ₫';
    };

    if (!isOpen) return null;

    return (
        <>
            {toastMessage && (
                <ToastNotification
                    message={toastMessage}
                    type={toastMessage.includes('thành công') ? 'success' : 'error'}
                    onClose={() => setToastMessage(null)}
                />
            )}

            <ConfirmationModal
                isOpen={isConfirmOpen}
                title="Hủy đơn hàng"
                message="Bạn có chắc muốn hủy đơn hàng này?"
                onConfirm={handleConfirmCancel}
                onCancel={() => { setIsConfirmOpen(false); setOrderToCancel(null); }}
                confirmText="Xác nhận hủy"
                cancelText="Quay lại"
                isDangerous={true}
            />

            <div className="order-history-overlay" onClick={onClose} />
            <div className="order-history-sidebar">
                {/* Header */}
                <div className="order-history-header">
                    <div className="order-history-title-row">
                        {selectedOrder ? (
                            <button className="back-btn" onClick={() => setSelectedOrder(null)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 18 9 12 15 6" />
                                </svg>
                            </button>
                        ) : null}
                        <h2>{selectedOrder ? `Đơn hàng #${selectedOrder.id}` : 'Lịch sử đơn hàng'}</h2>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="order-history-content">
                    {isLoading ? (
                        <div className="order-loading">
                            <div className="loading-spinner-large" />
                            <p>Đang tải...</p>
                        </div>
                    ) : error ? (
                        <div className="order-error">
                            <p>{error}</p>
                            <button onClick={fetchOrders}>Thử lại</button>
                        </div>
                    ) : selectedOrder ? (
                        /* Order Detail View */
                        <div className="order-detail">
                            {/* Status */}
                            <div className="order-detail-status" style={{ backgroundColor: getStatusInfo(selectedOrder.orderStatus).color + '20' }}>
                                <span className="status-dot" style={{ backgroundColor: getStatusInfo(selectedOrder.orderStatus).color }} />
                                <span style={{ color: getStatusInfo(selectedOrder.orderStatus).color }}>
                                    {getStatusInfo(selectedOrder.orderStatus).label}
                                </span>
                            </div>

                            {/* Restaurant */}
                            <div className="order-detail-section">
                                <h4>Nhà hàng</h4>
                                <div className="order-restaurant-info">
                                    {selectedOrder.merchantLogo && (
                                        <img src={getProxiedImageUrl(selectedOrder.merchantLogo)} alt="" />
                                    )}
                                    <span>{selectedOrder.merchantName}</span>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="order-detail-section">
                                <h4>Các món đã đặt</h4>
                                <div className="order-items-list">
                                    {selectedOrder.orderItems?.map((item, idx) => (
                                        <div key={idx} className="order-item-row">
                                            <span className="item-qty">{item.quantity}x</span>
                                            <span className="item-name">{item.productName}</span>
                                            <span className="item-price">{formatPrice(item.totalPrice)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="order-detail-section">
                                <h4>Địa chỉ giao hàng</h4>
                                <p className="order-address">{selectedOrder.deliveryAddress}</p>
                            </div>

                            {/* Pricing */}
                            <div className="order-detail-section order-pricing">
                                <div className="pricing-row">
                                    <span>Tạm tính</span>
                                    <span>{formatPrice(selectedOrder.subTotal)}</span>
                                </div>
                                <div className="pricing-row">
                                    <span>Phí giao hàng ({selectedOrder.distanceKm?.toFixed(1)} km)</span>
                                    <span>{formatPrice(selectedOrder.shippingFee)}</span>
                                </div>
                                {selectedOrder.discountAmount > 0 && (
                                    <div className="pricing-row discount">
                                        <span>Giảm giá</span>
                                        <span>-{formatPrice(selectedOrder.discountAmount)}</span>
                                    </div>
                                )}
                                <div className="pricing-row total">
                                    <span>Tổng cộng</span>
                                    <span>{formatPrice(selectedOrder.grandTotal)}</span>
                                </div>
                            </div>

                            {/* Payment & Time */}
                            <div className="order-detail-section order-meta">
                                <div className="meta-row">
                                    <span>Thanh toán</span>
                                    <span>{selectedOrder.paymentMethod === 'COD' ? 'Tiền mặt' : selectedOrder.paymentMethod}</span>
                                </div>
                                <div className="meta-row">
                                    <span>Thời gian đặt</span>
                                    <span>{formatDate(selectedOrder.createdAt)}</span>
                                </div>
                            </div>

                            {/* Cancel Button - Only for CREATED status */}
                            {selectedOrder.orderStatus === 'CREATED' && (
                                <button
                                    className="cancel-order-btn"
                                    onClick={() => confirmCancelOrder(selectedOrder.id)}
                                    disabled={isCancelling}
                                >
                                    {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                                </button>
                            )}

                            {/* Review Button - Only for COMPLETED/DELIVERED orders */}
                            {(selectedOrder.orderStatus === 'COMPLETED' || selectedOrder.orderStatus === 'DELIVERED') && (
                                selectedOrder.review ? (
                                    <button
                                        className="review-order-btn reviewed"
                                        onClick={() => setShowReviewModal(true)}
                                    >
                                        Xem đánh giá của bạn
                                    </button>
                                ) : (
                                    <button
                                        className="review-order-btn"
                                        onClick={() => setShowReviewModal(true)}
                                    >
                                        Đánh giá đồ ăn
                                    </button>
                                )
                            )}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="order-empty">
                            <div className="empty-icon">📋</div>
                            <h4>Chưa có đơn hàng nào</h4>
                            <p>Các đơn hàng của bạn sẽ hiển thị ở đây</p>
                        </div>
                    ) : (
                        /* Order List */
                        <div className="order-list">
                            {orders.map(order => (
                                <div
                                    key={order.id}
                                    className="order-card"
                                    onClick={() => handleViewDetail(order.id)}
                                >
                                    <div className="order-card-header">
                                        <span className="order-id">#{order.id}</span>
                                        <span
                                            className="order-status-badge"
                                            style={{
                                                backgroundColor: getStatusInfo(order.orderStatus).color + '20',
                                                color: getStatusInfo(order.orderStatus).color
                                            }}
                                        >
                                            {getStatusInfo(order.orderStatus).label}
                                        </span>
                                    </div>
                                    <div className="order-card-restaurant">
                                        {order.merchantLogo && (
                                            <img src={getProxiedImageUrl(order.merchantLogo)} alt="" className="restaurant-logo" />
                                        )}
                                        <span>{order.merchantName}</span>
                                    </div>
                                    <div className="order-card-info">
                                        <span className="order-items-count">
                                            {order.orderItems?.length || 0} món
                                        </span>
                                        <span className="order-total">{formatPrice(order.grandTotal)}</span>
                                    </div>
                                    <div className="order-card-date">{formatDate(order.createdAt)}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal - Rendered outside sidebar for proper overlay */}
            {showReviewModal && selectedOrder && (
                <>
                    <div className="review-modal-overlay" onClick={() => setShowReviewModal(false)} />
                    <div className="review-modal">
                        <div className="review-modal-header">
                            <h3>Đánh giá đơn hàng #{selectedOrder.id}</h3>
                            <button className="review-modal-close" onClick={() => setShowReviewModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <div className="review-modal-restaurant">
                            {selectedOrder.merchantLogo && (
                                <img src={getProxiedImageUrl(selectedOrder.merchantLogo)} alt="" />
                            )}
                            <span>{selectedOrder.merchantName}</span>
                        </div>
                        <ReviewSection
                            orderId={selectedOrder.id}
                            existingReview={selectedOrder.review || null}
                            onReviewSubmitted={async () => {
                                const updated = await getOrderById(selectedOrder.id);
                                setSelectedOrder(updated);
                                setShowReviewModal(false);
                                setToastMessage('Đánh giá thành công! Cảm ơn bạn 🎉');
                            }}
                        />
                    </div>
                </>
            )}
        </>
    );
};

export default OrderHistorySidebar;
