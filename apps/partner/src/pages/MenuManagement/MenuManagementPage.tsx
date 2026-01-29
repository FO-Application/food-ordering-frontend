
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CategoryList from './components/CategoryList';
import ProductList from './components/ProductList';
import OptionManagement from './components/OptionManagement';
import restaurantService from '../../services/restaurantService';
import './MenuManagement.css';

const MenuManagementPage: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'category' | 'product' | 'option'>('category');
    const [restaurantSlug, setRestaurantSlug] = useState<string>('');
    const [restaurantId, setRestaurantId] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCurrentRestaurant = async () => {
            try {
                const storedRestaurantId = localStorage.getItem('currentRestaurantId');
                if (storedRestaurantId) {
                    const id = Number(storedRestaurantId);
                    setRestaurantId(id);
                    const res = await restaurantService.getRestaurantById(id);
                    if (res?.result) {
                        setRestaurantSlug(res.result.slug);
                    }
                }
            } catch (error) {
                console.error("Failed to load restaurant info", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCurrentRestaurant();
    }, []);

    const renderContent = () => {
        if (loading) {
            return <LoadingSpinner message={t('common.loading')} size="medium" />;
        }

        if (!restaurantSlug || !restaurantId) {
            return (
                <div className="empty-state">
                    <h4>{t('common.noData')}</h4>
                    <p>{t('common.selectRestaurant')}</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'category':
                return <CategoryList restaurantSlug={restaurantSlug} restaurantId={restaurantId} />;
            case 'product':
                return <ProductList restaurantSlug={restaurantSlug} />;
            case 'option':
                return <OptionManagement restaurantSlug={restaurantSlug} />;
            default:
                return null;
        }
    };

    return (
        <DashboardLayout pageTitle={t('sidebar.menu')}>
            <div className="menu-management-page">
                <div className="menu-tabs">
                    <div
                        className={`menu-tab ${activeTab === 'category' ? 'active' : ''}`}
                        onClick={() => setActiveTab('category')}
                    >
                        {t('menu.categories')}
                    </div>
                    <div
                        className={`menu-tab ${activeTab === 'product' ? 'active' : ''}`}
                        onClick={() => setActiveTab('product')}
                    >
                        {t('menu.products')}
                    </div>
                    <div
                        className={`menu-tab ${activeTab === 'option' ? 'active' : ''}`}
                        onClick={() => setActiveTab('option')}
                    >
                        {t('menu.options')}
                    </div>
                </div>

                <div className="menu-content">
                    {renderContent()}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default MenuManagementPage;
