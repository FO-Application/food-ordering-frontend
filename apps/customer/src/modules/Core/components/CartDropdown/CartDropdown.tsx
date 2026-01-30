import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCart } from '../../../../contexts/CartContext';
import './CartDropdown.css';

interface CartDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartDropdown = ({ isOpen, onClose }: CartDropdownProps) => {
    const { t } = useTranslation();
    const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartItemCount } = useCart();

    const hasItems = cart && cart.items.length > 0;

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
                                {cart.items.map((item) => (
                                    <div key={item.productId} className="cart-item">
                                        <div className="cart-item-image">
                                            {item.productImage ? (
                                                <img src={item.productImage} alt={item.productName} />
                                            ) : (
                                                <div className="cart-item-placeholder">🍜</div>
                                            )}
                                        </div>
                                        <div className="cart-item-details">
                                            <h4 className="cart-item-name">{item.productName}</h4>
                                            <p className="cart-item-price">{item.unitPrice.toLocaleString('vi-VN')} ₫</p>
                                        </div>
                                        <div className="cart-item-quantity">
                                            <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                                            <span className="qty-value">{item.quantity}</span>
                                            <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                                        </div>
                                        <button className="cart-item-remove" onClick={() => removeFromCart(item.productId)}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button className="cart-clear-btn" onClick={clearCart}>Xóa giỏ hàng</button>
                        </>
                    )}
                </div>

                {/* Footer - Checkout */}
                {hasItems && (
                    <div className="cart-footer">
                        <div className="cart-total">
                            <span>Tạm tính</span>
                            <span className="cart-total-amount">{getCartTotal().toLocaleString('vi-VN')} ₫</span>
                        </div>
                        <button className="cart-checkout-btn">Đặt hàng</button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDropdown;
