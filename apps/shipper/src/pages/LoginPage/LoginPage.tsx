import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
// CSS is now handled by App.css globally

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login({ email, password });
            if (response.result && response.result.accessToken) {
                if (response.result.role !== 'SHIPPER') {
                    setError('Tài khoản này không phải Shipper.');
                    return;
                }
                localStorage.setItem('shipper_authenticated', 'true');
                navigate('/dashboard');
            } else {
                setError('Đăng nhập thất bại.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mobile-container">
            <header className="page-header">
                <h1>FastBite Driver</h1>
                <p>Đăng nhập để bắt đầu nhận đơn</p>
            </header>

            <main className="page-content">
                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleLogin} className="mobile-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="example@gmail.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
                    </button>

                    <div className="link-area">
                        Chưa có tài khoản? <br />
                        <span
                            className="text-link"
                            onClick={() => navigate('/register')}
                        >
                            Đăng ký làm Tài xế
                        </span>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default LoginPage;
