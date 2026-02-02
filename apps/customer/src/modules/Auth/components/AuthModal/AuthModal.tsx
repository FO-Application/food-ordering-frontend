import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { signInWithPopup, type AuthProvider } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../../../../configs/firebase';
import authService, { type UserRequest, type VerifyOtpRequest } from '../../../../services/authService';
import './AuthModal.css';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess?: () => void; // Callback after successful login
}

type AuthStep = 'login' | 'signup' | 'otp-verification' | 'forgot-password' | 'otp-verify-reset' | 'reset-password';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }: AuthModalProps) => {
    const { t } = useTranslation();

    // Current step/view
    const [currentStep, setCurrentStep] = useState<AuthStep>('login');

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Login form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);

    // Sign up form state
    const [signUpData, setSignUpData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        dob: ''
    });

    // OTP verification state
    const [otpEmail, setOtpEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');

    // Forgot/Reset password state
    const [forgotEmail, setForgotEmail] = useState('');
    const [resetOtpCode, setResetOtpCode] = useState('');
    const [verifiedOtp, setVerifiedOtp] = useState(''); // OTP đã xác thực thành công
    const [resetData, setResetData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // ==================== VALIDATION ====================

    const validatePassword = (pwd: string) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,16}$/;
        return regex.test(pwd);
    };

    const validatePhone = (phone: string) => {
        return /^\d{10}$/.test(phone);
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    // ==================== HANDLERS ====================

    const handleSignUpChange = (field: string, value: string) => {
        setSignUpData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const clearMessages = () => {
        setErrorMessage(null);
        setSuccessMessage(null);
    };

    // ==================== SOCIAL LOGIN ====================

    const handleSocialLogin = async (provider: AuthProvider, providerName: string) => {
        setLoading(true);
        clearMessages();

        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const firebaseIdToken = await user.getIdToken();

            console.log(`[AuthModal] ${providerName} login successful, sending token to backend...`);

            const response = await authService.socialLogin({ token: firebaseIdToken });

            if (response.code === 1000 && response.result) {
                console.log('[AuthModal] Backend authentication successful:', response.message);
                setSuccessMessage('Đăng nhập thành công!');
                setTimeout(() => {
                    onClose();
                    onLoginSuccess?.(); // Trigger callback instead of redirect
                }, 500);
            }
        } catch (err: any) {
            console.error(`[AuthModal] ${providerName} login failed:`, err);

            if (err.code) {
                switch (err.code) {
                    case 'auth/popup-closed-by-user':
                        setErrorMessage('Đăng nhập đã bị hủy. Vui lòng thử lại.');
                        break;
                    case 'auth/popup-blocked':
                        setErrorMessage('Popup bị chặn. Vui lòng bật popup và thử lại.');
                        break;
                    case 'auth/account-exists-with-different-credential':
                        setErrorMessage('Tài khoản đã tồn tại với email này.');
                        break;
                    default:
                        setErrorMessage(`Lỗi: ${err.message}`);
                }
            } else if (err.response?.data?.message) {
                setErrorMessage(err.response.data.message);
            } else {
                setErrorMessage('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => handleSocialLogin(googleProvider, 'Google');
    const handleFacebookLogin = () => handleSocialLogin(facebookProvider, 'Facebook');

    // ==================== EMAIL/PASSWORD LOGIN ====================

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            const response = await authService.login({ email, password });

            if (response.code === 1000 && response.result) {
                setSuccessMessage('Đăng nhập thành công!');
                console.log('[AuthModal] Login successful, role:', response.result.role);

                setTimeout(() => {
                    onClose();
                    onLoginSuccess?.(); // Trigger callback
                }, 500);
            }
        } catch (err: any) {
            console.error('[AuthModal] Login failed:', err);
            const message = err.response?.data?.message || 'Email hoặc mật khẩu không đúng';
            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    // ==================== SIGN UP ====================

    const handleSignUpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        // Validate all fields
        if (!signUpData.email) {
            newErrors.email = t('validation.emailRequired');
        } else if (!validateEmail(signUpData.email)) {
            newErrors.email = t('validation.emailInvalid');
        }

        if (!signUpData.password) {
            newErrors.password = t('validation.passwordRequired');
        } else if (!validatePassword(signUpData.password)) {
            newErrors.password = t('validation.passwordInvalid');
        }

        if (!signUpData.firstName) {
            newErrors.firstName = t('validation.firstNameRequired');
        }

        if (!signUpData.lastName) {
            newErrors.lastName = t('validation.lastNameRequired');
        }

        if (!signUpData.phone) {
            newErrors.phone = t('validation.phoneRequired');
        } else if (!validatePhone(signUpData.phone)) {
            newErrors.phone = t('validation.phoneInvalid');
        }

        if (!signUpData.dob) {
            newErrors.dob = t('validation.dobRequired');
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            clearMessages();

            try {
                const requestData: UserRequest = {
                    email: signUpData.email,
                    password: signUpData.password,
                    firstName: signUpData.firstName,
                    lastName: signUpData.lastName,
                    phone: signUpData.phone,
                    dob: signUpData.dob
                };

                const response = await authService.signUpCustomer(requestData);

                if (response.result) {
                    setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP.');
                    setOtpEmail(signUpData.email);
                    setTimeout(() => {
                        setCurrentStep('otp-verification');
                        clearMessages();
                    }, 1500);
                }
            } catch (err: any) {
                console.error('[AuthModal] Sign up failed:', err);
                const message = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
                setErrorMessage(message);

                // Handle field-specific errors from backend
                if (err.response?.data?.result) {
                    const backendErrors = err.response.data.result;
                    setErrors(prev => ({ ...prev, ...backendErrors }));
                }
            } finally {
                setLoading(false);
            }
        }
    };

    // ==================== OTP VERIFICATION ====================

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            const requestData: VerifyOtpRequest = {
                email: otpEmail,
                otpCode: otpCode
            };

            const response = await authService.verifyOtpAndRegister(requestData);

            if (response.result) {
                setSuccessMessage('Xác thực thành công! Bạn có thể đăng nhập.');
                setTimeout(() => {
                    setCurrentStep('login');
                    setEmail(otpEmail);
                    clearMessages();
                }, 1500);
            }
        } catch (err: any) {
            console.error('[AuthModal] OTP verification failed:', err);
            const message = err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn';
            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setLoading(true);
        clearMessages();

        try {
            await authService.resendOtp({ email: otpEmail, type: 'REGISTER' });
            setSuccessMessage('Mã OTP mới đã được gửi đến email của bạn.');
        } catch (err: any) {
            console.error('[AuthModal] Resend OTP failed:', err);
            setErrorMessage('Không thể gửi lại OTP. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // ==================== FORGOT PASSWORD ====================

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            await authService.forgotPassword(forgotEmail);
            setSuccessMessage(t('auth.otpSent') || 'Mã OTP đã được gửi đến email của bạn.');
            setResetData(prev => ({ ...prev, email: forgotEmail }));
            setResetOtpCode('');
            setTimeout(() => {
                setCurrentStep('otp-verify-reset');
                clearMessages();
            }, 1500);
        } catch (err: any) {
            console.error('[AuthModal] Forgot password failed:', err);
            const message = err.response?.data?.message || 'Email không tồn tại trong hệ thống';
            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    // ==================== VERIFY OTP FOR RESET PASSWORD ====================

    const handleVerifyResetOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        clearMessages();

        try {
            const response = await authService.verifyForgotPasswordOtp(resetData.email, resetOtpCode);

            if (response.result === true) {
                setSuccessMessage('OTP hợp lệ! Vui lòng nhập mật khẩu mới.');
                setVerifiedOtp(resetOtpCode); // Lưu OTP đã xác thực
                setTimeout(() => {
                    setCurrentStep('reset-password');
                    clearMessages();
                }, 1500);
            } else {
                setErrorMessage('Mã OTP không đúng hoặc đã hết hạn.');
            }
        } catch (err: any) {
            console.error('[AuthModal] Verify OTP failed:', err);
            const message = err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn';
            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validatePassword(resetData.newPassword)) {
            setErrorMessage('Mật khẩu phải từ 8-16 ký tự, có chữ hoa, thường, số và ký tự đặc biệt');
            return;
        }

        if (resetData.newPassword !== resetData.confirmPassword) {
            setErrorMessage('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);
        clearMessages();

        try {
            // Gửi kèm OTP đã xác thực để backend validate lại
            await authService.resetPassword({
                email: resetData.email,
                newPassword: resetData.newPassword,
                otp: verifiedOtp
            });
            setSuccessMessage(t('auth.resetSuccess') || 'Đổi mật khẩu thành công! Bạn có thể đăng nhập.');
            setTimeout(() => {
                setCurrentStep('login');
                setEmail(resetData.email);
                clearMessages();
                // Reset states
                setVerifiedOtp('');
                setResetOtpCode('');
            }, 1500);
        } catch (err: any) {
            console.error('[AuthModal] Reset password failed:', err);
            const message = err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
            setErrorMessage(message);
        } finally {
            setLoading(false);
        }
    };

    const handleResendResetOtp = async () => {
        setLoading(true);
        clearMessages();

        try {
            await authService.resendOtp({ email: resetData.email, type: 'FORGOT_PASSWORD' });
            setSuccessMessage(t('auth.otpSent') || 'Mã OTP mới đã được gửi đến email của bạn.');
        } catch (err: any) {
            console.error('[AuthModal] Resend OTP failed:', err);
            setErrorMessage(t('auth.resendOtpError') || 'Không thể gửi lại OTP. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    // ==================== RENDER ====================

    if (!isOpen) return null;

    const renderLoginForm = () => (
        <>
            <h2 className="auth-title">{t('auth.login')}</h2>
            <p className="auth-subtitle">{t('auth.loginSubtitle')}</p>

            <form className="auth-form" onSubmit={handleLoginSubmit}>
                <div className="auth-input-group">
                    <label htmlFor="login-email" className="auth-label">{t('auth.email')}</label>
                    <input
                        type="email"
                        id="login-email"
                        className="auth-input"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="auth-input-group">
                    <label htmlFor="login-password" className="auth-label">{t('auth.password')}</label>
                    <input
                        type="password"
                        id="login-password"
                        className="auth-input"
                        placeholder={t('auth.password')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <div className="auth-options">
                    <label className="auth-checkbox-label">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="auth-checkbox"
                        />
                        <span className="auth-checkbox-custom"></span>
                        {t('auth.rememberMe')}
                    </label>
                    <button
                        type="button"
                        className="auth-forgot-btn"
                        onClick={() => { setCurrentStep('forgot-password'); clearMessages(); }}
                    >
                        {t('auth.forgotPassword') || 'Quên mật khẩu?'}
                    </button>
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <span className="auth-loading-spinner"></span> : t('auth.continue')}
                </button>
            </form>

            <div className="auth-divider">
                <span>{t('auth.or')}</span>
            </div>

            {/* Social Login */}
            <div className="auth-social">
                <button
                    type="button"
                    className="auth-social-btn google"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {t('auth.continueGoogle')}
                </button>

                <button
                    type="button"
                    className="auth-social-btn facebook"
                    onClick={handleFacebookLogin}
                    disabled={loading}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    {t('auth.continueFacebook')}
                </button>
            </div>

            <div className="auth-toggle">
                <span>{t('auth.noAccount')}</span>
                <button
                    type="button"
                    className="auth-toggle-btn"
                    onClick={() => { setCurrentStep('signup'); clearMessages(); setErrors({}); }}
                >
                    {t('auth.signupBtn')}
                </button>
            </div>
        </>
    );

    const renderSignUpForm = () => (
        <>
            <h2 className="auth-title">{t('auth.signup')}</h2>
            <p className="auth-subtitle">{t('auth.signupSubtitle')}</p>

            <form className="auth-form" onSubmit={handleSignUpSubmit}>
                <div className="auth-input-row">
                    <div className="auth-input-group">
                        <label htmlFor="lastName" className="auth-label">{t('auth.lastName')} *</label>
                        <input
                            type="text"
                            id="lastName"
                            className={`auth-input ${errors.lastName ? 'error' : ''}`}
                            placeholder="Nguyễn"
                            value={signUpData.lastName}
                            onChange={(e) => handleSignUpChange('lastName', e.target.value)}
                            disabled={loading}
                        />
                        {errors.lastName && <span className="auth-error">{errors.lastName}</span>}
                    </div>
                    <div className="auth-input-group">
                        <label htmlFor="firstName" className="auth-label">{t('auth.firstName')} *</label>
                        <input
                            type="text"
                            id="firstName"
                            className={`auth-input ${errors.firstName ? 'error' : ''}`}
                            placeholder="Văn A"
                            value={signUpData.firstName}
                            onChange={(e) => handleSignUpChange('firstName', e.target.value)}
                            disabled={loading}
                        />
                        {errors.firstName && <span className="auth-error">{errors.firstName}</span>}
                    </div>
                </div>

                <div className="auth-input-group">
                    <label htmlFor="signup-email" className="auth-label">{t('auth.email')} *</label>
                    <input
                        type="email"
                        id="signup-email"
                        className={`auth-input ${errors.email ? 'error' : ''}`}
                        placeholder="example@email.com"
                        value={signUpData.email}
                        onChange={(e) => handleSignUpChange('email', e.target.value)}
                        disabled={loading}
                    />
                    {errors.email && <span className="auth-error">{errors.email}</span>}
                </div>

                <div className="auth-input-group">
                    <label htmlFor="phone" className="auth-label">{t('auth.phone')} *</label>
                    <input
                        type="tel"
                        id="phone"
                        className={`auth-input ${errors.phone ? 'error' : ''}`}
                        placeholder="0987654321"
                        value={signUpData.phone}
                        onChange={(e) => handleSignUpChange('phone', e.target.value)}
                        maxLength={10}
                        disabled={loading}
                    />
                    {errors.phone && <span className="auth-error">{errors.phone}</span>}
                </div>

                <div className="auth-input-group">
                    <label htmlFor="dob" className="auth-label">{t('auth.dob')} *</label>
                    <input
                        type="date"
                        id="dob"
                        className={`auth-input ${errors.dob ? 'error' : ''}`}
                        value={signUpData.dob}
                        onChange={(e) => handleSignUpChange('dob', e.target.value)}
                        disabled={loading}
                    />
                    {errors.dob && <span className="auth-error">{errors.dob}</span>}
                </div>

                <div className="auth-input-group">
                    <label htmlFor="signup-password" className="auth-label">{t('auth.password')} *</label>
                    <input
                        type="password"
                        id="signup-password"
                        className={`auth-input ${errors.password ? 'error' : ''}`}
                        placeholder="StrongP@ss01"
                        value={signUpData.password}
                        onChange={(e) => handleSignUpChange('password', e.target.value)}
                        disabled={loading}
                    />
                    <span className="auth-hint">{t('auth.passwordHint')}</span>
                    {errors.password && <span className="auth-error">{errors.password}</span>}
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <span className="auth-loading-spinner"></span> : t('auth.signupBtn')}
                </button>
            </form>

            <div className="auth-toggle">
                <span>{t('auth.haveAccount')}</span>
                <button
                    type="button"
                    className="auth-toggle-btn"
                    onClick={() => { setCurrentStep('login'); clearMessages(); setErrors({}); }}
                >
                    {t('auth.login')}
                </button>
            </div>
        </>
    );

    const renderOtpVerification = () => (
        <>
            <h2 className="auth-title">Xác thực OTP</h2>
            <p className="auth-subtitle">Nhập mã OTP đã được gửi đến email <strong>{otpEmail}</strong></p>

            <form className="auth-form" onSubmit={handleVerifyOtp}>
                <div className="auth-input-group">
                    <label htmlFor="otp-code" className="auth-label">Mã OTP</label>
                    <input
                        type="text"
                        id="otp-code"
                        className="auth-input otp-input"
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        disabled={loading}
                        autoComplete="one-time-code"
                    />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading || otpCode.length !== 6}>
                    {loading ? <span className="auth-loading-spinner"></span> : 'Xác thực'}
                </button>
            </form>

            <div className="auth-resend">
                <span>Không nhận được mã? </span>
                <button
                    type="button"
                    className="auth-toggle-btn"
                    onClick={handleResendOtp}
                    disabled={loading}
                >
                    Gửi lại OTP
                </button>
            </div>

            <div className="auth-toggle">
                <button
                    type="button"
                    className="auth-toggle-btn"
                    onClick={() => { setCurrentStep('signup'); clearMessages(); }}
                >
                    ← Quay lại đăng ký
                </button>
            </div>
        </>
    );

    const renderForgotPassword = () => (
        <>
            <h2 className="auth-title">{t('auth.forgotPasswordTitle') || 'Quên mật khẩu'}</h2>
            <p className="auth-subtitle">{t('auth.forgotPasswordSubtitle') || 'Nhập email của bạn để nhận mã OTP đặt lại mật khẩu'}</p>

            <form className="auth-form" onSubmit={handleForgotPassword}>
                <div className="auth-input-group">
                    <label htmlFor="forgot-email" className="auth-label">Email</label>
                    <input
                        type="email"
                        id="forgot-email"
                        className="auth-input"
                        placeholder="example@email.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        disabled={loading}
                    />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <span className="auth-loading-spinner"></span> : t('auth.sendOtp') || 'Gửi mã OTP'}
                </button>
            </form>

            <div className="auth-toggle">
                <button
                    type="button"
                    className="auth-toggle-btn"
                    onClick={() => { setCurrentStep('login'); clearMessages(); }}
                >
                    ← {t('auth.backToLogin') || 'Quay lại đăng nhập'}
                </button>
            </div>
        </>
    );

    const renderOtpVerifyReset = () => (
        <>
            <h2 className="auth-title">{t('auth.verifyOtpTitle') || 'Xác thực OTP'}</h2>
            <p className="auth-subtitle">
                {t('auth.verifyOtpSubtitle') || 'Nhập mã OTP đã được gửi đến email'} <strong>{resetData.email}</strong>
            </p>

            <form className="auth-form" onSubmit={handleVerifyResetOtp}>
                <div className="auth-input-group">
                    <label htmlFor="reset-otp" className="auth-label">{t('auth.enterOtp') || 'Mã OTP'}</label>
                    <input
                        type="text"
                        id="reset-otp"
                        className="auth-input otp-input"
                        placeholder="123456"
                        value={resetOtpCode}
                        onChange={(e) => setResetOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        disabled={loading}
                        autoComplete="one-time-code"
                    />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading || resetOtpCode.length !== 6}>
                    {loading ? <span className="auth-loading-spinner"></span> : t('auth.verifyOtp') || 'Xác thực OTP'}
                </button>
            </form>

            <div className="auth-resend">
                <span>{t('auth.otpNotReceived') || 'Không nhận được mã?'} </span>
                <button
                    type="button"
                    className="auth-toggle-btn"
                    onClick={handleResendResetOtp}
                    disabled={loading}
                >
                    {t('auth.resendOtp') || 'Gửi lại OTP'}
                </button>
            </div>

            <div className="auth-toggle">
                <button
                    type="button"
                    className="auth-toggle-btn"
                    onClick={() => { setCurrentStep('forgot-password'); clearMessages(); }}
                >
                    ← {t('auth.backToEmail') || 'Quay lại nhập email'}
                </button>
            </div>
        </>
    );

    const renderResetPassword = () => (
        <>
            <h2 className="auth-title">{t('auth.resetPasswordTitle') || 'Đặt mật khẩu mới'}</h2>
            <p className="auth-subtitle">
                {t('auth.resetPasswordSubtitle') || 'Nhập mật khẩu mới cho tài khoản'} <strong>{resetData.email}</strong>
            </p>

            <form className="auth-form" onSubmit={handleResetPassword}>
                <div className="auth-input-group">
                    <label htmlFor="new-password" className="auth-label">{t('auth.newPassword') || 'Mật khẩu mới'}</label>
                    <input
                        type="password"
                        id="new-password"
                        className="auth-input"
                        placeholder="StrongP@ss01"
                        value={resetData.newPassword}
                        onChange={(e) => setResetData(prev => ({ ...prev, newPassword: e.target.value }))}
                        disabled={loading}
                    />
                    <span className="auth-hint">8-16 ký tự, có chữ hoa, thường, số và ký tự đặc biệt</span>
                </div>

                <div className="auth-input-group">
                    <label htmlFor="confirm-password" className="auth-label">{t('auth.confirmPassword') || 'Xác nhận mật khẩu'}</label>
                    <input
                        type="password"
                        id="confirm-password"
                        className="auth-input"
                        placeholder="StrongP@ss01"
                        value={resetData.confirmPassword}
                        onChange={(e) => setResetData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={loading}
                    />
                </div>

                <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? <span className="auth-loading-spinner"></span> : t('auth.changePassword') || 'Đổi mật khẩu'}
                </button>
            </form>

            <div className="auth-toggle">
                <button
                    type="button"
                    className="auth-toggle-btn"
                    onClick={() => { setCurrentStep('login'); clearMessages(); }}
                >
                    ← {t('auth.backToLogin') || 'Quay lại đăng nhập'}
                </button>
            </div>
        </>
    );

    const renderContent = () => {
        switch (currentStep) {
            case 'login':
                return renderLoginForm();
            case 'signup':
                return renderSignUpForm();
            case 'otp-verification':
                return renderOtpVerification();
            case 'forgot-password':
                return renderForgotPassword();
            case 'otp-verify-reset':
                return renderOtpVerifyReset();
            case 'reset-password':
                return renderResetPassword();
            default:
                return renderLoginForm();
        }
    };

    return (
        <>
            {/* Overlay */}
            <div className="auth-overlay" onClick={onClose} />

            {/* Modal */}
            <div className={`auth-modal ${currentStep === 'signup' ? 'signup-mode' : ''}`}>
                {/* Header */}
                <div className="auth-header">
                    <span className="auth-logo">
                        <span className="logo-fast">Fast</span>
                        <span className="logo-bite">Bite</span>
                    </span>
                    <button className="auth-close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="auth-content">
                    {/* Messages */}
                    {errorMessage && (
                        <div className="auth-message error">
                            <span>{errorMessage}</span>
                            <button onClick={() => setErrorMessage(null)}>×</button>
                        </div>
                    )}
                    {successMessage && (
                        <div className="auth-message success">
                            <span>✓ {successMessage}</span>
                        </div>
                    )}

                    {renderContent()}

                    {/* Footer */}
                    <div className="auth-footer">
                        <p>© 2026 Fast Bite. <a href="#">{t('auth.terms')}</a> & <a href="#">{t('auth.privacy')}</a></p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthModal;
