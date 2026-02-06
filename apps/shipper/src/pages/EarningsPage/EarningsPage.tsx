import React from 'react';
import '../ProfilePage/ProfilePage.css';

const EarningsPage: React.FC = () => {
    // State for mock data (will be replaced by API later if needed)
    const [earnings, setEarnings] = React.useState({
        today: 0,
        completedTrips: 0,
        week: 0,
        month: 0,
        balance: 0 // Thêm init balance
    });
    const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false);
    const [depositAmount, setDepositAmount] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);

    // Mock load data
    React.useEffect(() => {
        fetchWalletStats();
    }, []);

    const fetchWalletStats = async () => {
        try {
            const module = await import('../../services/shipperService');
            const res = await module.default.getWalletStats();
            if (res.result) {
                setEarnings({
                    today: res.result.todayIncome,
                    completedTrips: 0, // Backend chưa trả về
                    week: res.result.weekIncome,
                    month: res.result.monthIncome,
                    balance: res.result.balance // Thêm trường balance
                });
            }
        } catch (err) {
            console.error(err);
        }
    }

    const handleDeposit = async () => {
        if (!depositAmount || isNaN(Number(depositAmount))) {
            alert('Vui lòng nhập số tiền hợp lệ');
            return;
        }

        setIsLoading(true);
        try {
            await import('../../services/shipperService').then(m => m.default.deposit(Number(depositAmount)));
            alert('Nạp tiền thành công!');
            setDepositAmount('');
            setIsDepositModalOpen(false);
            // Reload data
            fetchWalletStats();
        } catch (error) {
            console.error('Deposit failed:', error);
            alert('Nạp tiền thất bại. Vui lòng thử lại.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mobile-wrapper">
            <div className="page-container">
                <header className="page-header-simple">
                    <h2>Thu nhập</h2>
                    <button
                        onClick={() => setIsDepositModalOpen(true)}
                        style={{
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            marginLeft: 'auto'
                        }}
                    >
                        Nạp ví
                    </button>
                </header>

                <main className="profile-content">
                    <div className="profile-info-card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" style={{ margin: '0 auto 1rem' }}>
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: '#2563eb', fontWeight: '700' }}>
                            {/* Hiển thị Balance thay vì Today Income ở dòng to nhất */}
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(earnings.balance || 0)}
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Số dư ví hiện tại</p>
                    </div>

                    <div className="profile-info-card">
                        <div className="info-row">
                            <span className="info-label">Thu nhập hôm nay</span>
                            <span className="info-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(earnings.today || 0)}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Số chuyến hoàn thành</span>
                            <span className="info-value">{earnings.completedTrips}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Thu nhập tuần này</span>
                            <span className="info-value">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(earnings.week || 0)}</span>
                        </div>
                    </div>
                </main>

                {/* Simple Modal for Deposit */}
                {isDepositModalOpen && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{
                            backgroundColor: 'white', padding: '1.5rem', borderRadius: '12px', width: '90%', maxWidth: '320px'
                        }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Nạp tiền vào ví (Demo)</h3>
                            <input
                                type="number"
                                placeholder="Nhập số tiền..."
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '1rem',
                                    fontSize: '1rem'
                                }}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setIsDepositModalOpen(false)}
                                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white' }}
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleDeposit}
                                    disabled={isLoading}
                                    style={{
                                        flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none',
                                        background: isLoading ? '#93c5fd' : '#2563eb', color: 'white', fontWeight: 'bold'
                                    }}
                                >
                                    {isLoading ? 'Đang nạp...' : 'Xác nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EarningsPage;
