import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './Cuisines.css';
import restaurantService, { type RestaurantResponse } from '../../../../services/restaurantService';
import { getProxiedImageUrl } from '../../../../utils/urlUtils';
import { useLocation } from '../../../../contexts/LocationContext';


const Cuisines = () => {
    const { slug } = useParams<{ slug: string }>();
    const { location: userLocation } = useLocation();
    const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState<'all' | 'nearby'>('all');
    const [isHighRating, setIsHighRating] = useState(false);
    const [gpsLocation, setGpsLocation] = useState<{ lat: number; lon: number } | null>(null);

    const displayName = slug
        ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : 'Món Ngon';

    useEffect(() => {
        // Get user GPS location on mount for nearby search
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGpsLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
            },
            (error) => {
                console.warn("Location access denied, using default or disabling nearby feature", error);
            }
        );
    }, []);

    useEffect(() => {
        loadRestaurants();
    }, [slug, filterMode, gpsLocation]);

    const loadRestaurants = async () => {
        setLoading(true);
        try {
            let data: RestaurantResponse[] = [];

            if (filterMode === 'nearby') {
                if (gpsLocation) {
                    const res = await restaurantService.getNearbyRestaurants(
                        gpsLocation.lat,
                        gpsLocation.lon,
                        5.0, // 5km radius
                        slug
                    );
                    if (res.result) data = res.result.content;
                } else {
                    // Fallback or prompt user if location missing but mode is nearby
                    // For now, if no location, we might just fetch all but keep mode? 
                    // Or auto-switch back to all.
                    if (filterMode === 'nearby') {
                        console.warn("GPS location not available for nearby search");
                    }
                }
            } else {
                // Call Get All By Cuisine
                if (slug) {
                    const res = await restaurantService.getRestaurantsByCuisine(slug);
                    if (res.result) data = res.result.content;
                }
            }
            setRestaurants(data);
        } catch (error) {
            console.error("Failed to load restaurants", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleHighRating = () => {
        setIsHighRating(!isHighRating);
    };

    // Filter displayed restaurants
    const displayRestaurants = restaurants.filter(r => {
        if (isHighRating) {
            return (r.rating || 0) >= 4.0;
        }
        return true;
    });

    const handleNearbyClick = () => {
        if (filterMode === 'nearby') {
            setFilterMode('all');
        } else {
            if (!gpsLocation) {
                alert("Vui lòng cho phép truy cập vị trí để sử dụng tính năng này");
                // Try to request again
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setGpsLocation({
                            lat: position.coords.latitude,
                            lon: position.coords.longitude
                        });
                        setFilterMode('nearby');
                    },
                    (error) => alert("Không thể lấy vị trí của bạn: " + error.message)
                );
            } else {
                setFilterMode('nearby');
            }
        }
    };

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
                    {userLocation?.address && (
                        <div className="cuisine-delivery-address">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>Giao đến: {userLocation.address}</span>
                        </div>
                    )}
                </div>
            </div>

            <main className="cuisines-container">
                <div className="cuisine-filters">
                    <button
                        className={`filter-btn ${filterMode === 'nearby' ? 'active' : ''}`}
                        onClick={handleNearbyClick}
                    >
                        Gần tôi
                    </button>
                    <button
                        className={`filter-btn ${isHighRating ? 'active' : ''}`}
                        onClick={toggleHighRating}
                    >
                        Đánh giá tốt
                    </button>
                    {/* Removed "Giao nhanh" and "Khuyến mãi" as requested */}
                </div>

                {loading ? (
                    <div className="skeleton-loading-grid">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                            <div key={item} className="skeleton-card">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-content">
                                    <div className="skeleton-line title"></div>
                                    <div className="skeleton-line meta"></div>
                                    <div className="skeleton-line meta"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="restaurant-list">
                        {displayRestaurants.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">🍽️</div>
                                <p>Không tìm thấy nhà hàng nào phù hợp.</p>
                            </div>
                        ) : (
                            displayRestaurants.map((restaurant) => (
                                <Link to={`/restaurant/${restaurant.slug}`} key={restaurant.id} className="restaurant-card">

                                    <div className="restaurant-image-wrapper">
                                        <img
                                            src={getProxiedImageUrl(restaurant.imageFileUrl) || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'}
                                            alt={restaurant.name}
                                            className="restaurant-image"
                                            loading="lazy"
                                        />
                                        {!restaurant.isActive && <span className="closed-tag">Đóng cửa</span>}
                                        {restaurant.distance && <span className="distance-badge">{restaurant.distance.toFixed(1)} km</span>}
                                    </div>
                                    <div className="restaurant-info">
                                        <h3 className="restaurant-name">{restaurant.name}</h3>
                                        <div className="restaurant-meta">
                                            <span className="restaurant-cuisine">{displayName}</span>
                                        </div>
                                        <div className="restaurant-meta">
                                            <div className="restaurant-rating">
                                                <span className="star-icon">★</span>
                                                <span className="rating-value">{restaurant.rating || 0}</span>
                                                <span className="rating-count">({restaurant.ratingCount || 0})</span>
                                            </div>
                                            {restaurant.deliveryTime && (
                                                <>
                                                    <span className="meta-separator">•</span>
                                                    <span>{restaurant.deliveryTime}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Cuisines;
