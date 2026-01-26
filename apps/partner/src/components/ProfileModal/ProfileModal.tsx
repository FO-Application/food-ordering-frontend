import React, { useEffect, useState } from 'react';
import userService, { type UserProfile } from '../../services/userService';
import './ProfileModal.css';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile | null;
    onUserUpdated: () => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUserUpdated }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        dob: '',
        email: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                dob: user.dob || '',
                email: user.email || ''
            });
        }
    }, [user]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const response = await userService.updateUser(user.id, formData);
            if (response.result) {
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Cập nhật thành công!' });
                onUserUpdated();
            }
        } catch (error) {
            console.error('Failed to update user', error);
            setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setMessage(null);
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                dob: user.dob || '',
                email: user.email || ''
            });
        }
    };

    const getInitial = () => {
        if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
        if (user?.email) return user.email.charAt(0).toUpperCase();
        return 'P';
    };

    return (
        <div className="pm-overlay" onClick={onClose}>
            <div className="pm-container" onClick={(e) => e.stopPropagation()}>
                {/* Left Panel - Image */}
                <div className="pm-left">
                    <div className="pm-left-overlay"></div>
                    <div className="pm-left-content">
                        <div className="pm-logo">
                            <span className="accent">Fast</span>Manager
                        </div>
                        <div className="pm-avatar">{getInitial()}</div>
                        <h2 className="pm-name">{user.lastName} {user.firstName}</h2>
                        <span className="pm-role">Đối tác FastManager</span>
                        <p className="pm-tagline">Quản lý thông tin tài khoản của bạn</p>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="pm-right">
                    <button className="pm-close" onClick={onClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>

                    <div className="pm-form-header">
                        <h3>Thông tin tài khoản</h3>
                        <p>Xem và cập nhật thông tin cá nhân của bạn</p>
                    </div>

                    {message && (
                        <div className={`pm-message ${message.type}`}>
                            {message.type === 'success' ? '✓' : '!'} {message.text}
                        </div>
                    )}

                    <div className="pm-form">
                        <div className="pm-field">
                            <label>Email</label>
                            {isEditing ? (
                                <input type="email" value={formData.email} disabled className="disabled" />
                            ) : (
                                <div className="pm-value">{user.email}</div>
                            )}
                        </div>

                        <div className="pm-row">
                            <div className="pm-field">
                                <label>Họ</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        placeholder="Nhập họ"
                                    />
                                ) : (
                                    <div className="pm-value">{user.lastName || '---'}</div>
                                )}
                            </div>
                            <div className="pm-field">
                                <label>Tên</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên"
                                    />
                                ) : (
                                    <div className="pm-value">{user.firstName || '---'}</div>
                                )}
                            </div>
                        </div>

                        <div className="pm-field">
                            <label>Số điện thoại</label>
                            {isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Nhập số điện thoại"
                                />
                            ) : (
                                <div className="pm-value">{user.phone || '---'}</div>
                            )}
                        </div>

                        <div className="pm-field">
                            <label>Ngày sinh</label>
                            {isEditing ? (
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                <div className="pm-value">{user.dob || '---'}</div>
                            )}
                        </div>

                        <div className="pm-actions">
                            {isEditing ? (
                                <>
                                    <button className="pm-btn secondary" onClick={handleCancel}>
                                        Hủy
                                    </button>
                                    <button className="pm-btn primary" onClick={handleSave} disabled={saving}>
                                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                    </button>
                                </>
                            ) : (
                                <button className="pm-btn primary full" onClick={() => setIsEditing(true)}>
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
        </div>
    );
};

export default ProfileModal;
