import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const { location: userLocation } = useLocation();
    const { cart, removeFromCart, updateQuantity } = useCart();
    const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
    const [categories, setCategories] = useState<CategoryResponse[]>([]);
    const [menu, setMenu] = useState<MenuSection[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getProductQuantity = (productId: number) => {
        if (!cart) return 0;
        return cart.items
            .filter(item => item.productId === productId)
            .reduce((sum, item) => sum + item.quantity, 0);
    };

    const handleDecreaseQuantity = (productId: number) => {
        if (!cart) return;
        // Find the last item with this productId to decrement/remove
        // We chose the last one to be consistent with "stack" behavior if multiple variants exist
        // or simplistic behavior if the user just wants to remove "one of them"
        const itemIndex = cart.items.findLastIndex(item => item.productId === productId);

        if (itemIndex !== -1) {
            const item = cart.items[itemIndex];
            if (item.quantity > 1) {
                updateQuantity(itemIndex, item.quantity - 1);
            } else {
                removeFromCart(itemIndex);
            }
        }
    };

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
                throw new Error(t('restaurant.errorLoadingList'));
            }

            const foundRestaurant = allRestaurantsRes.result.content.find(r => r.slug === slugParam);

            if (!foundRestaurant) {
                setError(t('restaurant.notFound'));
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
            setError(t('restaurant.errorLoading'));
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

    // Calculate dynamic values
    // Removed dynamic calculation as requested

    return (
        <div className="restaurant-detail-page">
            <div className="restaurant-detail-hero" style={{ backgroundImage: `url(${restaurant.imageFileUrl || '/placeholder-restaurant.jpg'})` }}>
                <div className="restaurant-detail-overlay"></div>
                <div className="restaurant-detail-info">
                    <div className="breadcrumbs-hero">
                        <Link to="/">{t('restaurant.home')}</Link> &gt; <Link to={`/cuisines/${restaurant.cuisineVariables?.slug || ''}`}>{t('restaurant.cuisine')}</Link> &gt; <span>{restaurant.name}</span>
                    </div>
                    <h1>{restaurant.name}</h1>
                    <p className="restaurant-address">{restaurant.address}</p>
                    <div className="restaurant-meta-badges">
                        <span className="rating-badge">★ {restaurant.rating || 0} ({restaurant.ratingCount || 0}+ {t('restaurant.reviews')})</span>
                    </div>
                    {userLocation?.address && (
                        <div className="restaurant-delivery-address">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            <span>{t('restaurant.deliverTo')}: {userLocation.address}</span>
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
                            {t('restaurant.menuEmpty')}<br />
                            {t('restaurant.menuEmptyHint')}
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
                                                {t('restaurant.categoryEmpty')}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="menu-grid">
                                            {section.products.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className={`product-card ${getProductQuantity(product.id) > 0 ? 'active-in-cart' : ''}`}
                                                    onClick={() => openProductModal(product)}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="product-image-container">
                                                        <img
                                                            src={product.imageUrl || 'https://via.placeholder.com/120'}
                                                            alt={product.name}
                                                            className="product-image"
                                                        />
                                                    </div>
                                                    <div className="product-info">
                                                        <div className="product-info-content">
                                                            <h4 className="product-name">{product.name}</h4>
                                                            <p className="product-desc">{product.description}</p>
                                                        </div>
                                                        <div className="product-info-footer">
                                                            <p className="product-price">{product.price.toLocaleString('vi-VN')} ₫</p>

                                                            {getProductQuantity(product.id) > 0 ? (
                                                                <div className="product-qty-control-inline" onClick={(e) => e.stopPropagation()}>
                                                                    <button
                                                                        className="qty-btn-inline decrease"
                                                                        onClick={() => handleDecreaseQuantity(product.id)}
                                                                    >
                                                                        {getProductQuantity(product.id) === 1 ? (
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                                            </svg>
                                                                        ) : (
                                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                                            </svg>
                                                                        )}
                                                                    </button>
                                                                    <span className="qty-value-inline">{getProductQuantity(product.id)}</span>
                                                                    <button
                                                                        className="qty-btn-inline increase"
                                                                        onClick={() => openProductModal(product)}
                                                                    >
                                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                            <line x1="12" y1="5" x2="12" y2="19" />
                                                                            <line x1="5" y1="12" x2="19" y2="12" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    className="add-btn"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        openProductModal(product);
                                                                    }}
                                                                >
                                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                                        <path d="M12 5v14M5 12h14" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
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
