import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import shipperService from '../../services/shipperService';
import './VehicleRegistrationPage.css';

const VehicleRegistrationPage: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        vehicleNumber: '',
        vehicleType: 'MOTORBIKE' // Default
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await shipperService.registerShipper(formData);
            // Success -> Go to Dashboard
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mobile-container vehicle-register-page">
            <header className="page-header">
                <h2>Thông tin phương tiện</h2>
                <p>Để bắt đầu nhận đơn, bạn cần đăng ký xe.</p>
            </header>

            <main className="page-content">
                {error && <div className="alert error">{error}</div>}

                <form onSubmit={handleSubmit} className="mobile-form">
                    <div className="form-group">
                        <label>Biển số xe</label>
                        <input
                            type="text"
                            placeholder="Vd: 59P1-123.45"
                            value={formData.vehicleNumber}
                            onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Loại xe</label>
                        <select
                            value={formData.vehicleType}
                            onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                        >
                            <option value="MOTORBIKE">Xe máy</option>
                            <option value="CAR">Ô tô</option>
                            <option value="BICYCLE">Xe đạp</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Hoàn tất đăng ký'}
                    </button>

                    <button type="button" className="btn-text secondary" onClick={() => {
                        localStorage.removeItem('shipper_authenticated');
                        navigate('/login');
                    }}>
                        Đăng xuất
                    </button>
                </form>
            </main>
        </div>
    );
};

export default VehicleRegistrationPage;
