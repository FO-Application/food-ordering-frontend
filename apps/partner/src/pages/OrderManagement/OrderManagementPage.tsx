import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import orderService, {
    type OrderResponse,
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    ORDER_STATUS_COLORS
} from '../../services/orderService';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './OrderManagement.css';

const OrderManagementPage: React.FC = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [restaurantId, setRestaurantId] = useState<number>(0);

    const statusTabs = [
        { key: '', label: t('orders.all') },
        { key: ORDER_STATUS.CREATED, label: t('orders.new') },
        { key: ORDER_STATUS.PAID, label: t('orders.paid') },
        { key: ORDER_STATUS.PREPARING, label: t('orders.preparing') },
        { key: ORDER_STATUS.READY, label: t('orders.ready') },
        { key: ORDER_STATUS.DELIVERING, label: t('orders.delivering') },
        { key: ORDER_STATUS.COMPLETED, label: t('orders.completed') },
        { key: ORDER_STATUS.CANCELED, label: t('orders.canceled') }
    ];

    useEffect(() => {
        const storedId = localStorage.getItem('currentRestaurantId');
        if (storedId) {
            setRestaurantId(Number(storedId));
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadOrders = useCallback(async () => {
        if (!restaurantId) return;
        setIsLoading(true);
        try {
            const res = await orderService.getMerchantOrders(restaurantId, activeStatus || undefined, page, 10);
            if (res.result) {
                setOrders(res.result.content || []);
                setTotalPages(res.result.totalPages || 0);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setIsLoading(false);
        }
    }, [restaurantId, activeStatus, page]);

    useEffect(() => {
        if (restaurantId) {
            loadOrders();
        }
    }, [loadOrders, restaurantId]);

    const handleConfirm = async (orderId: number) => {
        if (!window.confirm(t('orders.confirmQuestion'))) return;
        try {
            await orderService.confirmOrder(orderId);
            loadOrders();
            setSelectedOrder(null);
        } catch (error) {
            alert('Không thể xác nhận đơn hàng');
        }
    };

    const handleReady = async (orderId: number) => {
        if (!window.confirm(t('orders.readyQuestion'))) return;
        try {
            await orderService.markOrderReady(orderId);
            loadOrders();
            setSelectedOrder(null);
        } catch (error) {
            alert('Không thể cập nhật trạng thái');
        }
    };

    const handleCancel = async (orderId: number) => {
        if (!window.confirm(t('orders.cancelQuestion'))) return;
        try {
            await orderService.cancelOrder(orderId);
            loadOrders();
            setSelectedOrder(null);
        } catch (error) {
            alert('Không thể hủy đơn hàng');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('vi-VN');
    };

    const getStatusBadge = (status: string) => {
        return (
            <span
                className="order-status-badge"
                style={{ backgroundColor: ORDER_STATUS_COLORS[status] || '#6b7280' }}
            >
                {ORDER_STATUS_LABELS[status] || status}
            </span>
        );
    };

    const canConfirm = (status: string) => status === ORDER_STATUS.CREATED || status === ORDER_STATUS.PAID;
    const canMarkReady = (status: string) => status === ORDER_STATUS.PREPARING;
    const canCancel = (status: string) => status === ORDER_STATUS.CREATED || status === ORDER_STATUS.PAID || status === ORDER_STATUS.PREPARING;

    if (!restaurantId && !isLoading) {
        return (
            <DashboardLayout pageTitle="Đơn hàng">
                <div className="empty-state">
                    <h4>Chưa chọn nhà hàng</h4>
                    <p>Vui lòng chọn nhà hàng để quản lý đơn hàng.</p>
                </div>
            </DashboardLayout>
        );
    }

    if (isLoading && orders.length === 0) {
        return (
            <DashboardLayout pageTitle="Đơn hàng">
                <LoadingSpinner message="Đang tải đơn hàng..." size="medium" />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout pageTitle={t('orders.title')}>
            <div className="order-management-page">
                <div className="management-header">
                    <h3 className="management-title">{t('orders.title')}</h3>
                </div>

                {/* Status Tabs */}
                <div className="order-status-tabs">
                    {statusTabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`status-tab ${activeStatus === tab.key ? 'active' : ''}`}
                            onClick={() => { setActiveStatus(tab.key); setPage(0); }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Orders Table */}
                {orders.length === 0 ? (
                    <div className="empty-state">
                        <h4>{t('orders.noOrders')}</h4>
                        <p>{t('orders.noOrdersDesc')}</p>
                    </div>
                ) : (
                    <>
                        <table className="orders-table">
                            <thead>
                                <tr>
                                    <th>{t('orders.orderId')}</th>
                                    <th>{t('orders.customer')}</th>
                                    <th>{t('orders.total')}</th>
                                    <th>{t('orders.status')}</th>
                                    <th>{t('orders.time')}</th>
                                    <th style={{ textAlign: 'right' }}>{t('orders.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td><strong>#{order.id}</strong></td>
                                        <td>
                                            <div>{order.customerName}</div>
                                            <small style={{ color: '#6b7280' }}>{order.customerPhone}</small>
                                        </td>
                                        <td><strong>{formatCurrency(order.grandTotal)}</strong></td>
                                        <td>{getStatusBadge(order.orderStatus)}</td>
                                        <td><small>{formatDate(order.createdAt)}</small></td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button className="link-btn" onClick={() => setSelectedOrder(order)}>Chi tiết</button>
                                            {canConfirm(order.orderStatus) && (
                                                <button className="link-btn primary" onClick={() => handleConfirm(order.id)}>Xác nhận</button>
                                            )}
                                            {canMarkReady(order.orderStatus) && (
                                                <button className="link-btn success" onClick={() => handleReady(order.id)}>Hoàn thành</button>
                                            )}
                                            {canCancel(order.orderStatus) && (
                                                <button className="link-btn danger" onClick={() => handleCancel(order.id)}>Hủy</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination">
                                <button
                                    className="btn-secondary"
                                    disabled={page === 0}
                                    onClick={() => setPage(p => p - 1)}
                                >
                                    {t('common.previous')}
                                </button>
                                <span>{t('common.page')} {page + 1} / {totalPages}</span>
                                <button
                                    className="btn-secondary"
                                    disabled={page >= totalPages - 1}
                                    onClick={() => setPage(p => p + 1)}
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}

                {/* Order Detail Modal */}
                {selectedOrder && (
                    <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                        <div className="modal-content order-detail-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
                                <button className="close-btn" onClick={() => setSelectedOrder(null)}>&times;</button>
                            </div>

                            <div className="order-detail-content">
                                {/* Customer Info */}
                                <div className="detail-section">
                                    <h4>{t('orders.customerInfo')}</h4>
                                    <div className="detail-row">
                                        <span>{t('orders.name')}:</span>
                                        <strong>{selectedOrder.customerName}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>SĐT:</span>
                                        <strong>{selectedOrder.customerPhone}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>{t('orders.address')}:</span>
                                        <strong>{selectedOrder.deliveryAddress}</strong>
                                    </div>
                                    {selectedOrder.descriptionOrder && (
                                        <div className="detail-row">
                                            <span>{t('orders.note')}:</span>
                                            <strong className="note">{selectedOrder.descriptionOrder}</strong>
                                        </div>
                                    )}
                                </div>

                                {/* Order Items */}
                                <div className="detail-section">
                                    <h4>{t('orders.orderedItems')}</h4>
                                    <table className="order-items-table">
                                        <thead>
                                            <tr>
                                                <th>{t('orders.item')}</th>
                                                <th style={{ textAlign: 'center' }}>{t('orders.qty')}</th>
                                                <th style={{ textAlign: 'right' }}>{t('orders.itemTotal')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.orderItems?.map(item => (
                                                <tr key={item.id}>
                                                    <td>
                                                        <div>{item.productName}</div>
                                                        {item.options?.length > 0 && (
                                                            <small style={{ color: '#6b7280' }}>
                                                                {item.options.map(o => o.optionName).join(', ')}
                                                            </small>
                                                        )}
                                                    </td>
                                                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                                    <td style={{ textAlign: 'right' }}>{formatCurrency(item.totalPrice)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Order Summary */}
                                <div className="detail-section">
                                    <h4>Tổng kết</h4>
                                    <div className="detail-row">
                                        <span>Tiền món:</span>
                                        <strong>{formatCurrency(selectedOrder.subTotal)}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Phí giao hàng:</span>
                                        <strong>{formatCurrency(selectedOrder.shippingFee)}</strong>
                                    </div>
                                    {selectedOrder.discountAmount > 0 && (
                                        <div className="detail-row">
                                            <span>Giảm giá:</span>
                                            <strong style={{ color: '#ef4444' }}>-{formatCurrency(selectedOrder.discountAmount)}</strong>
                                        </div>
                                    )}
                                    <div className="detail-row total">
                                        <span>Tổng cộng:</span>
                                        <strong>{formatCurrency(selectedOrder.grandTotal)}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Thanh toán:</span>
                                        <strong>{selectedOrder.paymentMethod === 'COD' ? 'Tiền mặt' : selectedOrder.paymentMethod}</strong>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="detail-section">
                                    <div className="detail-row">
                                        <span>{t('orders.status')}:</span>
                                        {getStatusBadge(selectedOrder.orderStatus)}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                {canCancel(selectedOrder.orderStatus) && (
                                    <button className="btn-danger" onClick={() => handleCancel(selectedOrder.id)}>Hủy đơn</button>
                                )}
                                {canConfirm(selectedOrder.orderStatus) && (
                                    <button className="btn-primary" onClick={() => handleConfirm(selectedOrder.id)}>Xác nhận & Bắt đầu nấu</button>
                                )}
                                {canMarkReady(selectedOrder.orderStatus) && (
                                    <button className="btn-primary" onClick={() => handleReady(selectedOrder.id)}>Đánh dấu hoàn thành</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default OrderManagementPage;
