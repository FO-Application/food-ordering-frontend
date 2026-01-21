import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import './FoodCategories.css';

// Using the Java record structure provided by user as interface
interface CuisineResponse {
    /** ID loại hình ẩm thực */
    id: number;
    /** Tên Cuisine */
    name: string;
    /** Slug URL */
    slug: string;
    /** Link ảnh (Cloudinary/S3...) */
    imageFileUrl: string;
}

const FoodCategories = () => {
    const { t } = useTranslation();

    // Mock data based on the CuisineResponse structure - 5 categories only
    const categories: CuisineResponse[] = [
        {
            id: 1,
            name: 'Mì Ý',
            slug: 'mi-y',
            imageFileUrl: 'https://images.unsplash.com/photo-1626844131082-256783844137?w=500&q=80'
        },
        {
            id: 2,
            name: 'Bánh Mì',
            slug: 'banh-mi',
            imageFileUrl: 'https://images.unsplash.com/photo-1549611016-3a70d82b5040?w=500&q=80'
        },
        {
            id: 3,
            name: 'Gà rán',
            slug: 'ga-ran',
            imageFileUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80'
        },
        {
            id: 4,
            name: 'Pizza',
            slug: 'pizza',
            imageFileUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80'
        },
        {
            id: 5,
            name: 'Cơm',
            slug: 'com',
            imageFileUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80'
        }
    ];

    return (
        <section className="categories" id="categories">
            <div className="categories-container">
                <div className="categories-header">
                    <h2 className="categories-title">
                        {t('categories.title')}
                    </h2>
                </div>

                <div className="categories-grid">
                    {categories.map((category) => (
                        <Link to={`/cuisines/${category.slug}`} key={category.id} className="category-card">
                            <div className="category-image-wrapper">
                                <img
                                    src={category.imageFileUrl}
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

