import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import restaurantService, { type RestaurantResponse } from '../../services/restaurantService';
import userService, { type UserProfile } from '../../services/userService';
import { SecuredImage } from '../../components/SecuredImage/SecuredImage';
import './RestaurantProfilePage.css';

const RestaurantProfilePage: React.FC = () => {
    const [restaurant, setRestaurant] = useState<RestaurantResponse | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [newImage, setNewImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        description: '',
        isActive: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const restaurantId = localStorage.getItem('currentRestaurantId');

            if (restaurantId) {
                const restData = await restaurantService.getRestaurantById(Number(restaurantId));
                if (restData?.result) {
                    setRestaurant(restData.result);
                    setFormData({
                        name: restData.result.name || '',
                        address: restData.result.address || '',
                        phone: restData.result.phone || '',
                        description: restData.result.description || '',
                        isActive: restData.result.isActive ?? true
                    });
                }
            }

            const userData = await userService.getMyInfo();
            if (userData?.result) setUser(userData.result);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleActive = () => {
        setFormData(prev => ({ ...prev, isActive: !prev.isActive }));
    };

    const handleImageClick = () => {
        if (isEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setNewImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!restaurant) return;

        try {
            setSaving(true);
            const updateData = {
                name: formData.name,
                address: formData.address,
                phone: formData.phone,
                description: formData.description,
                isActive: formData.isActive
            };

            const result = await restaurantService.updateRestaurant(
                restaurant.id,
                updateData,
                newImage || undefined
            );

            if (result?.result) {
                setRestaurant(result.result);
                setIsEditing(false);
                setNewImage(null);
                setImagePreview(null);
            }
        } catch (error) {
            console.error('Failed to update restaurant:', error);
            alert('Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (restaurant) {
            setFormData({
                name: restaurant.name || '',
                address: restaurant.address || '',
                phone: restaurant.phone || '',
                description: restaurant.description || '',
                isActive: restaurant.isActive ?? true
            });
        }
        setNewImage(null);
        setImagePreview(null);
        setIsEditing(false);
    };

    const getOwnerInitial = () => {
        if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'O';
    };

    const getOwnerName = () => {
        if (!user) return 'Chủ quán';
        if (user.firstName && user.lastName) return `${user.lastName} ${user.firstName}`;
        return user.email?.split('@')[0] || 'Chủ quán';
    };

    if (loading) {
        return (
            <DashboardLayout pageTitle="Hồ sơ nhà hàng">
                <div className="profile-loading">
                    <div className="loader"></div>
                    <p>Đang tải thông tin...</p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout pageTitle="Hồ sơ nhà hàng">
            {/* Page Header */}
            <div className="profile-page-header">
                <div>
                    <h2>Thông tin nhà hàng</h2>
                    <p>Quản lý thông tin chi tiết và hình ảnh của nhà hàng</p>
                </div>
                <div className="profile-actions">
                    {isEditing ? (
                        <>
                            <button className="btn-secondary" onClick={handleCancel} disabled={saving}>
                                Hủy
                            </button>
                            <button className="btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </>
                    ) : (
                        <button className="btn-primary" onClick={() => setIsEditing(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Chỉnh sửa
                        </button>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            <div className="profile-content">
                {/* Main Info Card */}
                <div className="profile-card">
                    <div className="card-header">
                        <h3>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                            Chi tiết nhà hàng
                        </h3>
                    </div>
                    <div className="card-body">
                        {/* Restaurant Image */}
                        <div className="restaurant-image-section">
                            <div className="restaurant-image-wrapper" onClick={handleImageClick}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="restaurant-image" />
                                ) : restaurant?.imageFileUrl ? (
                                    <SecuredImage
                                        src={restaurant.imageFileUrl}
                                        alt={restaurant.name}
                                        className="restaurant-image"
                                    />
                                ) : (
                                    <div className="restaurant-image" style={{ background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span>Chưa có ảnh</span>
                                    </div>
                                )}
                                {isEditing && (
                                    <div className="image-upload-overlay">
                                        <span>📷 Thay đổi ảnh</span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>

                        {/* Form */}
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Tên nhà hàng</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Nhập tên nhà hàng"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Địa chỉ</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Nhập địa chỉ"
                                />
                            </div>
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="0123 456 789"
                                />
                            </div>
                            <div className="form-group">
                                <label>Slug</label>
                                <input
                                    type="text"
                                    value={restaurant?.slug || ''}
                                    disabled
                                    placeholder="restaurant-slug"
                                />
                            </div>
                            <div className="form-group full-width">
                                <label>Mô tả</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Mô tả ngắn về nhà hàng..."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    {/* Owner Info Card */}
                    <div className="profile-card" style={{ marginBottom: '24px' }}>
                        <div className="card-header">
                            <h3>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                Chủ quán
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="owner-info">
                                <div className="owner-avatar">{getOwnerInitial()}</div>
                                <div className="owner-details">
                                    <p className="owner-name">{getOwnerName()}</p>
                                    <p className="owner-email">{user?.email || 'email@example.com'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="profile-card" style={{ marginBottom: '24px' }}>
                        <div className="card-header">
                            <h3>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                                Thống kê
                            </h3>
                        </div>
                        <div className="card-body">
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <div className="stat-value">{restaurant?.ratingAverage?.toFixed(1) || '0.0'}</div>
                                    <div className="stat-label">Đánh giá TB</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">{restaurant?.reviewCount || 0}</div>
                                    <div className="stat-label">Lượt đánh giá</div>
                                </div>
                            </div>

                            {/* Status Toggle */}
                            <div className="status-toggle">
                                <div className="status-info">
                                    <div className={`status-indicator ${formData.isActive ? '' : 'inactive'}`}></div>
                                    <span className="status-text">
                                        {formData.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                                    </span>
                                </div>
                                {isEditing && (
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={handleToggleActive}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RestaurantProfilePage;
