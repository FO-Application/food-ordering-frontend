import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './ProductDetailModal.css';
import productService, { type ProductResponse, type OptionGroupResponse, type OptionItemResponse } from '../../../services/productService';
import { useCart, type RestaurantInfo } from '../../../contexts/CartContext';
import { getProxiedImageUrl } from '../../../utils/urlUtils';

interface ProductDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: ProductResponse | null;
    restaurant: RestaurantInfo | null;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ isOpen, onClose, product: initialProduct, restaurant }) => {
    const { t } = useTranslation();
    const { addToCart } = useCart();

    const [fullProduct, setFullProduct] = useState<ProductResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (isOpen && initialProduct) {
            setQuantity(1);
            setSpecialInstructions('');
            setSelectedOptions({});
            setFullProduct(initialProduct);

            // Fetch full product details including option groups
            fetchProductDetails(initialProduct.id);
        }
    }, [isOpen, initialProduct]);

    const fetchProductDetails = async (id: number) => {
        setLoading(true);
        try {
            const res = await productService.getProductById(id);
            if (res.result) {
                setFullProduct(res.result);
            }
        } catch (err) {
            console.error("Failed to fetch product details:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionToggle = (group: OptionGroupResponse, item: OptionItemResponse) => {
        setSelectedOptions(prev => {
            const currentSelected = prev[group.id] || [];
            const isSelected = currentSelected.includes(item.id);

            if (group.maxSelection === 1) {
                // Radio behavior
                return { ...prev, [group.id]: isSelected ? [] : [item.id] };
            }

            // Checkbox behavior
            if (isSelected) {
                return { ...prev, [group.id]: currentSelected.filter(id => id !== item.id) };
            } else {
                if (group.maxSelection > 0 && currentSelected.length >= group.maxSelection) {
                    return prev;
                }
                return { ...prev, [group.id]: [...currentSelected, item.id] };
            }
        });
    };

    const getSelectedOptionsWithPrice = () => {
        if (!fullProduct || !fullProduct.optionGroups) return [];

        const result: Array<{ name: string, price: number }> = [];

        fullProduct.optionGroups.forEach(group => {
            const selectedIds = selectedOptions[group.id] || [];
            selectedIds.forEach(optId => {
                const opt = group.options?.find(o => o.id === optId);
                if (opt) {
                    result.push({
                        name: opt.name,
                        price: opt.priceAdjustment || 0
                    });
                }
            });
        });

        return result;
    };

    const calculateTotal = () => {
        if (!fullProduct) return 0;
        let total = fullProduct.price;

        if (fullProduct.optionGroups) {
            fullProduct.optionGroups.forEach(group => {
                const selectedIds = selectedOptions[group.id] || [];
                selectedIds.forEach(optId => {
                    const opt = group.options?.find(o => o.id === optId);
                    if (opt) {
                        total += (opt.priceAdjustment || 0);
                    }
                });
            });
        }

        return total * quantity;
    };

    const isValid = () => {
        if (!fullProduct) return false;
        if (!fullProduct.optionGroups) return true;

        for (const group of fullProduct.optionGroups) {
            if (group.isMandatory) {
                const selected = selectedOptions[group.id] || [];
                if (selected.length < group.minSelection) {
                    return false;
                }
            }
        }
        return true;
    };

    const handleAddToCart = () => {
        if (!fullProduct || !restaurant) return;

        const finalOptions: { id: number, name: string, price: number }[] = [];

        if (fullProduct.optionGroups) {
            fullProduct.optionGroups.forEach(group => {
                const selectedIds = selectedOptions[group.id] || [];
                selectedIds.forEach(optId => {
                    const opt = group.options?.find(o => o.id === optId);
                    if (opt) {
                        finalOptions.push({
                            id: opt.id,
                            name: opt.name,
                            price: opt.priceAdjustment || 0
                        });
                    }
                });
            });
        }

        addToCart(
            restaurant,
            {
                id: fullProduct.id,
                name: fullProduct.name,
                price: fullProduct.price,
                imageUrl: fullProduct.imageUrl
            },
            quantity,
            finalOptions,
            specialInstructions
        );

        // Show success toast
        setShowToast(true);
        setTimeout(() => {
            setShowToast(false);
            onClose();
        }, 1500);
    };



    return (
        <>
            {/* Overlay */}
            <div
                className={`product-overlay ${isOpen ? 'active' : ''}`}
                onClick={onClose}
            />

            {/* Product Detail Panel */}
            <div className={`product-detail-panel ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="product-detail-header">
                    <h3 className="product-detail-title">{t('product.detailTitle')}</h3>
                    <button className="product-close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="product-detail-content">
                    {fullProduct ? (
                        <>

                            {/* Product Image */}
                            <img
                                src={getProxiedImageUrl(fullProduct.imageUrl) || 'https://via.placeholder.com/400x200'}
                                alt={fullProduct.name}
                                className="product-main-image"
                            />

                            {/* Product Info */}
                            <div className="product-main-info">
                                <h3>{fullProduct.name}</h3>
                                <p className="product-main-price">{fullProduct.price.toLocaleString('vi-VN')} ₫</p>
                                {fullProduct.description && (
                                    <p className="product-main-desc">{fullProduct.description}</p>
                                )}
                            </div>

                            {/* Option Groups */}
                            {loading && <div className="p-3 text-center">{t('product.loadingOptions')}</div>}

                            {!loading && fullProduct.optionGroups && fullProduct.optionGroups.length > 0 && (
                                fullProduct.optionGroups.map(group => (
                                    <div key={group.id} className="option-group">
                                        <div className="option-group-header">
                                            <h4>{group.name}</h4>
                                            <span className="option-requirement">
                                                {group.isMandatory ? t('product.mandatory') : t('product.optional')}
                                                {group.maxSelection > 1 ? ` (${t('product.maxSelection')} ${group.maxSelection})` : ''}
                                            </span>
                                        </div>

                                        <div className="option-list">
                                            {group.options?.map(item => {
                                                const isSelected = (selectedOptions[group.id] || []).includes(item.id);
                                                return (
                                                    <label
                                                        key={item.id}
                                                        className={`option-item ${isSelected ? 'selected' : ''}`}
                                                    >
                                                        <div className="option-control">
                                                            <input
                                                                type={group.maxSelection === 1 ? "radio" : "checkbox"}
                                                                name={`group-${group.id}`}
                                                                checked={isSelected}
                                                                onChange={() => handleOptionToggle(group, item)}
                                                                disabled={!item.isAvailable}
                                                            />
                                                            <span className={`option-name ${!item.isAvailable ? 'disabled' : ''}`}>
                                                                {item.name} {!item.isAvailable && `(${t('product.outOfStock')})`}
                                                            </span>
                                                        </div>
                                                        <span className="option-price">
                                                            {(item.priceAdjustment || 0) !== 0 ? (
                                                                (item.priceAdjustment || 0) > 0
                                                                    ? `+${(item.priceAdjustment || 0).toLocaleString('vi-VN')} ₫`
                                                                    : `${(item.priceAdjustment || 0).toLocaleString('vi-VN')} ₫`
                                                            ) : ''}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* Special Instructions */}
                            <div className="special-instructions-section">
                                <h4>{t('product.noteForRestaurant')}</h4>
                                <textarea
                                    className="instructions-input"
                                    placeholder={t('product.notePlaceholder')}
                                    value={specialInstructions}
                                    onChange={(e) => setSpecialInstructions(e.target.value)}
                                    maxLength={200}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="p-5 text-center">{t('product.loading')}</div>
                    )}
                </div>

                {/* Footer */}
                {fullProduct && (
                    <div className="product-detail-footer">
                        {/* Selected Options Summary */}
                        {getSelectedOptionsWithPrice().length > 0 && (
                            <div className="selected-options-summary">
                                <h5 style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 8px 0', color: '#666' }}>
                                    {t('product.selectedOptions')}
                                </h5>
                                {getSelectedOptionsWithPrice().map((opt, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                                        <span style={{ color: '#333' }}>• {opt.name}</span>
                                        <span style={{ color: opt.price >= 0 ? '#00b14f' : '#f44', fontWeight: 500 }}>
                                            {opt.price !== 0 ? (
                                                opt.price > 0
                                                    ? `+${opt.price.toLocaleString('vi-VN')} ₫`
                                                    : `${opt.price.toLocaleString('vi-VN')} ₫`
                                            ) : t('product.free')}
                                        </span>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '8px' }} />
                            </div>
                        )}

                        <div className="product-quantity-control">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="product-qty-btn"
                                disabled={quantity <= 1}
                            >−</button>
                            <span className="product-qty-value">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="product-qty-btn"
                            >+</button>
                        </div>

                        <button
                            className="product-add-btn"
                            onClick={handleAddToCart}
                            disabled={!isValid()}
                        >
                            {t('product.addToCart')} - {calculateTotal().toLocaleString('vi-VN')} ₫
                        </button>
                    </div>
                )}
            </div>

            {/* Success Toast */}
            {showToast && (
                <div className="add-to-cart-toast">
                    <div className="toast-icon">✓</div>
                    <span className="toast-text">{t('product.addedToCart')}</span>
                </div>
            )}
        </>
    );
};

export default ProductDetailModal;
