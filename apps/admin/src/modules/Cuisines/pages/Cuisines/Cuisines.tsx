import { useParams, Link } from 'react-router-dom';
import './Cuisines.css';

interface Restaurant {
    id: number;
    name: string;
    image: string;
    rating: number;
    duration: string;
    distance: string;
    cuisine: string;
    promo?: string;
    discount?: string;
}

// Mock data
const MOCK_RESTAURANTS: Restaurant[] = [
    {
        id: 1,
        name: 'Cơm Rang, Cơm Đảo, Mỳ Xào Hải Phong - Vân Canh',
        image: 'https://images.unsplash.com/photo-1603133872878-684f57fa65b6?w=500&q=80',
        rating: 4.5,
        duration: '20 phút',
        distance: '2,5 km',
        cuisine: 'Cơm Chiên',
        promo: 'Promo',
        discount: 'Giảm 15k đơn 0đ'
    },
    {
        id: 2,
        name: 'Cơm Thố Anh Nguyễn - Phố Nhổn',
        image: 'https://images.unsplash.com/photo-1598514983318-2f64f8f4796c?w=500&q=80',
        rating: 4.2,
        duration: '30 phút',
        distance: '4,5 km',
        cuisine: 'Cơm',
        promo: 'Promo',
        discount: 'Giảm 20%'
    },
    {
        id: 3,
        name: 'Nem Nướng Nha Trang Minh Đức - Phố Nhổn',
        image: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=500&q=80',
        rating: 4.7,
        duration: '30 phút',
        distance: '5 km',
        cuisine: 'Bánh Xèo',
        promo: 'Promo'
    },
    {
        id: 4,
        name: 'Gà Tươi Mạnh Hoạch - Trịnh Văn Bô',
        image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&q=80',
        rating: 4.8,
        duration: '15 phút',
        distance: '1,2 km',
        cuisine: 'Gà',
        promo: 'NB'
    },
    {
        id: 5,
        name: 'Bún Chả Hà Nội - 102 Cầu Diễn',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',
        rating: 4.6,
        duration: '25 phút',
        distance: '3 km',
        cuisine: 'Bún Chả',
        discount: 'Freeship'
    },
    {
        id: 6,
        name: 'Trà Sữa Ding Tea - Hồ Tùng Mậu',
        image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80',
        rating: 4.9,
        duration: '10 phút',
        distance: '0,5 km',
        cuisine: 'Trà Sữa',
        promo: 'Deal Hời'
    },
    {
        id: 7,
        name: 'Pizza Hut - Lê Đức Thọ',
        image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&q=80',
        rating: 4.4,
        duration: '35 phút',
        distance: '4 km',
        cuisine: 'Pizza',
        discount: 'Mua 1 Tặng 1'
    },
    {
        id: 8,
        name: 'KFC - Mỹ Đình',
        image: 'https://images.unsplash.com/photo-1513639776629-9269d0522c38?w=500&q=80',
        rating: 4.3,
        duration: '20 phút',
        distance: '2 km',
        cuisine: 'Gà Rán'
    }
];

const Cuisines = () => {
    const { slug } = useParams<{ slug: string }>();

    const displayName = slug
        ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : 'Món Ngon';

    return (
        <div className="cuisines-page">
            {/* Hero Banner with background */}
            <div className="cuisines-hero">
                <div className="cuisines-hero-overlay"></div>
                <div className="cuisines-hero-content">
                    <div className="breadcrumbs">
                        <Link to="/" className="breadcrumb-link">Trang chủ</Link>
                        <span className="breadcrumb-separator">&gt;</span>
                        <span className="breadcrumb-current">Ẩm thực</span>
                    </div>
                    <h1 className="cuisine-title">Ưu đãi {displayName} ở khu vực của bạn</h1>
                </div>
            </div>

            <main className="cuisines-container">
                <div className="cuisine-filters">
                    <button className="filter-btn active">Gần tôi</button>
                    <button className="filter-btn">Đánh giá tốt</button>
                    <button className="filter-btn">Giao nhanh</button>
                    <button className="filter-btn">Khuyến mãi</button>
                </div>

                <div className="restaurant-list">
                    {MOCK_RESTAURANTS.map((restaurant) => (
                        <Link to={`/restaurant/${restaurant.id}`} key={restaurant.id} className="restaurant-card">
                            <div className="restaurant-image-wrapper">
                                <img src={restaurant.image} alt={restaurant.name} className="restaurant-image" />
                                {restaurant.promo && <span className="promo-tag">{restaurant.promo}</span>}
                            </div>
                            <div className="restaurant-info">
                                <h3 className="restaurant-name">{restaurant.name}</h3>
                                <div className="restaurant-meta">
                                    <span className="restaurant-cuisine">{restaurant.cuisine}</span>
                                </div>
                                <div className="restaurant-meta">
                                    <div className="restaurant-rating">
                                        <span>★</span> {restaurant.rating}
                                    </div>
                                    <span className="meta-separator">•</span>
                                    <span>{restaurant.duration}</span>
                                    <span className="meta-separator">•</span>
                                    <span>{restaurant.distance}</span>
                                </div>
                                {restaurant.discount && (
                                    <div className="discount-tag">
                                        🏷️ {restaurant.discount}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Cuisines;
