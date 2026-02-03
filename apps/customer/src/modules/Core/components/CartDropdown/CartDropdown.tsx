import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCart } from '../../../../contexts/CartContext';
import CheckoutModal from '../CheckoutModal/CheckoutModal';
import './CartDropdown.css';

interface CartDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartDropdown = ({ isOpen, onClose }: CartDropdownProps) => {
    const { t } = useTranslation();
    const { cart, updateQuantity, removeFromCart, removeItems, clearCart, getCartTotal, getCartItemCount } = useCart();
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const hasItems = cart && cart.items.length > 0;
    const isSingleItem = hasItems && cart!.items.length === 1;

    // Reset selection when cart closes or changes significantly (optional safety)
    useEffect(() => {
        if (!isOpen) setSelectedIndices([]);
    }, [isOpen]);

    const handleToggleSelect = (index: number) => {
        setSelectedIndices(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            } else {
                return [...prev, index];
            }
        });
    };

    const handleSelectAll = (checked: boolean) => {
        if (!cart) return;
        if (checked) {
            setSelectedIndices(cart.items.map((_, idx) => idx));
        } else {
            setSelectedIndices([]);
        }
    };

    const handleDeleteSelected = () => {
        if (selectedIndices.length === 0) return;
        removeItems(selectedIndices);
        setSelectedIndices([]);
    };

    const handleClearCart = () => {
        clearCart();
        setSelectedIndices([]);
    };

    const handleCheckout = () => {
        setIsCheckoutOpen(true);
    };

    const handleOrderSuccess = (orderId: number) => {
        setIsCheckoutOpen(false);
        onClose();
        // Show success notification
        alert(`🎉 Đặt hàng thành công! Mã đơn: #${orderId}`);
        // Optionally navigate to order tracking
        // navigate(`/orders/${orderId}`);
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`cart-overlay ${isOpen ? 'active' : ''}`}
                onClick={onClose}
            />

            {/* Cart Panel */}
            <div className={`cart-dropdown ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="cart-header">
                    <h3 className="cart-title">
                        {t('cart.title')} {hasItems && `(${getCartItemCount()})`}
                    </h3>
                    <button className="cart-close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Cart Content */}
                <div className="cart-content">
                    {!hasItems ? (
                        <div className="cart-empty">
                            <div className="cart-illustration">
                                <img
                                    src="https://food.grab.com/static/images/ilus-basket-empty.svg"
                                    alt="Empty cart"
                                    className="cart-illustration-img"
                                />
                            </div>
                            <h4 className="cart-empty-title">{t('cart.emptyTitle')}</h4>
                            <p className="cart-empty-text">{t('cart.emptyText')}</p>
                            <a href="#categories" className="cart-browse-btn" onClick={onClose}>
                                {t('cart.browseMenu')}
                            </a>
                        </div>
                    ) : (
                        <>
                            {/* Restaurant Info */}
                            <div className="cart-restaurant">
                                <Link to={`/restaurant/${cart.restaurantSlug}`} className="cart-restaurant-link" onClick={onClose}>
                                    {cart.restaurantImage && (
                                        <img src={cart.restaurantImage} alt={cart.restaurantName} className="cart-restaurant-img" />
                                    )}
                                    <span className="cart-restaurant-name">{cart.restaurantName}</span>
                                </Link>
                            </div>

                            {/* Cart Items */}
                            <div className="cart-items">
                                {cart.items.map((item, index) => (
                                    <div key={`${item.productId}-${index}`} className="cart-item">
                                        {!isSingleItem && (
                                            <div className="cart-item-select">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIndices.includes(index)}
                                                    onChange={() => handleToggleSelect(index)}
                                                    className="cart-checkbox"
                                                />
                                            </div>
                                        )}
                                        <div className="cart-item-image">
                                            {item.productImage ? (
                                                <img src={item.productImage} alt={item.productName} />
                                            ) : (
                                                <div className="cart-item-placeholder">🍜</div>
                                            )}
                                        </div>
                                        <div className="cart-item-details">
                                            <h4 className="cart-item-name">{item.productName}</h4>
                                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                                                <p className="cart-item-options">
                                                    {item.selectedOptions.map(opt => opt.name).join(', ')}
                                                </p>
                                            )}
                                            {item.notes && <p className="cart-item-notes">📝 {item.notes}</p>}
                                            <p className="cart-item-price">
                                                {(item.totalPrice || item.unitPrice).toLocaleString('vi-VN')} ₫
                                            </p>
                                        </div>
                                        <div className="cart-item-quantity">
                                            <button className="qty-btn" onClick={() => updateQuantity(index, item.quantity - 1)}>−</button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button className="qty-btn" onClick={() => updateQuantity(index, item.quantity + 1)}>+</button>
                                        </div>
                                        {/* Removed X button */}
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons for Deletion */}
                            <div className="cart-actions-bar">
                                {isSingleItem ? (
                                    <button className="cart-delete-btn full-width" onClick={handleClearCart}>
                                        {t('cart.clearCart')}
                                    </button>
                                ) : (
                                    <div className="cart-bulk-actions">
                                        <label className="select-all-label">
                                            <input
                                                type="checkbox"
                                                checked={cart.items.length > 0 && selectedIndices.length === cart.items.length}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className="cart-checkbox"
                                            />
                                            {t('cart.selectAll')}
                                        </label>
                                        <button
                                            className="cart-delete-btn"
                                            onClick={handleDeleteSelected}
                                            disabled={selectedIndices.length === 0}
                                        >
                                            {t('cart.deleteSelected')} ({selectedIndices.length})
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer - Checkout */}
                {hasItems && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>{t('cart.subtotal')}</span>
                            <span className="cart-total-amount">{getCartTotal().toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <button className="cart-checkout-btn" onClick={handleCheckout}>
                            {t('cart.checkout')}
                        </button>
                    </div>
                )}
            </div>

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                onSuccess={handleOrderSuccess}
            />
        </>
    );
};
export default CartDropdown;

