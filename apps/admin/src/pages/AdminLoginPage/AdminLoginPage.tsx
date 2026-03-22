import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../../configs/firebase';
import api from '../../utils/axiosConfig';
import './AdminLoginPage.css';

// SVG Icons
const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const FacebookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.469h-2.796v8.385C19.612 22.954 24 17.99 24 12z" fill="#1877F2" />
    </svg>
);

const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const EmailIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle email/password login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/login', {
                email,
                password,
            });

            if (response.data && response.data.result) {
                console.log('[AdminLoginPage] Login successful:', response.data.message);
                localStorage.setItem('token', response.data.result.accessToken);
                // Also save role/user info if needed
                localStorage.setItem('role', response.data.result.role);
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error('[AdminLoginPage] Login failed:', err);
            const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle social login with Firebase
    const handleSocialLogin = async (provider: any, providerName: string) => {
        setLoading(true);
        setError(null);

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const firebaseIdToken = await user.getIdToken();

            console.log(`[AdminLoginPage] ${providerName} login successful, sending token to backend...`);

            const response = await api.post('/auth/outbound/social-login', {
                token: firebaseIdToken,
            });

            if (response.data && response.data.result) {
                console.log('[AdminLoginPage] Backend authentication successful:', response.data.message);
                localStorage.setItem('token', response.data.result.accessToken);
                localStorage.setItem('role', response.data.result.role);
                navigate('/dashboard');
            }
        } catch (err: any) {
            console.error(`[AdminLoginPage] ${providerName} login failed:`, err);

            if (err.code) {
                switch (err.code) {
                    case 'auth/popup-closed-by-user':
                        setError('Đăng nhập bị huỷ. Vui lòng thử lại.');
                        break;
                    case 'auth/popup-blocked':
                        setError('Popup bị chặn. Vui lòng cho phép popup và thử lại.');
                        break;
                    case 'auth/account-exists-with-different-credential':
                        setError('Tài khoản đã tồn tại với email này. Hãy thử phương thức đăng nhập khác.');
                        break;
                    case 'auth/network-request-failed':
                        setError('Lỗi mạng. Vui lòng kiểm tra kết nối internet.');
                        break;
                    default:
                        setError(`Đăng nhập thất bại: ${err.message}`);
                }
            } else if (err.response) {
                const errorMessage = err.response.data?.message || 'Lỗi server';
                setError(errorMessage);
            } else {
                setError('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => handleSocialLogin(googleProvider, 'Google');
    const handleFacebookLogin = () => handleSocialLogin(facebookProvider, 'Facebook');

    return (
        <div className="admin-login-page">
            {/* Left Panel - Branding with Background Image */}
            <div className="login-branding-panel">
                <div className="branding-overlay"></div>
                <div className="branding-content">
                    <div className="branding-logo">
                        <span className="logo-fast">Fast</span>
                        <span className="logo-bite">Bite</span>
                    </div>
                    <h2 className="branding-title">Quản lý dễ dàng hơn bao giờ hết</h2>
                    <p className="branding-subtitle">
                        Nền tảng quản trị FastBite giúp bạn theo dõi đơn hàng,
                        quản lý nhà hàng và phân tích doanh thu một cách hiệu quả.
                    </p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="login-form-panel">
                <div className="login-form-container">
                    {/* Logo */}
                    <div className="login-logo">
                        <span className="logo-text">
                            <span className="fast">Fast</span>
                            <span className="bite">Bite</span>
                        </span>
                    </div>

                    {/* Header */}
                    <div className="login-header">
                        <h1 className="login-title">Chào mừng trở lại</h1>
                        <p className="login-subtitle">Đăng nhập để tiếp tục vào trang quản trị</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    {/* Login Form */}
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <div className="form-input-wrapper">
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="admin@fastbite.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <span className="input-icon">
                                    <EmailIcon />
                                </span>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Mật khẩu</label>
                            <div className="form-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                                <span className="input-icon">
                                    <LockIcon />
                                </span>
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>Ghi nhớ đăng nhập</span>
                            </label>
                            <a href="#" className="forgot-password">Quên mật khẩu?</a>
                        </div>

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="login-divider">
                        <span>hoặc</span>
                    </div>

                    {/* Social Login */}
                    <div className="social-buttons">
                        <button
                            className="social-btn google-btn"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                        >
                            <GoogleIcon />
                            <span>Google</span>
                        </button>
                        <button
                            className="social-btn facebook-btn"
                            onClick={handleFacebookLogin}
                            disabled={loading}
                        >
                            <FacebookIcon />
                            <span>Facebook</span>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="login-footer">
                        <p className="footer-text">
                            Cần hỗ trợ? <a href="#" className="footer-link">Liên hệ Admin</a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Đang xử lý...</p>
                </div>
            )}
        </div>
    );
};

export default AdminLoginPage;
