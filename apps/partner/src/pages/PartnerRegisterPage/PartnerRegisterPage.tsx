import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import type { UserRequest, VerifyOtpRequest } from '../../services/authService';
import '../PartnerLoginPage/PartnerLoginPage.css'; // Reuse login styles

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

const PartnerRegisterPage: React.FC = () => {
    const navigate = useNavigate();

    // Steps: 'register' | 'otp-verification'
    const [currentStep, setCurrentStep] = useState<string>('register');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Register Form State
    const [formData, setFormData] = useState<UserRequest>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [otpCode, setOtpCode] = useState('');

    const clearMessages = () => {
        setError(null);
        setSuccessMessage(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Validation
    const validateForm = () => {
        if (!formData.firstName || !formData.lastName) return 'Vui lòng nhập đầy đủ họ tên';
        if (!formData.email) return 'Vui lòng nhập email';
        if (!formData.phone) return 'Vui lòng nhập số điện thoại';
        if (!formData.dob) return 'Vui lòng nhập ngày sinh';
        if (!formData.password) return 'Vui lòng nhập mật khẩu';

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,16}$/;
        if (!passwordRegex.test(formData.password)) {
            return 'Mật khẩu yếu: 8-16 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt';
        }
        return null;
    };

    // Handlers
    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        clearMessages();

        try {
            // Call API: /auth/sign-up/merchant
            await authService.signUpMerchant(formData);

            setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.');
            setTimeout(() => {
                setCurrentStep('otp-verification');
                clearMessages();
            }, 1500);
        } catch (err: any) {
            console.error('[PartnerRegisterPage] Register failed:', err);
            const message = err.response?.data?.message || 'Email hoặc SĐT đã tồn tại trên hệ thống';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            const requestData: VerifyOtpRequest = {
                email: formData.email,
                otpCode: otpCode
            };

            // Call API: /auth/verify-otp-and-register
            const response = await authService.verifyOtpAndRegister(requestData);

            if (response.result) {
                setSuccessMessage('Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay.');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err: any) {
            console.error('[PartnerRegisterPage] Verify OTP failed:', err);
            const message = err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        clearMessages();
        try {
            await authService.resendOtp({ email: formData.email, type: 'REGISTER' });
            setSuccessMessage('Mã OTP mới đã được gửi đến email của bạn.');
        } catch (err: any) {
            setError('Không thể gửi lại OTP. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // Renders
    const renderRegisterForm = () => (
        <>
            <div className="login-header">
                <h1 className="login-title">Đăng ký Đối tác</h1>
                <p className="login-subtitle">Bắt đầu hành trình kinh doanh cùng FastBite</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form className="login-form" onSubmit={handleRegisterSubmit}>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Họ</label>
                        <div className="form-input-wrapper">
                            <input
                                type="text"
                                className="form-input"
                                name="lastName"
                                placeholder="Nguyễn"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '16px' }}
                            />
                        </div>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                        <label className="form-label">Tên</label>
                        <div className="form-input-wrapper">
                            <input
                                type="text"
                                className="form-input"
                                name="firstName"
                                placeholder="Văn A"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '16px' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Email</label>
                    <div className="form-input-wrapper">
                        <input
                            type="email"
                            className="form-input"
                            name="email"
                            placeholder="partner@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{ paddingLeft: '16px' }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Số điện thoại</label>
                    <div className="form-input-wrapper">
                        <input
                            type="tel"
                            className="form-input"
                            name="phone"
                            placeholder="0912345678"
                            value={formData.phone}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setFormData(prev => ({ ...prev, phone: val }));
                            }}
                            required
                            style={{ paddingLeft: '16px' }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Ngày sinh</label>
                    <div className="form-input-wrapper">
                        <input
                            type="date"
                            className="form-input"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            required
                            style={{ paddingLeft: '16px' }}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Mật khẩu</label>
                    <div className="form-input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-input"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{ paddingLeft: '16px' }}
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
                    <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        8-16 ký tự, chữ hoa, thường, số & ký tự đặc biệt
                    </span>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
                </button>
            </form>

            <div className="login-footer">
                <p className="footer-text">
                    Đã có tài khoản? <Link to="/login" className="register-link">Đăng nhập ngay</Link>
                </p>
            </div>
        </>
    );

    const renderOtpVerification = () => (
        <>
            {successMessage && <div className="success-message" style={{ marginBottom: '20px' }}>{successMessage}</div>}

            <div className="login-header">
                <h1 className="login-title">Xác thực OTP</h1>
                <p className="login-subtitle">
                    Nhập mã OTP kích hoạt gửi đến <strong>{formData.email}</strong>
                </p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form className="login-form" onSubmit={handleVerifyOtp}>
                <div className="form-group">
                    <div className="form-input-wrapper">
                        <input
                            type="text"
                            className="form-input otp-input"
                            placeholder="123456"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading || otpCode.length !== 6}>
                    {loading ? 'Đang kích hoạt...' : 'Kích hoạt tài khoản'}
                </button>
            </form>

            <div className="resend-container">
                <span style={{ color: 'var(--fastbite-text-secondary)', fontSize: '14px' }}>Không nhận được mã? </span>
                <button
                    type="button"
                    className="text-btn"
                    onClick={handleResendOtp}
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
                    onClick={() => { setCurrentStep('register'); clearMessages(); }}
                >
                    ← Quay lại sửa thông tin
                </button>
            </div>
        </>
    );

    return (
        <div className="partner-login-page">
            <div className="login-branding-panel">
                <div className="branding-overlay"></div>
                <div className="branding-content">
                    <div className="branding-logo">
                        <span className="logo-fast">Fast</span>
                        <span className="logo-bite">Bite</span>
                    </div>
                    <h2 className="branding-title">Chào mừng đối tác mới</h2>
                    <p className="branding-subtitle">
                        Đăng ký ngay để mở rộng kinh doanh và tiếp cận khách hàng tiềm năng.
                    </p>
                </div>
            </div>

            <div className="login-form-panel">
                <div className="login-form-container" style={{ maxWidth: '480px' }}>
                    <div className="login-logo">
                        <span className="logo-text">
                            <span className="fast">Fast</span>
                            <span className="bite">Bite</span>
                        </span>
                    </div>

                    {currentStep === 'register' && renderRegisterForm()}
                    {currentStep === 'otp-verification' && renderOtpVerification()}
                </div>
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Đang xử lý...</p>
                </div>
            )}
        </div>
    );
};

export default PartnerRegisterPage;
