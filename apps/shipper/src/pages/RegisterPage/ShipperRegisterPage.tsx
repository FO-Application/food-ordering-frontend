import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService, { ShipperRegisterRequest } from '../../services/authService';
import './RegisterPage.css';

const ShipperRegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER');

    // Register Form Data
    const [formData, setFormData] = useState<ShipperRegisterRequest>({
        firstName: '', lastName: '', email: '', phone: '', dob: '', password: ''
    });

    // OTP Data
    const [otp, setOtp] = useState('');

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'error' | 'success', text: string } | null>(null);

    const showMsg = (text: string, type: 'error' | 'success' = 'error') => {
        setMsg({ text, type });
        // Auto clear success msg only
        if (type === 'success') setTimeout(() => setMsg(null), 5000);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            await authService.signUpShipper(formData);
            showMsg('Đăng ký thành công! Vui lòng kiểm tra email để lấy OTP.', 'success');
            setStep('OTP');
        } catch (err: any) {
            showMsg(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg(null);
        try {
            await authService.verifyOtpAndRegister(formData.email, otp);
            showMsg('Kích hoạt tài khoản thành công! Đang chuyển hướng...', 'success');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            showMsg(err.response?.data?.message || 'OTP không chính xác.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await authService.resendOtp(formData.email, 'REGISTER');
            showMsg('Đã gửi lại mã OTP vào email.', 'success');
        } catch (err) {
            showMsg('Không thể gửi lại OTP.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mobile-container register-page">
            <header className="page-header">
                <h2>{step === 'REGISTER' ? 'Đăng ký Shipper' : 'Xác thực OTP'}</h2>
                <p>{step === 'REGISTER' ? 'Tham gia đội ngũ Shipper ngay hôm nay' : `Mã OTP đã gửi tới ${formData.email}`}</p>
            </header>

            <main className="page-content">
                {msg && <div className={`alert ${msg.type}`}>{msg.text}</div>}

                {step === 'REGISTER' ? (
                    <form onSubmit={handleRegister} className="mobile-form">
                        <div className="row-2">
                            <div className="form-group">
                                <label>Họ</label>
                                <input placeholder="Nguyễn" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label>Tên</label>
                                <input placeholder="Văn A" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="example@gmail.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        </div>

                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input type="tel" placeholder="09xxxx" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                        </div>

                        <div className="form-group">
                            <label>Ngày sinh</label>
                            <input type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} required />
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu</label>
                            <input type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required minLength={8} />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Đang xử lý...' : 'Tiếp tục'}
                        </button>

                        <div className="link-area">
                            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} className="mobile-form">
                        <div className="form-group">
                            <label>Nhập mã OTP (6 số)</label>
                            <input
                                type="text"
                                className="otp-input"
                                maxLength={6}
                                placeholder="000000"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading || otp.length < 6}>
                            {loading ? 'Đang xác thực...' : 'Kích hoạt tài khoản'}
                        </button>

                        <button type="button" className="btn-text" onClick={handleResend} disabled={loading}>
                            Gửi lại mã OTP
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
};

export default ShipperRegisterPage;
