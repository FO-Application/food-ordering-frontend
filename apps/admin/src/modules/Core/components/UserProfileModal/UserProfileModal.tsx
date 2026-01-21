import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import userService from '../../../../services/userService';
import type { UserProfile } from '../../../../services/userService';
import './UserProfileModal.css';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile | null;
    onUserUpdated: () => void; // Callback to refresh user data
}

const UserProfileModal = ({ isOpen, onClose, user, onUserUpdated }: UserProfileModalProps) => {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
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

    if (!isOpen || !user) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        try {
            await userService.updateUser(user.id, formData);
            setIsEditing(false);
            if (onUserUpdated) {
                onUserUpdated();
            }
        } catch (error) {
            console.error("Failed to update user", error);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset form data to original user data
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

    return (
        <div className="profile-overlay" onClick={onClose}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="profile-header">
                    <h2 className="profile-title">{t('profile.title') || 'Thông tin tài khoản'}</h2>
                    <button className="profile-close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="profile-content">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-large">
                            {user.firstName?.charAt(0)?.toUpperCase()}
                        </div>
                        <h3 className="profile-fullname">{user.lastName} {user.firstName}</h3>
                        <span className="profile-role">{user.role}</span>
                    </div>

                    <div className="profile-details">
                        {isEditing ? (
                            <>
                                <div className="profile-item">
                                    <span className="profile-label">{t('auth.email')}:</span>
                                    <input
                                        type="email"
                                        name="email"
                                        className="profile-input"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label">{t('auth.firstName')}:</span>
                                    <input
                                        type="text"
                                        name="firstName"
                                        className="profile-input"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label">{t('auth.lastName')}:</span>
                                    <input
                                        type="text"
                                        name="lastName"
                                        className="profile-input"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label">{t('auth.phone')}:</span>
                                    <input
                                        type="text"
                                        name="phone"
                                        className="profile-input"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label">{t('auth.dob')}:</span>
                                    <input
                                        type="date"
                                        name="dob"
                                        className="profile-input"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="profile-actions">
                                    <button className="profile-btn-cancel" onClick={handleCancel}>{t('common.cancel') || 'Hủy'}</button>
                                    <button className="profile-btn-save" onClick={handleSave}>{t('common.save') || 'Lưu'}</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="profile-item">
                                    <span className="profile-label">{t('auth.email')}:</span>
                                    <span className="profile-value">{user.email}</span>
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label">{t('auth.phone')}:</span>
                                    <span className="profile-value">{user.phone || '---'}</span>
                                </div>
                                <div className="profile-item">
                                    <span className="profile-label">{t('auth.dob')}:</span>
                                    <span className="profile-value">{user.dob || '---'}</span>
                                </div>
                                <button className="profile-btn-edit" onClick={() => setIsEditing(true)}>
                                    {t('common.edit') || 'Cập nhật thông tin'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfileModal;
