import React, { useState, useEffect } from 'react';
import shipperService from '../../services/shipperService';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await shipperService.getProfile();
            setProfile(data.result);
        } catch (error) {
            console.error('Failed to load profile', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="page-loading">Đang tải...</div>;

    return (
        <div className="mobile-wrapper">
            <div className="page-container">
                <header className="page-header-simple">
                    <h2>Thông tin cá nhân</h2>
                </header>

                <main className="profile-content">
                    <div className="profile-avatar-section">
                        <img
                            src={profile?.avatar || `https://ui-avatars.com/api/?name=${profile?.firstName}`}
                            alt="Avatar"
                            className="profile-large-avatar"
                        />
                        <button className="change-avatar-btn">Đổi ảnh đại diện</button>
                    </div>

                    <div className="profile-info-card">
                        <div className="info-row">
                            <span className="info-label">Họ và tên</span>
                            <span className="info-value">{profile?.firstName} {profile?.lastName}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Email</span>
                            <span className="info-value">{profile?.email}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Số điện thoại</span>
                            <span className="info-value">{profile?.phone}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Ngày sinh</span>
                            <span className="info-value">{profile?.dob}</span>
                        </div>
                    </div>

                    <button className="edit-profile-btn">Chỉnh sửa thông tin</button>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
