
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import productService, { type CategoryResponse, type CategoryRequest } from '../../../services/productService';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';

interface CategoryListProps {
    restaurantSlug: string;
    restaurantId: number;
}

const CategoryList: React.FC<CategoryListProps> = ({ restaurantSlug, restaurantId }) => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
    const [formData, setFormData] = useState<CategoryRequest>({
        name: '',
        displayOrder: 1,
        idRestaurant: restaurantId
    });

    useEffect(() => {
        if (restaurantSlug) loadCategories();
    }, [restaurantSlug]);

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const res = await productService.getAllCategories(restaurantSlug);
            if (res.result) setCategories(res.result);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                idRestaurant: restaurantId
            };
            if (editingCategory) {
                await productService.updateCategory(editingCategory.id, payload);
            } else {
                await productService.createCategory(payload);
            }
            loadCategories();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
            alert(t('common.error'));
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm(t('menu.deleteCategoryConfirm'))) {
            try {
                await productService.deleteCategory(id);
                loadCategories();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', displayOrder: categories.length + 1, idRestaurant: restaurantId });
        setEditingCategory(null);
    };

    const openEditModal = (cat: CategoryResponse) => {
        setEditingCategory(cat);
        setFormData({
            name: cat.name,
            displayOrder: cat.displayOrder,
            idRestaurant: restaurantId
        });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    if (isLoading) {
        return <LoadingSpinner message={t('common.loading')} size="medium" />;
    }

    return (
        <div className="category-management">
            <div className="management-header">
                <h3 className="management-title">{t('menu.categories')}</h3>
                <button className="btn-primary" onClick={openCreateModal}>
                    {t('menu.addCategory')}
                </button>
            </div>

            {categories.length === 0 ? (
                <div className="empty-state">
                    <h4>{t('menu.noCategories')}</h4>
                    <p>{t('menu.noCategoriesDesc')}</p>
                </div>
            ) : (
                <div className="category-grid">
                    {categories.map((cat) => (
                        <div key={cat.id} className="category-card modern">
                            <div className="category-icon-wrapper">
                                <svg className="category-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 7h16M4 12h16M4 17h16" />
                                </svg>
                            </div>
                            <div className="category-content">
                                <h4 className="category-name">{cat.name}</h4>
                                <span className="category-order">#{cat.displayOrder}</span>
                            </div>
                            <div className="category-actions">
                                <button
                                    className="menu-action-btn edit-btn"
                                    onClick={() => openEditModal(cat)}
                                    title={t('menu.edit')}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </button>
                                <button
                                    className="menu-action-btn delete-btn"
                                    onClick={() => handleDelete(cat.id)}
                                    title={t('menu.delete')}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingCategory ? t('menu.edit') : t('menu.addCategory')}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>{t('menu.categoryName')} <span className="required">*</span></label>
                                <input
                                    className="form-input"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder={t('menu.categoryName')}
                                />
                            </div>
                            <div className="form-group">
                                <label>{t('menu.displayOrder')}</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.displayOrder}
                                    onChange={e => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                                    min={1}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                                    {t('common.cancel')}
                                </button>
                                <button type="submit" className="btn-primary">
                                    {t('common.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryList;
