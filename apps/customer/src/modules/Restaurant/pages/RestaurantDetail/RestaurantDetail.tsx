import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './RestaurantDetail.css';
import restaurantService, { type RestaurantResponse } from '../../../../services/restaurantService';
import categoryService, { type CategoryResponse } from '../../../../services/categoryService';
import productService, { type ProductResponse } from '../../../../services/productService';
import { useLocation } from '../../../../contexts/LocationContext';
import { useCart } from '../../../../contexts/CartContext';
import ProductDetailModal from '../../components/ProductDetailModal';

interface MenuSection {
    category: CategoryResponse;
    products: ProductResponse[];
}

const RestaurantDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const { location: userLocation } = useLocation();
    // const { addToCart } = useCart(); // addToCart used in Modal now
    const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [menu, setMenu] = useState<MenuSection[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const openProductModal = (product: ProductResponse) => {
        setSelectedProduct(product);
    };

    useEffect(() => {
        if (slug) {
            loadRestaurantData(slug);
        }
    }, [slug]);

    const loadRestaurantData = async (slugParam: string) => {
        setLoading(true);
        setError(null);
        try {
            // 1. Client-side Lookup: Find ID by Slug
            // Note: This is a workaround because backend doesn't support getBySlug directly yet.
            // We fetch a larger list to increase chance of finding it.
            const allRestaurantsRes = await restaurantService.getAllRestaurants(0, 100);

            if (!allRestaurantsRes.result || !allRestaurantsRes.result.content) {
                throw new Error("Không thể tải danh sách nhà hàng");
            }

            const foundRestaurant = allRestaurantsRes.result.content.find(r => r.slug === slugParam);

            if (!foundRestaurant) {
                setError("Không tìm thấy nhà hàng này.");
                setLoading(false);
                return;
            }

            // 2. Fetch Full Details by ID
            const detailRes = await restaurantService.getRestaurantById(foundRestaurant.id);
            if (detailRes.result) {
                setRestaurant(detailRes.result);

                // 3. Fetch Menu (Categories + Products)
                await loadMenu(foundRestaurant.id, foundRestaurant.slug);
            }

        } catch (err: any) {
            console.error("Error loading restaurant:", err);
            setError("Đã có lỗi xảy ra khi tải thông tin nhà hàng.");
        } finally {
            setLoading(false);
        }
    };

    const loadMenu = async (_restaurantId: number, restaurantSlug: string) => {
        try {
            // Fetch Categories
            const catRes = await categoryService.getAllCategories(restaurantSlug);
            if (catRes.result && catRes.result.length > 0) {
                const fetchedCategories = catRes.result;
                setCategories(fetchedCategories);
                // Set first category as default selected
                setSelectedCategoryId(fetchedCategories[0].id);

                const menuData: MenuSection[] = [];

                // Fetch Products for each Category (Parallel)
                await Promise.all(fetchedCategories.map(async (cat) => {
                    const prodRes = await productService.getProductsByCategory(cat.id);
                    console.log(`[Debug] Category ${cat.name} products:`, prodRes.result);
                    if (prodRes.result) {
                        menuData.push({
                            category: cat,
                            products: prodRes.result // Show all products
                        });
                    }
                }));

                // Sort menu by category displayOrder or ID if needed
                menuData.sort((a, b) => (a.category.id - b.category.id));
                setMenu(menuData);
            }
        } catch (err) {
            console.error("Error loading menu:", err);
            // Don't block page if menu fails, just show restaurant info
        }
    };

    if (loading) {
        return (
            <div className="restaurant-detail-loading">
                <div className="spinner"></div>
                <p>Đang tải thông tin nhà hàng...</p>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="restaurant-not-found">
                <h2>{error || "Không tìm thấy nhà hàng"}</h2>
                <Link to="/" className="back-link">Quay lại trang chủ</Link>
            </div>
        );
    }

    return (
        <div className="restaurant-detail-page">
            <div className="restaurant-detail-hero" style={{ backgroundImage: `url(${restaurant.imageFileUrl || '/placeholder-restaurant.jpg'})` }}>
                <div className="restaurant-detail-overlay"></div>
                <div className="restaurant-detail-info">
                    <div className="breadcrumbs-hero">
                        <Link to="/">Trang chủ</Link> &gt; <Link to={`/cuisines/${restaurant.cuisineVariables?.slug || ''}`}>Ẩm thực</Link> &gt; <span>{restaurant.name}</span>
                    </div>
                    <h1>{restaurant.name}</h1>
                    <p className="restaurant-address">{restaurant.address}</p>
                    <div className="restaurant-meta-badges">
                        <span className="rating-badge">★ {restaurant.rating || 0} ({restaurant.ratingCount || 0}+ đánh giá)</span>
                        <span className="time-badge">{restaurant.deliveryTime || '30-45 phút'}</span>
                        <span className="distance-badge">{restaurant.distance ? `${restaurant.distance.toFixed(1)} km` : 'Gần đây'}</span>
                    </div>
                    {userLocation?.address && (
                        <div className="restaurant-delivery-address">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>Giao đến: {userLocation.address}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Navigation Bar - Like Grab Food */}
            {categories.length > 0 && (
                <div className="category-nav-wrapper">
                    <nav className="category-nav-bar">
                        <button className="nav-scroll-btn nav-scroll-left" aria-label="Scroll left">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 18l-6-6 6-6" />
                            </svg>
                        </button>
                        <div className="category-tabs">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    className={`category-tab ${selectedCategoryId === cat.id ? 'active' : ''}`}
                                    onClick={() => setSelectedCategoryId(cat.id)}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        <button className="nav-scroll-btn nav-scroll-right" aria-label="Scroll right">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                            </svg>
                        </button>
                    </nav>
                </div>
            )}

            <main className="restaurant-detail-content">
                {menu.length === 0 ? (
                    <div className="menu-empty-state">
                        <img
                            src="https://food.grab.com/static/images/chicken-bowl.svg"
                            alt="No menu"
                            className="empty-state-image"
                        />
                        <p className="empty-state-text">
                            Rất tiếc, thực đơn nhà hàng hiện chưa được cập nhật.<br />
                            Hãy quay lại sau hoặc khám phá các nhà hàng khác nhé!
                        </p>
                    </div>
                ) : (
                    <div className="menu-container">
                        {menu
                            .filter((section) => selectedCategoryId === null || section.category.id === selectedCategoryId)
                            .map((section) => (
                                <section key={section.category.id} className="menu-section">
                                    <h3 className="menu-category-title">{section.category.name}</h3>
                                    {section.products.length === 0 ? (
                                        <div className="menu-empty-state">
                                            <img
                                                src="https://food.grab.com/static/images/chicken-bowl.svg"
                                                alt="No products"
                                                className="empty-state-image"
                                            />
                                            <p className="empty-state-text">
                                                Danh mục này chưa có món ăn nào.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="menu-grid">
                                            {section.products.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="product-card"
                                                    onClick={() => openProductModal(product)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="product-info">
                                                        <h4 className="product-name">{product.name}</h4>
                                                        <p className="product-desc">{product.description}</p>
                                                        <p className="product-price">{product.price.toLocaleString('vi-VN')} ₫</p>
                                                    </div>
                                                    <div className="product-image-container">
                                                        <img
                                                            src={product.imageUrl || 'https://via.placeholder.com/100'}
                                                            alt={product.name}
                                                            className="product-image"
                                                        />
                                                        <button
                                                            className="add-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                openProductModal(product);
                                                            }}
                                                        >+</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            ))}
                    </div>
                )
                }
            </main >

            <ProductDetailModal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                product={selectedProduct}
                restaurant={restaurant ? {
                    id: restaurant.id,
                    name: restaurant.name,
                    slug: restaurant.slug,
                    imageUrl: restaurant.imageFileUrl
                } : null}
            />
        </div >
    );
};

export default RestaurantDetail;
