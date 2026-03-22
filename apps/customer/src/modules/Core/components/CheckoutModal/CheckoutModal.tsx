import { useState, useEffect } from 'react';
import { useCart } from '../../../../contexts/CartContext';
import { useLocation } from '../../../../contexts/LocationContext';
import { createOrder, type OrderRequest } from '../../../../services/orderService';
import { createZaloPayPayment, queryZaloPayStatus } from '../../../../services/paymentService';
import restaurantService from '../../../../services/restaurantService';
import './CheckoutModal.css';
import { getProxiedImageUrl } from '../../../../utils/urlUtils';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (orderId: number) => void;
}

type PaymentMethod = 'COD' | 'ZALOPAY';

// Payment logos
const COD_LOGO = 'https://cdn-icons-png.flaticon.com/512/2331/2331970.png';
const ZALOPAY_LOGO = 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png';

// Distance calculation logic matching backend
const EARTH_RADIUS = 6371;
const WINDING_FACTOR = 1.3;

const calculateEstimatedDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    
    const toRadians = (deg: number) => deg * (Math.PI / 180);
    
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
            
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const airDistance = EARTH_RADIUS * c;
    const estimatedDistance = airDistance * WINDING_FACTOR;
    
    return Math.round(estimatedDistance * 10.0) / 10.0;
};

const calculateShippingFee = (distanceKm: number): number => {
    const baseFee = 15000;
    const baseDistance = 2.0;
    const pricePerKm = 5000;
    
    if (distanceKm <= baseDistance) {
        return baseFee;
    } else {
        const extraKm = distanceKm - baseDistance;
        const extraFee = pricePerKm * extraKm;
        return baseFee + extraFee;
    }
};

