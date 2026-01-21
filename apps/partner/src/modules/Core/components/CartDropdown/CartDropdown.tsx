import { useTranslation } from 'react-i18next';
import './CartDropdown.css';

interface CartDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartDropdown = ({ isOpen, onClose }: CartDropdownProps) => {
    const { t } = useTranslation();

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
                    <h3 className="cart-title">{t('cart.title')}</h3>
                    <button className="cart-close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Empty Cart Content */}
                <div className="cart-content">
                    <div className="cart-empty">
                        {/* Illustration */}
                        <div className="cart-illustration">
                            <img
                                src="https://food.grab.com/static/images/ilus-basket-empty.svg"
                                alt="Empty cart"
                                className="cart-illustration-img"
                            />
                        </div>

                        <h4 className="cart-empty-title">{t('cart.emptyTitle')}</h4>
                        <p className="cart-empty-text">
                            {t('cart.emptyText')}
                        </p>

                        <a href="#categories" className="cart-browse-btn" onClick={onClose}>
                            {t('cart.browseMenu')}
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartDropdown;
