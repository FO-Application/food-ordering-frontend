import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import restaurantService, { type RestaurantResponse } from '../../services/restaurantService';
import authService from '../../services/authService';
import userService, { type UserProfile } from '../../services/userService';
import ProfileModal from '../../components/ProfileModal/ProfileModal';
import './RestaurantSelectionPage.css';
import CreateRestaurantModal from '../../components/CreateRestaurantModal/CreateRestaurantModal';
import { SecuredImage } from '../../components/SecuredImage/SecuredImage';

const RestaurantSelectionPage: React.FC = () => {
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState<RestaurantResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const loadRestaurants = async () => {
        try {
            const userData = await userService.getMyInfo();
            if (userData?.result) setUser(userData.result);

            const restData = await restaurantService.getAllRestaurants();
            if (restData?.result?.content) setRestaurants(restData.result.content);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRestaurants();

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectRestaurant = (id: number) => {
        localStorage.setItem('currentRestaurantId', id.toString());
        navigate('/dashboard');
    };

    const handleCreateNew = () => setShowCreateModal(true);

    const handleLogout = async () => {
        await authService.logout();
        localStorage.removeItem('accessToken');
        navigate('/login');
    };

    const getUserDisplayName = () => {
        if (!user) return 'Đối tác';
        if (user.firstName && user.lastName) return `${user.lastName} ${user.firstName}`;
        return user.email?.split('@')[0] || 'Đối tác';
    };

    const getInitial = () => {
        if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'P';
    };

    return (
        <div className="partner-page">
            {/* Header */}
            <header className="partner-header">
                <div className="header-container">
                    <div className="brand">
                        <div className="brand-name">
                            <span className="accent">Fast</span>Manager
                        </div>
                    </div>

                    <div className="profile-wrapper" ref={dropdownRef}>
                        <button
                            className={`profile-trigger ${showDropdown ? 'open' : ''}`}
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <div className="avatar">{getInitial()}</div>
                            <div className="profile-info">
                                <span className="profile-name">{getUserDisplayName()}</span>
                                <span className="profile-role">Quản lý</span>
                            </div>
                            <svg className="dropdown-icon" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>

                        {showDropdown && (
                            <div className="profile-dropdown">
                                <div className="dropdown-header">
                                    <div className="dropdown-avatar">{getInitial()}</div>
                                    <div className="dropdown-user-info">
                                        <div className="dropdown-name">{getUserDisplayName()}</div>
                                        <div className="dropdown-email">{user?.email || 'partner@fastbite.vn'}</div>
                                    </div>
                                </div>
                                <div className="dropdown-separator"></div>
                                <button className="dropdown-btn" onClick={() => { setShowDropdown(false); setShowProfileModal(true); }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Thông tin tài khoản
                                </button>
                                <button className="dropdown-btn" onClick={() => navigate('/settings')}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="3" />
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                    </svg>
                                    Cài đặt
                                </button>
                                <div className="dropdown-separator"></div>
                                <button className="dropdown-btn logout" onClick={handleLogout}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Banner */}
            <section className="hero-banner">
                <div className="hero-bg"></div>
                <div className="hero-content">
                    <h1>Chào mừng trở lại!</h1>
                    <p>Quản lý tất cả chi nhánh nhà hàng của bạn tại một nơi duy nhất.</p>
                </div>
            </section>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-wrapper">
                    <div className="section-header">
                        <div className="section-title">
                            <h2>Chi nhánh của bạn</h2>
                            <span className="branch-count">{restaurants.length} chi nhánh</span>
                        </div>

                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loader"></div>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <div className="branch-grid">
                            {/* Add New Branch Card */}
                            <div className="branch-card add-card" onClick={handleCreateNew}>
                                <div className="add-card-content">
                                    <div className="add-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </div>
                                    <h3>Thêm chi nhánh mới</h3>
                                    <p>Mở rộng chuỗi nhà hàng của bạn</p>
                                </div>
                            </div>

                            {/* Restaurant Cards */}
                            {restaurants.map((restaurant) => (
                                <div
                                    key={restaurant.id}
                                    className="branch-card restaurant-card"
                                    onClick={() => handleSelectRestaurant(restaurant.id)}
                                >
                                    <div className="card-thumbnail">
                                        <SecuredImage
                                            src={restaurant.imageFileUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'}
                                            alt={restaurant.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                zIndex: 0
                                            }}
                                        />
                                        <span className={`status-badge ${restaurant.isActive ? 'active' : 'inactive'}`} style={{ zIndex: 1 }}>
                                            {restaurant.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                                        </span>
                                    </div>
                                    <div className="card-body">
                                        <h3 className="card-title">{restaurant.name}</h3>
                                        <p className="card-address">{restaurant.address}</p>
                                        <div className="card-meta">
                                            <div className="rating">
                                                <svg viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span>{restaurant.ratingAverage?.toFixed(1) || '0.0'}</span>
                                                <span className="review-count">({restaurant.reviewCount || 0})</span>
                                            </div>
                                            <button className="view-btn">
                                                Quản lý
                                                <svg viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="partner-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <span className="footer-logo">
                            <span className="accent">Fast</span>Bite
                        </span>
                        <p>Nền tảng quản lý nhà hàng thông minh</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-col">
                            <h4>Hỗ trợ</h4>
                            <a href="#">Trung tâm trợ giúp</a>
                            <a href="#">Liên hệ</a>
                            <a href="#">FAQ</a>
                        </div>
                        <div className="footer-col">
                            <h4>Pháp lý</h4>
                            <a href="#">Điều khoản sử dụng</a>
                            <a href="#">Chính sách bảo mật</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2024 FastBite Partner. Tất cả quyền được bảo lưu.</p>
                </div>
            </footer>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                user={user}
                onUserUpdated={async () => {
                    const userData = await userService.getMyInfo();
                    if (userData?.result) setUser(userData.result);
                }}
            />

            {/* Create Restaurant Modal */}
            <CreateRestaurantModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    // Refresh restaurant list
                    loadRestaurants();
                }}
            />
        </div>
    );
};

export default RestaurantSelectionPage;

