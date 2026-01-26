import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import userService, { type UserProfile } from '../../services/userService';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        dob: '',
        email: ''
    });

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await userService.getMyInfo();
            if (response.result) {
                setUser(response.result);
                setFormData({
                    firstName: response.result.firstName || '',
                    lastName: response.result.lastName || '',
                    phone: response.result.phone || '',
                    dob: response.result.dob || '',
                    email: response.result.email || ''
                });
            }
        } catch (error) {
            console.error('Failed to fetch user', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!user) return;

        setSaving(true);
        setMessage(null);

        try {
            const response = await userService.updateUser(user.id, formData);
            if (response.result) {
                setUser(response.result);
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
            }
        } catch (error) {
            console.error('Failed to update user', error);
            setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                dob: user.dob || '',
                email: user.email || ''
            });
        }
        setIsEditing(false);
        setMessage(null);
    };

    const getInitial = () => {
        if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'P';
    };

    if (loading) {
        return (
            <div className="profile-page">
                <div className="profile-loading">
                    <div className="spinner"></div>
                    <p>Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Header */}
            <header className="profile-header">
                <div className="header-inner">
                    <button className="back-btn" onClick={() => navigate('/restaurant-selection')}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Quay lại
                    </button>
                    <div className="header-logo">
                        <span className="accent">Fast</span>Bite
                        <span className="tag">PARTNER</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="profile-main">
                <div className="profile-container">
                    <div className="profile-card">
                        {/* Avatar Section */}
                        <div className="avatar-section">
                            <div className="avatar-large">{getInitial()}</div>
                            <h2 className="user-fullname">{user?.lastName} {user?.firstName}</h2>
                            <span className="user-role">{user?.role === 'MERCHANT' ? 'Đối tác' : user?.role}</span>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`message ${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        {/* Form Section */}
                        <div className="form-section">
                            <h3 className="section-title">Thông tin tài khoản</h3>

                            <div className="form-group">
                                <label>Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled
                                        className="form-input disabled"
                                    />
                                ) : (
                                    <div className="form-value">{user?.email || '---'}</div>
                                )}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Họ</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="Nhập họ"
                                        />
                                    ) : (
                                        <div className="form-value">{user?.lastName || '---'}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label>Tên</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="form-input"
                                            placeholder="Nhập tên"
                                        />
                                    ) : (
                                        <div className="form-value">{user?.firstName || '---'}</div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Số điện thoại</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Nhập số điện thoại"
                                    />
                                ) : (
                                    <div className="form-value">{user?.phone || '---'}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Ngày sinh</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                ) : (
                                    <div className="form-value">{user?.dob || '---'}</div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="form-actions">
                                {isEditing ? (
                                    <>
                                        <button className="btn-cancel" onClick={handleCancel}>
                                            Hủy
                                        </button>
                                        <button className="btn-save" onClick={handleSave} disabled={saving}>
                                            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </button>
                                    </>
                                ) : (
                                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        Cập nhật thông tin
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
