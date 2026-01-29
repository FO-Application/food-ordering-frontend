
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import productService, { type CategoryResponse, type ProductResponse, type ProductRequest } from '../../../services/productService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

interface ProductListProps {
    restaurantSlug: string;
}

const ProductList: React.FC<ProductListProps> = ({ restaurantSlug }) => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState<ProductRequest>({
        name: '',
        description: '',
        price: 0,
        originalPrice: 0,
        categoryId: 0
    });

    useEffect(() => {
        loadCategories();
    }, [restaurantSlug]);

    useEffect(() => {
        if (activeCategoryId) {
            loadProducts(activeCategoryId);
        } else if (categories.length > 0) {
            setActiveCategoryId(categories[0].id);
        }
    }, [categories, activeCategoryId]);

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const res = await productService.getAllCategories(restaurantSlug);
            if (res.result) {
                setCategories(res.result);
                if (res.result.length > 0 && !activeCategoryId) {
                    setActiveCategoryId(res.result[0].id);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadProducts = async (catId: number) => {
        try {
            const res = await productService.getProductsByCategory(catId);
            if (res.result) setProducts(res.result);
            else setProducts([]);
        } catch (error) {
            console.error(error);
            setProducts([]);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingProduct && !selectedImage) {
            alert(t('menu.image') + ' ' + t('validation.required'));
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: ProductRequest = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                originalPrice: Number(formData.originalPrice || formData.price),
                categoryId: formData.categoryId || (activeCategoryId as number)
            };

            if (editingProduct) {
                await productService.updateProduct(editingProduct.id, payload, selectedImage || undefined);
            } else {
                await productService.createProduct(payload, selectedImage!);
            }

            if (activeCategoryId) loadProducts(activeCategoryId);
            closeModal();
        } catch (error) {
            console.error(error);
            console.error(error);
            alert(t('common.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm(t('menu.deleteProductConfirm'))) {
            try {
                await productService.deleteProduct(id);
                if (activeCategoryId) loadProducts(activeCategoryId);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: 0,
            originalPrice: 0,
            categoryId: activeCategoryId || 0
        });
        setSelectedImage(null);
        setImagePreview(null);
    };

    const openEditModal = (prod: ProductResponse) => {
        setEditingProduct(prod);
        setFormData({
            name: prod.name,
            description: prod.description,
            price: prod.price,
            originalPrice: prod.originalPrice,
            categoryId: 0
        });
        setImagePreview(prod.imageUrl);
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        closeModal();
        setFormData(prev => ({ ...prev, categoryId: activeCategoryId || 0 }));
        setIsModalOpen(true);
    }

    if (isLoading) {
        return <LoadingSpinner message="Đang tải món ăn..." size="medium" />;
    }

    if (categories.length === 0) {
        return (
            <div className="empty-state">
                <h4>{t('menu.noCategories')}</h4>
                <p>{t('menu.noCategoriesDesc')}</p>
            </div>
        );
    }

    return (
        <div className="product-management">
            <div className="management-header">
                <h3 className="management-title">{t('menu.products')}</h3>
                <button className="btn-primary" onClick={openCreateModal}>
                    {t('menu.addProduct')}
                </button>
            </div>

            <div className="category-filter">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        className={`category-filter-btn ${activeCategoryId === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategoryId(cat.id)}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            <div className="product-grid">
                {products.length === 0 ? (
                    <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                        <h4>{t('menu.noProducts')}</h4>
                        <p>{t('menu.noProductsDesc')}</p>
                    </div>
                ) : (
                    products.map(prod => (
                        <div key={prod.id} className="product-card">
                            <img
                                src={prod.imageUrl || 'https://via.placeholder.com/300x180?text=No+Image'}
                                alt={prod.name}
                                className="product-image"
                            />
                            <div className="product-details">
                                <h4 className="product-name">{prod.name}</h4>
                                <p className="product-desc">{prod.description}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                                    <div>
                                        <span className="product-price">{prod.price.toLocaleString('vi-VN')}đ</span>
                                        {prod.originalPrice > prod.price && (
                                            <span className="product-original-price">
                                                {prod.originalPrice.toLocaleString('vi-VN')}đ
                                            </span>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => openEditModal(prod)}>{t('menu.edit')}</button>
                                        <button className="btn-danger" style={{ padding: '6px 12px' }} onClick={() => handleDelete(prod.id)}>{t('menu.delete')}</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingProduct ? t('menu.edit') : t('menu.addProduct')}</h3>
                            <button className="close-btn" onClick={closeModal}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>{t('menu.productName')} <span className="required">*</span></label>
                                <input
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder={t('menu.productName')}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('menu.description')} <span className="required">*</span></label>
                                <textarea
                                    className="form-textarea"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    required
                                    placeholder="Mô tả cho món ăn"
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div className="form-group">
                                    <label>Giá bán (VNĐ) <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                        required
                                        min={0}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Giá gốc (VNĐ)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.originalPrice}
                                        onChange={e => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                        min={0}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Danh mục <span className="required">*</span></label>
                                <select
                                    className="form-select"
                                    value={formData.categoryId}
                                    onChange={e => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                                    required
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Hình ảnh {!editingProduct && <span className="required">*</span>}</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="form-input"
                                />
                                {imagePreview && (
                                    <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden' }}>
                                        <img src={imagePreview} alt="Preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover' }} />
                                    </div>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={closeModal}>Hủy</button>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;
