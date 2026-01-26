
import React, { useState, useEffect, useRef } from 'react';
import restaurantService, { type RestaurantRequest } from '../../services/restaurantService';
import geocodingService, { type AddressSuggestion } from '../../services/geocodingService';
import userService from '../../services/userService';
import './CreateRestaurantModal.css';

interface CreateRestaurantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Cuisine {
    id: number;
    name: string;
    slug: string;
}

const CreateRestaurantModal: React.FC<CreateRestaurantModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<RestaurantRequest>>({
        name: '',
        description: '',
        phone: '',
        slug: '',
        address: '',
        latitude: 21.0285,
        longitude: 105.8542,
        cuisinesId: [],
        ownerId: 0
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Data State
    const [cuisines, setCuisines] = useState<Cuisine[]>([]);

    // Address Search State
    const [addressQuery, setAddressQuery] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchTimeoutRef = useRef<number | null>(null);

    // Fetch User and Cuisines on Mount/Open
    useEffect(() => {
        if (isOpen) {
            fetchInitialData();
            // Reset state
            setError(null);
            setFormData(prev => ({ ...prev }));
            setAddressQuery('');
            setImageFile(null);
            setImagePreview(null);
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            const [userInfo, cuisineData] = await Promise.all([
                userService.getMyInfo(),
                restaurantService.getCuisines()
            ]);

            if (userInfo?.result) {
                setFormData(prev => ({ ...prev, ownerId: userInfo.result!.id }));
            }
            if (cuisineData?.result) {
                setCuisines(cuisineData.result);
            }
        } catch (err) {
            console.error("Failed to fetch initial data", err);
            setError("Không thể tải dữ liệu ban đầu. Vui lòng thử lại.");
        }
    };

    // Slug generation
    useEffect(() => {
        if (formData.name) {
            const slug = formData.name
                .toLowerCase()
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
                .replace(/[đĐ]/g, "d")
                .replace(/[^a-z0-9\s-]/g, "")
                .trim()
                .replace(/\s+/g, "-");
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.name]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCuisineToggle = (id: number) => {
        setFormData(prev => {
            const current = prev.cuisinesId || [];
            if (current.includes(id)) {
                return { ...prev, cuisinesId: current.filter(c => c !== id) };
            } else {
                return { ...prev, cuisinesId: [...current, id] };
            }
        });
    };

    // Address Search Logic
    const handleAddressSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setAddressQuery(value);
        setFormData(prev => ({ ...prev, address: value }));

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (value.length >= 3) {
            searchTimeoutRef.current = setTimeout(async () => {
                const results = await geocodingService.searchAddress(value);
                setAddressSuggestions(results);
                setShowSuggestions(true);
            }, 500);
        } else {
            setAddressSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const selectAddress = (suggestion: AddressSuggestion) => {
        setAddressQuery(suggestion.address);
        setFormData(prev => ({
            ...prev,
            address: suggestion.address,
            latitude: suggestion.lat,
            longitude: suggestion.lon
        }));
        setShowSuggestions(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        if (!imageFile) {
            setError("Vui lòng chọn ảnh đại diện cho nhà hàng");
            return;
        }
        if (!formData.cuisinesId || formData.cuisinesId.length === 0) {
            setError("Vui lòng chọn ít nhất một loại hình ẩm thực");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await restaurantService.createRestaurant(formData as RestaurantRequest, imageFile);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || "Tạo nhà hàng thất bại");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="crm-overlay" onClick={onClose}>
            <div className="crm-container" onClick={e => e.stopPropagation()}>
                <button className="crm-close" onClick={onClose}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <div className="crm-grid">
                    {/* Left Panel - Branding & Image */}
                    <div className="crm-left">
                        <div className="crm-branding">
                            <span className="accent">Fast</span>Manager
                        </div>
                        <h3>Thêm Chi Nhánh Mới</h3>
                        <p>Mở rộng kinh doanh của bạn với FastBite</p>

                        <div className="crm-image-upload">
                            <label htmlFor="image-upload" className={`crm-image-preview ${!imagePreview ? 'empty' : ''}`}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                        <span>Chọn ảnh đại diện</span>
                                    </div>
                                )}
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                hidden
                            />
                        </div>
                    </div>

                    {/* Right Panel - Form */}
                    <div className="crm-right">
                        {error && (
                            <div className="crm-error">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                {error}
                            </div>
                        )}

                        <div className="crm-scroll-content">
                            {/* Section 1: Basic Info */}
                            <div className="form-section">
                                <h4>Thông tin cơ bản</h4>
                                <div className="form-field">
                                    <label>Tên nhà hàng</label>
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="VD: Cơm Tấm Sài Gòn"
                                    />
                                    {formData.slug && <span className="slug-preview">/{formData.slug}</span>}
                                </div>
                                <div className="form-field">
                                    <label>Mô tả ngắn</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Giới thiệu về quán của bạn..."
                                        rows={3}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Số điện thoại hotline</label>
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="0912..."
                                    />
                                </div>
                            </div>

                            {/* Section 2: Location */}
                            <div className="form-section">
                                <h4>Địa điểm</h4>
                                <div className="form-field relative">
                                    <label>Địa chỉ</label>
                                    <input
                                        value={addressQuery}
                                        onChange={handleAddressSearch}
                                        placeholder="Nhập địa chỉ để tìm kiếm..."
                                    />
                                    {showSuggestions && addressSuggestions.length > 0 && (
                                        <div className="suggestions-dropdown">
                                            {addressSuggestions.map(s => (
                                                <div key={s.id} onClick={() => selectAddress(s)} className="suggestion-item">
                                                    {s.displayName}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="form-row">
                                    <div className="form-field half">
                                        <label>Vĩ độ (Lat)</label>
                                        <input
                                            type="number"
                                            name="latitude"
                                            value={formData.latitude}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-field half">
                                        <label>Kinh độ (Lon)</label>
                                        <input
                                            type="number"
                                            name="longitude"
                                            value={formData.longitude}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Cuisines */}
                            <div className="form-section">
                                <h4>Loại hình ẩm thực</h4>
                                <div className="cuisine-grid">
                                    {cuisines.map(c => (
                                        <label key={c.id} className={`cuisine-checkbox ${formData.cuisinesId?.includes(c.id) ? 'active' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={formData.cuisinesId?.includes(c.id)}
                                                onChange={() => handleCuisineToggle(c.id)}
                                                hidden
                                            />
                                            {c.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="crm-actions">
                            <button className="crm-btn secondary" onClick={onClose}>Hủy bỏ</button>
                            <button className="crm-btn primary" onClick={handleSubmit} disabled={submitting}>
                                {submitting ? 'Đang tạo...' : 'Tạo Chi Nhánh'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateRestaurantModal;
