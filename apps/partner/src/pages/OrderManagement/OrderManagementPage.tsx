import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import orderService, {
    type OrderResponse,
    ORDER_STATUS,
    ORDER_STATUS_LABELS,
    ORDER_STATUS_COLORS
} from '../../services/orderService';
import notificationService from '../../services/notificationService';
import { formatDateTime } from '../../utils/dateUtils';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './OrderManagement.css';

// Confirmation Modal Types
type ConfirmActionType = 'confirm' | 'ready' | 'cancel' | null;

interface ConfirmModalState {
    isOpen: boolean;
    actionType: ConfirmActionType;
    orderId: number | null;
    isProcessing: boolean;
}

const OrderManagementPage: React.FC = () => {
    const { t } = useTranslation();
    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeStatus, setActiveStatus] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [restaurantId, setRestaurantId] = useState<number>(0);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        actionType: null,
        orderId: null,
        isProcessing: false
    });
    const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

    // Real-time updates
    useEffect(() => {
        const unsubscribe = notificationService.onMessage((message) => {
            // Check if the notification is related to orders
            // Adjust this condition based on your actual notification titles or data
            if (message.title.toLowerCase().includes('đơn') ||
                message.title.toLowerCase().includes('order') ||
                message.data?.type === 'ORDER_CREATED') {

                console.log('New order notification received, reloading orders...');
                loadOrders();
            }
        });
        return () => unsubscribe();
    }, [loadOrders]);

    // Open confirmation modal
    const openConfirmModal = (actionType: ConfirmActionType, orderId: number) => {
        setConfirmModal({ isOpen: true, actionType, orderId, isProcessing: false });
    };

    // Close confirmation modal
    const closeConfirmModal = () => {
        setConfirmModal({ isOpen: false, actionType: null, orderId: null, isProcessing: false });
    };

    // Execute the confirmed action
    const executeConfirmedAction = async () => {
        if (!confirmModal.orderId || !confirmModal.actionType) return;

        setConfirmModal(prev => ({ ...prev, isProcessing: true }));

        try {
            switch (confirmModal.actionType) {
                case 'confirm':
                    await orderService.confirmOrder(confirmModal.orderId);
                    setToastMessage({ text: 'Đã xác nhận đơn hàng và bắt đầu nấu!', type: 'success' });
                    break;
                case 'ready':
                    await orderService.markOrderReady(confirmModal.orderId);
                    setToastMessage({ text: 'Đơn hàng đã sẵn sàng giao!', type: 'success' });
                    break;
                case 'cancel':
                    await orderService.cancelOrder(confirmModal.orderId);
                    setToastMessage({ text: 'Đã hủy đơn hàng!', type: 'success' });
                    break;
            }
            loadOrders();
            setSelectedOrder(null);
        } catch (error) {
            setToastMessage({ text: 'Không thể thực hiện thao tác. Vui lòng thử lại!', type: 'error' });
        } finally {
            closeConfirmModal();
        }
    };

    // Get modal content based on action type
    const getConfirmModalContent = () => {
        switch (confirmModal.actionType) {
            case 'confirm':
                return {
                    title: 'Xác nhận đơn hàng',
                    message: 'Bạn có chắc muốn xác nhận và bắt đầu nấu đơn hàng này?',
                    confirmText: 'Bắt đầu nấu',
                    confirmClass: 'btn-primary'
                };
            case 'ready':
                return {
                    title: 'Hoàn thành món',
                    message: 'Đánh dấu đơn hàng đã nấu xong và sẵn sàng giao?',
                    confirmText: 'Đã sẵn sàng',
                    confirmClass: 'btn-success'
                };
            case 'cancel':
                return {
                    title: 'Hủy đơn hàng',
                    message: 'Bạn có chắc muốn hủy đơn hàng này?',
                    confirmText: 'Xác nhận hủy',
                    confirmClass: 'btn-danger'
                };
            default:
                return { title: '', message: '', confirmText: '', confirmClass: '' };
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
    };

    const formatDate = (dateStr: string) => {
        return formatDateTime(dateStr);
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
                                                <button className="link-btn primary" onClick={() => openConfirmModal('confirm', order.id)}>Xác nhận</button>
                                            )}
                                            {canMarkReady(order.orderStatus) && (
                                                <button className="link-btn success" onClick={() => openConfirmModal('ready', order.id)}>Hoàn thành</button>
                                            )}
                                            {canCancel(order.orderStatus) && (
                                                <button className="link-btn danger" onClick={() => openConfirmModal('cancel', order.id)}>Hủy</button>
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
                                    <button className="btn-danger" onClick={() => openConfirmModal('cancel', selectedOrder.id)}>Hủy đơn</button>
                                )}
                                {canConfirm(selectedOrder.orderStatus) && (
                                    <button className="btn-primary" onClick={() => openConfirmModal('confirm', selectedOrder.id)}>Xác nhận & Bắt đầu nấu</button>
                                )}
                                {canMarkReady(selectedOrder.orderStatus) && (
                                    <button className="btn-primary" onClick={() => openConfirmModal('ready', selectedOrder.id)}>Đánh dấu hoàn thành</button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Styled Confirmation Modal */}
                {confirmModal.isOpen && (
                    <div className="modal-overlay" onClick={closeConfirmModal}>
                        <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '340px' }}>
                            <div className="modal-header" style={{ padding: '12px 16px' }}>
                                <h3 style={{ fontSize: '1rem' }}>{getConfirmModalContent().title}</h3>
                                <button className="close-btn" onClick={closeConfirmModal}>&times;</button>
                            </div>
                            <div style={{ padding: '16px' }}>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#374151', lineHeight: 1.5 }}>
                                    {getConfirmModalContent().message}
                                </p>
                            </div>
                            <div className="modal-actions" style={{ padding: '12px 16px' }}>
                                <button
                                    className="btn-secondary"
                                    onClick={closeConfirmModal}
                                    disabled={confirmModal.isProcessing}
                                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    className={getConfirmModalContent().confirmClass}
                                    onClick={executeConfirmedAction}
                                    disabled={confirmModal.isProcessing}
                                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                >
                                    {confirmModal.isProcessing ? 'Đang xử lý...' : getConfirmModalContent().confirmText}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notification */}
                {toastMessage && (
                    <div
                        style={{
                            position: 'fixed',
                            bottom: '24px',
                            right: '24px',
                            padding: '16px 24px',
                            borderRadius: '10px',
                            background: toastMessage.type === 'success' ? '#10b981' : '#ef4444',
                            color: 'white',
                            fontWeight: 500,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            animation: 'slideUp 0.3s ease'
                        }}
                        onClick={() => setToastMessage(null)}
                    >
                        <span>{toastMessage.type === 'success' ? '✓' : '✕'}</span>
                        {toastMessage.text}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default OrderManagementPage;