const CheckoutModal = ({ isOpen, onClose, onSuccess }: CheckoutModalProps) => {
    const { cart, getCartTotal, clearCart } = useCart();
    const { location: userLocation } = useLocation();

    // Form State
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [coordinates, setCoordinates] = useState({ lat: 0, lon: 0 });
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [orderNote, setOrderNote] = useState('');

    // Shipping fee estimate state
    const BASE_SHIPPING_FEE = 15000;
    const [estimatedShippingFee, setEstimatedShippingFee] = useState(BASE_SHIPPING_FEE);
    const [restaurantCoords, setRestaurantCoords] = useState<{lat: number, lon: number} | null>(null);

    // Fetch restaurant coordinates when modal opens
    useEffect(() => {
        if (isOpen && cart?.restaurantId) {
            restaurantService.getRestaurantById(cart.restaurantId)
                .then(res => {
                    if (res.result?.latitude && res.result?.longitude) {
                        setRestaurantCoords({
                            lat: res.result.latitude,
                            lon: res.result.longitude
                        });
                    }
                })
                .catch(err => console.error("Failed to fetch restaurant location for shipping fee:", err));
        } else {
            setRestaurantCoords(null);
        }
    }, [isOpen, cart?.restaurantId]);

    // Recalculate shipping fee whenever coordinates change
    useEffect(() => {
        if (restaurantCoords && coordinates.lat !== 0 && coordinates.lon !== 0) {
            const distance = calculateEstimatedDistance(
                restaurantCoords.lat, restaurantCoords.lon,
                coordinates.lat, coordinates.lon
            );
            const fee = calculateShippingFee(distance);
            setEstimatedShippingFee(fee);
        } else {
            setEstimatedShippingFee(BASE_SHIPPING_FEE);
        }
    }, [restaurantCoords, coordinates]);

    // Initialize address from LocationContext when modal opens
    useEffect(() => {
        if (isOpen && userLocation) {
            setDeliveryAddress(userLocation.address);
            setCoordinates({ lat: userLocation.lat, lon: userLocation.lon });
        }
    }, [isOpen, userLocation]);

    // Reset state when modal opens/closes to prevent stuck loading state
    useEffect(() => {
        if (isOpen) {
            // Only reset if not currently in a valid loading state
            setError(null);
            setStatusMessage(null);
            setIsLoading(false);
            setCreatedOrderId(null);
        }
    }, [isOpen]);


    // Poll ZaloPay status
    const pollZaloPayStatus = async (appTransId: string, orderId: number) => {
        const maxAttempts = 60; // 5 minutes with 5s interval
        let attempts = 0;

        const poll = async () => {
            try {
                setStatusMessage(`Đang kiểm tra thanh toán... (${attempts + 1})`);
                const result = await queryZaloPayStatus(appTransId);

                // return_code: 1 = success, 2 = fail, 3 = processing
                if (result.return_code === 1) {
                    // Payment successful
                    clearCart();
                    setStatusMessage(null);
                    onSuccess(orderId);
                    return;
                } else if (result.return_code === 2) {
                    // Payment failed
                    setError('Thanh toán thất bại. Đơn hàng đã bị hủy.');
                    setStatusMessage(null);
                    setIsLoading(false);
                    return;
                }

                // Still processing, continue polling
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 5000); // Poll every 5 seconds
                } else {
                    setError('Hết thời gian chờ thanh toán. Vui lòng kiểm tra lịch sử đơn hàng.');
                    setStatusMessage(null);
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('ZaloPay query failed:', err);
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(poll, 5000);
                }
            }
        };

        poll();
    };

    // Track created order to prevent duplicates on retry
    const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

    // Reset createdOrderId if critical info changes
    useEffect(() => {
        setCreatedOrderId(null);
    }, [deliveryAddress, paymentMethod, cart]);

    // Build description combining order-level note + per-item notes
    const buildDescription = (): string | undefined => {
        const parts: string[] = [];
        if (orderNote.trim()) parts.push(orderNote.trim());
        cart?.items.forEach(item => {
            if (item.notes) parts.push(`${item.productName}: ${item.notes}`);
        });
        return parts.length > 0 ? parts.join(' | ') : undefined;
    };

    const handleSubmit = async () => {
        if (!cart || cart.items.length === 0) {
            setError('Giỏ hàng trống');
            return;
        }

        if (!deliveryAddress.trim()) {
            setError('Vui lòng chọn địa chỉ giao hàng trước khi đặt hàng');
            return;
        }

        if (coordinates.lat === 0 || coordinates.lon === 0) {
            setError('Vui lòng chọn địa chỉ giao hàng hợp lệ');
            return;
        }

        setIsLoading(true);
        setError(null);
        setStatusMessage('Đang xử lý đơn hàng...');

        try {
            let orderId = createdOrderId;

            // Only create new order if we haven't already (or if info changed)
            if (!orderId) {
                setStatusMessage('Đang tạo đơn hàng...');
                const orderRequest: OrderRequest = {
                    merchantId: cart.restaurantId,
                    paymentMethod: paymentMethod,
                    deliveryAddress: deliveryAddress,
                    deliveryLatitude: coordinates.lat,
                    deliveryLongitude: coordinates.lon,
                    items: cart.items.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        optionIds: item.selectedOptions?.map(opt => opt.id) || []
                    })),
                    descriptionOrder: buildDescription()
                };

                const result = await createOrder(orderRequest);
                orderId = result.id;
                setCreatedOrderId(orderId);
            }

            if (paymentMethod === 'COD') {
                // COD - success immediately
                clearCart();
                onSuccess(orderId);
            } else if (paymentMethod === 'ZALOPAY') {
                // ZaloPay - create payment and redirect
                setStatusMessage('Đang tạo thanh toán ZaloPay...');

                const grandTotal = getCartTotal() + estimatedShippingFee;
                const zalopayResult = await createZaloPayPayment(orderId, grandTotal);

                if (zalopayResult.order_url) {
                    setStatusMessage('Đang chuyển hướng đến ZaloPay...');

                    // Open ZaloPay payment page in new tab
                    const zalopayWindow = window.open(zalopayResult.order_url, '_blank');

                    if (zalopayWindow) {
                        // Start polling for payment status
                        setStatusMessage('Chờ bạn thanh toán trên ZaloPay...');
                        pollZaloPayStatus(zalopayResult.app_trans_id, orderId);
                    } else {
                        // Popup blocked - show link
                        setError('Trình duyệt chặn popup. Vui lòng cho phép popup và thử lại.');
                        setStatusMessage(null);
                        setIsLoading(false);
                        // Don't clear createdOrderId here, allowing retry
                    }
                } else {
                    throw new Error('Không nhận được link thanh toán ZaloPay');
                }
            }
        } catch (err: any) {
            console.error('Order creation failed:', err);
            setError(err.response?.data?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
            setStatusMessage(null);
            setIsLoading(false);
            // Don't clear createdOrderId on temporary errors? 
            // Better to keep it if it's just a network/payment error.
        }
    };

    if (!isOpen) return null;

    const subtotal = getCartTotal();
    const grandTotal = subtotal + estimatedShippingFee;

    return (
        <>
            <div className="checkout-overlay" onClick={!isLoading ? onClose : undefined} />
            <div className="checkout-modal">
                <div className="checkout-header">
                    <h2>Xác nhận đơn hàng</h2>
                    <button className="checkout-close" onClick={onClose} disabled={isLoading}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                <div className="checkout-content">



                    {/* Restaurant Info */}
                    {cart && (
                        <div className="checkout-restaurant">
                            <img
                                src={getProxiedImageUrl(cart.restaurantImage) || 'https://via.placeholder.com/50'}
                                alt={cart.restaurantName}
                                className="checkout-restaurant-img"
                            />
                            <div>
                                <h4>{cart.restaurantName}</h4>
                                <span className="checkout-item-count">{cart.items.length} món</span>
                            </div>
                        </div>
                    )}

                    {/* Delivery Address - Read from LocationContext */}
                    <div className="checkout-section">
                        <label className="checkout-label">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            Địa chỉ giao hàng
                        </label>

                        {deliveryAddress ? (
                            <div className="checkout-address-display">
                                <p className="address-text">{deliveryAddress}</p>
                                <small className="address-coords">
                                    📍 {coordinates.lat.toFixed(4)}, {coordinates.lon.toFixed(4)}
                                </small>
                            </div>
                        ) : (
                            <div className="checkout-address-empty">
                                <p>⚠️ Chưa chọn địa chỉ giao hàng</p>
                                <small>Vui lòng quay lại trang nhà hàng và chọn địa chỉ giao hàng</small>
                            </div>
                        )}
                    </div>

                    {/* Payment Method */}
                    <div className="checkout-section">
                        <label className="checkout-label">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                <line x1="1" y1="10" x2="23" y2="10" />
                            </svg>
                            Phương thức thanh toán
                        </label>
                        <div className="checkout-payment-options">
                            <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                    disabled={isLoading}
                                />
                                <img src={COD_LOGO} alt="COD" className="payment-logo" />
                                <div className="payment-info">
                                    <span className="payment-name">Tiền mặt (COD)</span>
                                    <small>Thanh toán khi nhận hàng</small>
                                </div>
                            </label>
                            <label className={`payment-option ${paymentMethod === 'ZALOPAY' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment"
                                    value="ZALOPAY"
                                    checked={paymentMethod === 'ZALOPAY'}
                                    onChange={() => setPaymentMethod('ZALOPAY')}
                                    disabled={isLoading}
                                />
                                <img src={ZALOPAY_LOGO} alt="ZaloPay" className="payment-logo" />
                                <div className="payment-info">
                                    <span className="payment-name">ZaloPay</span>
                                    <small>Ví điện tử ZaloPay</small>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Order Note */}
                    <div className="checkout-section">
                        <label className="checkout-label">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Ghi chú cho quán
                        </label>
                        <textarea
                            className="checkout-note-input"
                            placeholder="VD: Phở không hành, ít cay, để riêng nước..."
                            value={orderNote}
                            onChange={(e) => setOrderNote(e.target.value)}
                            rows={2}
                            maxLength={500}
                            disabled={isLoading}
                        />
                    </div>

                    {/* Order Summary */}
                    <div className="checkout-section checkout-summary">
                        <div className="summary-row">
                            <span>Tạm tính</span>
                            <span>{subtotal.toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <div className="summary-row">
                            <span>Phí giao hàng (ước tính)</span>
                            <span>{estimatedShippingFee.toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <div className="summary-row summary-total">
                            <span>Tổng cộng</span>
                            <span>{grandTotal.toLocaleString('vi-VN')} ₫</span>
                        </div>
                    </div>


                    {/* Error Message */}
                    {error && (
                        <div className="checkout-error">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="checkout-footer">
                    <button className="checkout-cancel-btn" onClick={onClose} disabled={isLoading}>
                        Hủy
                    </button>
                    <button
                        className="checkout-submit-btn"
                        onClick={handleSubmit}
                        disabled={isLoading || !deliveryAddress.trim()}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner" />
                                {statusMessage || 'Đang xử lý...'}
                            </>
                        ) : paymentMethod === 'ZALOPAY' ? (
                            `Thanh toán ZaloPay • ${grandTotal.toLocaleString('vi-VN')} ₫`
                        ) : (
                            `Đặt hàng • ${grandTotal.toLocaleString('vi-VN')} ₫`
                        )}
                    </button>
                </div>
            </div>
        </>
    );
};

export default CheckoutModal;
