import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './FoodCategories.css';
import cuisineService, { type CuisineResponse } from '../../../../services/cuisineService';

const FoodCategories = () => {
    const { t } = useTranslation();
    const [categories, setCategories] = useState<CuisineResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCuisines = async () => {
            try {
                const response = await cuisineService.getAllCuisines();
                if (response.result) {
                    setCategories(response.result);
                }
            } catch (error) {
                console.error('Failed to fetch cuisines:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCuisines();
    }, []);

    if (isLoading) {
        return (
            <section className="categories" id="categories">
                <div className="categories-container">
                    <div className="categories-headerSkeleton"></div>
                    <div className="categories-grid">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <div key={n} className="category-card skeleton">
                                <div className="category-image-wrapper skeleton-box"></div>
                                <div className="category-name skeleton-text"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (categories.length === 0) {
        return null;
    }

    return (
        <section className="categories" id="categories">
            <div className="categories-container">
                <div className="categories-header">
                    <h2 className="categories-title">
                        {t('categories.title', 'Có món ngon cho mọi người!')}
                    </h2>
                </div>

                <div className="categories-grid">
                    {categories.map((category) => (
                        <Link to={`/cuisines/${category.slug}`} key={category.id} className="category-card">
                            <div className="category-image-wrapper">
                                <img
                                    src={category.imageFileUrl || '/placeholder-food.jpg'}
                                    alt={category.name}
                                    className="category-image"
                                    loading="lazy"
                                />
                            </div>
                            <h3 className="category-name">{category.name}</h3>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FoodCategories;

