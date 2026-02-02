import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import userService from '../../services/userService';
import notificationService from '../../services/notificationService';
import './PartnerLoginPage.css';

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

const PartnerLoginPage: React.FC = () => {
    const navigate = useNavigate();

    // Steps: 'login' | 'forgot-password' | 'otp-verify-reset' | 'reset-password'
    const [currentStep, setCurrentStep] = useState<string>('login');

    // Login State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    // Forgot/Reset Password State
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetOtpCode, setResetOtpCode] = useState('');
    const [verifiedOtp, setVerifiedOtp] = useState('');
    const [resetData, setResetData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    // Common State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
    };

    // ==================== HANDLERS ====================

    // Handle email/password login
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            const response = await authService.login({
                email,
                password,
            });

            const { result, message } = response;

            if (result && result.authenticated) {
                if (result.role === 'MERCHANT') {
                    console.log('[PartnerLoginPage] Login successful:', message);
                    localStorage.setItem('accessToken', result.accessToken);

                    // Register Notification Token
                    try {
                        const userInfoFn = await userService.getMyInfo();
                        if (userInfoFn.result && userInfoFn.result.id) {
                            const fcmToken = await notificationService.getFcmToken();
                            if (fcmToken) {
                                await notificationService.registerToken(userInfoFn.result.id.toString(), fcmToken, 'MERCHANT');
                                console.log('[PartnerLoginPage] Notification token registered');
                            }
                        }
                    } catch (notifError) {
                        console.warn('[PartnerLoginPage] Failed to register notification token:', notifError);
                        // Continue login even if notification registration fails
                    }

                    navigate('/restaurant-selection');
                } else {
                    setError('Tài khoản của bạn không phải là tài khoản Đối tác.');
                    await authService.logout();
                }
            } else {
                setError('Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
            }
        } catch (err: any) {
            console.error('[PartnerLoginPage] Login failed:', err);
            const errorMessage = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle social login with Firebase
    // Social login handlers removed

    // ==================== FORGOT PASSWORD FLOW ====================

    const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            await authService.forgotPassword(forgotEmail);
            setSuccessMessage('Mã OTP đã được gửi đến email của bạn.');
            setResetOtpCode('');
            setTimeout(() => {
                setCurrentStep('otp-verify-reset');
                clearMessages();
            }, 1000);
        } catch (err: any) {
            console.error('[PartnerLoginPage] Forgot password failed:', err);
            const message = err.response?.data?.message || 'Email không tồn tại trong hệ thống';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyResetOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            const response = await authService.verifyForgotPasswordOtp(forgotEmail, resetOtpCode);

            if (response.result === true) {
                setVerifiedOtp(resetOtpCode);
                setCurrentStep('reset-password');
                clearMessages();
            } else {
                setError('Mã OTP không đúng hoặc đã hết hạn.');
            }
        } catch (err: any) {
            console.error('[PartnerLoginPage] Verify OTP failed:', err);
            const message = err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (resetData.newPassword !== resetData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,16}$/;
        if (!passwordRegex.test(resetData.newPassword)) {
            setError('Mật khẩu phải từ 8-16 ký tự, bao gồm chữ hoa, thường, số và ký tự đặc biệt');
            return;
        }

        setLoading(true);
        clearMessages();

        try {
            await authService.resetPassword({
                email: forgotEmail,
                newPassword: resetData.newPassword,
                otp: verifiedOtp
            });
            setSuccessMessage('Đổi mật khẩu thành công! Bạn có thể đăng nhập.');
            setTimeout(() => {
                setCurrentStep('login');
                setEmail(forgotEmail);
                clearMessages();
                // Reset flow state
                setVerifiedOtp('');
                setResetOtpCode('');
                setForgotEmail('');
                setResetData({ newPassword: '', confirmPassword: '' });
            }, 1500);
        } catch (err: any) {
            console.error('[PartnerLoginPage] Reset password failed:', err);
            const message = err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendResetOtp = async () => {
        setLoading(true);
        clearMessages();

        try {
            await authService.resendOtp({ email: forgotEmail, type: 'FORGOT_PASSWORD' });
            setSuccessMessage('Mã OTP mới đã được gửi đến email của bạn.');
        } catch (err: any) {
            console.error('[PartnerLoginPage] Resend OTP failed:', err);
            setError('Không thể gửi lại OTP. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // ==================== RENDERS ====================

    const renderLoginForm = () => (
        <>
            <div className="login-header">
                <h1 className="login-title">Đăng nhập Đối tác</h1>
                <p className="login-subtitle">Quản lý cửa hàng và đơn hàng của bạn</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <div className="form-input-wrapper">
                        <input
                            type="email"
                            className="form-input"
                            placeholder="partner@fastbite.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
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
                    <button
                        type="button"
                        className="forgot-password-btn"
                        onClick={() => { setCurrentStep('forgot-password'); clearMessages(); }}
                    >
                        Quên mật khẩu?
                    </button>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>

            {/* Social Login Removed */}

            <div className="login-footer">
                <p className="footer-text">
                    Chưa có tài khoản? <Link to="/register" className="register-link">Đăng ký làm đối tác</Link>
                </p>
            </div>
        </>
    );

    const renderForgotPassword = () => (
        <>
            <div className="login-header">
                <h1 className="login-title">Quên mật khẩu</h1>
                <p className="login-subtitle">Nhập email để nhận mã OTP đặt lại mật khẩu</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form className="login-form" onSubmit={handleForgotPasswordSubmit}>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <div className="form-input-wrapper">
                        <input
                            type="email"
                            className="form-input"
                            placeholder="partner@fastbite.com"
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
                </button>
            </form>

            <div className="login-footer">
                <button
                    className="back-btn"
                    onClick={() => { setCurrentStep('login'); clearMessages(); }}
                >
                    ← Quay lại đăng nhập
                </button>
            </div>
        </>
    );

    const renderOtpVerifyReset = () => (
        <>
            <div className="login-header">
                <h1 className="login-title">Xác thực OTP</h1>
                <p className="login-subtitle">
                    Nhập mã OTP đã được gửi đến email <strong>{forgotEmail}</strong>
                </p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form className="login-form" onSubmit={handleVerifyResetOtp}>
                <div className="form-group">
                    <label className="form-label">Mã OTP</label>
                    <div className="form-input-wrapper">
                        <input
                            type="text"
                            className="form-input otp-input"
                            placeholder="123456"
                            value={resetOtpCode}
                            onChange={(e) => setResetOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            required
                            disabled={loading}
                            style={{ letterSpacing: '4px', textAlign: 'center', fontSize: '18px' }}
                        />
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading || resetOtpCode.length !== 6}>
                    {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
                </button>
            </form>

            <div className="resend-container" style={{ textAlign: 'center', marginTop: '16px' }}>
                <span style={{ color: 'var(--fastbite-text-secondary)', fontSize: '14px' }}>Không nhận được mã? </span>
                <button
                    type="button"
                    className="text-btn"
                    onClick={handleResendResetOtp}
                    disabled={loading}
                    style={{
                        background: 'none', border: 'none', color: 'var(--fastbite-primary)',
                        fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    Gửi lại OTP
                </button>
            </div>

            <div className="login-footer">
                <button
                    className="back-btn"
                    onClick={() => { setCurrentStep('forgot-password'); clearMessages(); }}
                >
                    ← Quay lại nhập email
                </button>
            </div>
        </>
    );

    const renderResetPassword = () => (
        <>
            <div className="login-header">
                <h1 className="login-title">Đặt mật khẩu mới</h1>
                <p className="login-subtitle">Nhập mật khẩu mới cho tài khoản của bạn</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}

            <form className="login-form" onSubmit={handleResetPasswordSubmit}>
                <div className="form-group">
                    <label className="form-label">Mật khẩu mới</label>
                    <div className="form-input-wrapper">
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={resetData.newPassword}
                            onChange={(e) => setResetData(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Xác nhận mật khẩu</label>
                    <div className="form-input-wrapper">
                        <input
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={resetData.confirmPassword}
                            onChange={(e) => setResetData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                </button>
            </form>
        </>
    );

    return (
        <div className="partner-login-page">
            {/* Left Panel - Branding with Background Image */}
            <div className="login-branding-panel">
                <div className="branding-overlay"></div>
                <div className="branding-content">
                    <div className="branding-logo">
                        <span className="logo-fast">Fast</span>
                        <span className="logo-bite">Bite</span>
                    </div>
                    <h2 className="branding-title">Phát triển kinh doanh cùng FastBite</h2>
                    <p className="branding-subtitle">
                        Tiếp cận hàng triệu khách hàng, tăng doanh thu và quản lý
                        đơn hàng hiệu quả với nền tảng đối tác FastBite.
                    </p>
                    <div className="branding-stats">
                        <div className="branding-stat-item">
                            <span className="branding-stat-number">2000+</span>
                            <span className="branding-stat-label">Đối tác</span>
                        </div>
                        <div className="branding-stat-item">
                            <span className="branding-stat-number">50K+</span>
                            <span className="branding-stat-label">Đơn hàng/tháng</span>
                        </div>
                        <div className="branding-stat-item">
                            <span className="branding-stat-number">63</span>
                            <span className="branding-stat-label">Tỉnh thành</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="login-form-panel">
                <div className="login-form-container">
                    {/* Logo (Visible on mobile or always) */}
                    <div className="login-logo">
                        <span className="logo-text">
                            <span className="fast">Fast</span>
                            <span className="bite">Bite</span>
                        </span>
                    </div>

                    {currentStep === 'login' && renderLoginForm()}
                    {currentStep === 'forgot-password' && renderForgotPassword()}
                    {currentStep === 'otp-verify-reset' && renderOtpVerifyReset()}
                    {currentStep === 'reset-password' && renderResetPassword()}

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

export default PartnerLoginPage;
