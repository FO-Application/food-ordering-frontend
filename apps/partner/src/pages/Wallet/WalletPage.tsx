import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import walletService from '../../services/walletService';
import type { WalletTransactionResponse, DailyStatResponse } from '../../services/walletService';
import './WalletPage.css';

const WalletPage: React.FC = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState<{ firstName: string; lastName: string; email: string } | null>(null);
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<WalletTransactionResponse[]>([]);
    const [dailyStats, setDailyStats] = useState<DailyStatResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [transactionType, setTransactionType] = useState<string>('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchWalletData = async () => {
        setLoading(true);
        try {
            // Fetch Balance and Stats
            const [walletRes, statsRes] = await Promise.all([
                walletService.getMyWallet(),
                walletService.getDailyStats()
            ]);

            if (walletRes.result) {
                setBalance(walletRes.result.balance);
            }

            if (statsRes.result) {
                setDailyStats(statsRes.result);
            }

            // Fetch Transactions 
            await fetchTransactions();

        } catch (error) {
            console.error('Failed to fetch wallet data', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const transactionsRes = await walletService.getMyTransactions(
                page,
                10,
                startDate ? new Date(startDate).toISOString() : undefined,
                endDate ? new Date(endDate).toISOString() : undefined,
                transactionType || undefined
            );

            if (transactionsRes.result) {
                setTransactions(transactionsRes.result.content);
                setTotalPages(transactionsRes.result.totalPages);
            }
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Assuming we have userService available or can import it
                // We need to import userService at the top first
                // For now, let's use the layout's method concept:
                const userData = await import('../../services/userService').then(m => m.default.getMyInfo());
                if (userData?.result) {
                    setUser(userData.result);
                }
            } catch (error) {
                console.error("Failed to fetch user info", error);
            }
        };
        fetchUserData();
        fetchWalletData();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [page, transactionType]); // Only trigger on page type change, dates need button or debounce

    const handleExport = async () => {
        try {
            await walletService.exportTransactions(
                startDate ? new Date(startDate).toISOString() : undefined,
                endDate ? new Date(endDate).toISOString() : undefined,
                transactionType || undefined
            );
        } catch (error) {
            alert('Xuất báo cáo thất bại');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatShortDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    };

    const getOwnerName = () => {
        if (!user) return 'MERCHANT PARTNER';
        if (user.lastName && user.firstName) return `${user.lastName} ${user.firstName}`.toUpperCase();
        return (user.firstName || user.email || 'MERCHANT PARTNER').toUpperCase();
    };

    // Derived Stats
    const totalIncome7Days = dailyStats.reduce((sum, item) => sum + item.income, 0);
    const totalExpense7Days = dailyStats.reduce((sum, item) => sum + item.expense, 0);

    const maxChartValue = Math.max(
        ...dailyStats.map(s => Math.max(s.income, s.expense)),
        100000
    );

    // Withdraw Modal State
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState<number>(0);

    // Deposit Modal State
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [depositAmount, setDepositAmount] = useState<number>(0);

    const handleWithdraw = async () => {
        if (withdrawAmount <= 0) {
            alert("Số tiền rút không hợp lệ!");
            return;
        }
        if (withdrawAmount > balance) {
            alert("Số dư không đủ!");
            return;
        }

        if (!window.confirm(`Bạn có chắc muốn rút ${formatCurrency(withdrawAmount)} về tài khoản liên kết không?`)) {
            return;
        }

        try {
            setLoading(true);
            const res = await walletService.withdraw(withdrawAmount);
            if (res.result) {
                alert("Rút tiền thành công! Tiền sẽ về tài khoản trong 24h.");
                setBalance(res.result.balance);
                setShowWithdrawModal(false);
                setWithdrawAmount(0);
                // Refresh transactions
                fetchTransactions();
            }
        } catch (error) {
            alert("Rút tiền thất bại. Vui lòng thử lại sau.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeposit = async () => {
        if (depositAmount <= 0) {
            alert("Số tiền nạp không hợp lệ!");
            return;
        }

        if (!window.confirm(`Bạn có chắc muốn nạp ${formatCurrency(depositAmount)} vào ví không?`)) {
            return;
        }

        try {
            setLoading(true);
            const res = await walletService.deposit(depositAmount);
            if (res.result) {
                alert("Nạp tiền thành công!");
                setBalance(res.result.balance);
                setShowDepositModal(false);
                setDepositAmount(0);
                // Refresh transactions
                fetchTransactions();
            }
        } catch (error) {
            alert("Nạp tiền thất bại. Vui lòng thử lại sau.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout pageTitle={t('dashboard.wallet')}>
            <div className="wallet-container">
                {/* --- Left Column: Overview & Stats --- */}
                <div className="wallet-main">
                    <div className="wallet-header">
                        <h2 className="section-title">Tổng quan (7 ngày)</h2>
                        <div className="date-filter-simple">
                            {/* Simple date placeholders or active period */}
                            <span>Gần đây</span>
                        </div>
                    </div>

                    <div className="summary-cards">
                        <div className="summary-card income">
                            <div className="icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                    <polyline points="17 6 23 6 23 12"></polyline>
                                </svg>
                            </div>
                            <div className="summary-content">
                                <span className="label">Thu nhập</span>
                                <span className="value">{formatCurrency(totalIncome7Days)}</span>
                            </div>
                        </div>
                        <div className="summary-card expense">
                            <div className="icon-wrapper">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
                                    <polyline points="17 18 23 18 23 12"></polyline>
                                </svg>
                            </div>
                            <div className="summary-content">
                                <span className="label">Chi tiêu</span>
                                <span className="value">{formatCurrency(totalExpense7Days)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="wallet-chart-section">
                        <div className="chart-header">
                            <h3>Thống kê</h3>
                            <div className="chart-legend-mini">
                                <span className="dot income"></span> Thu
                                <span className="dot expense"></span> Chi
                            </div>
                        </div>
                        <div className="chart-visual">
                            <div className="chart-bars-container">
                                {dailyStats.length > 0 ? dailyStats.map((stat, index) => (
                                    <div key={index} className="bar-group">
                                        <div className="bars-wrapper">
                                            <div className="bar-column income" style={{ height: `${(stat.income / maxChartValue) * 100}%` }} title={formatCurrency(stat.income)}></div>
                                            <div className="bar-column expense" style={{ height: `${(stat.expense / maxChartValue) * 100}%` }} title={formatCurrency(stat.expense)}></div>
                                        </div>
                                        <span className="bar-date">{formatShortDate(stat.date.toString())}</span>
                                    </div>
                                )) : <div className="no-data">Chưa có dữ liệu</div>}
                            </div>
                        </div>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="transaction-list-section">
                        <div className="section-header-row">
                            <h3>Giao dịch gần đây</h3>
                            <button className="btn-text" onClick={handleExport}>Xuất báo cáo</button>
                        </div>

                        {/* Filter Tabs */}
                        <div className="filter-tabs">
                            {['', 'PAYMENT', 'WITHDRAWAL', 'REFUND'].map(type => (
                                <button
                                    key={type}
                                    className={`tab-pill ${transactionType === type ? 'active' : ''}`}
                                    onClick={() => { setTransactionType(type); setPage(0); }}
                                >
                                    {type === '' ? 'Tất cả' : type}
                                </button>
                            ))}
                        </div>

                        <div className="transactions-list">
                            {loading && transactions.length === 0 ? (
                                <div className="text-center p-4">Đang tải...</div>
                            ) : transactions.length > 0 ? (
                                transactions.map(tx => (
                                    <div key={tx.id} className="transaction-item">
                                        <div className={`tx-icon ${tx.amount >= 0 ? 'in' : 'out'}`}>
                                            {tx.amount >= 0 ?
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg> :
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M2.25 13.5a8.25 8.25 0 018.25-8.25.75.75 0 01.75.75v6.75H18a.75.75 0 01.75.75 8.25 8.25 0 01-16.5 0z" /><path d="M12.75 3a.75.75 0 01.75-.75 8.25 8.25 0 018.25 8.25.75.75 0 01-.75.75h-7.5a.75.75 0 01-.75-.75V3z" /></svg>
                                            }
                                        </div>
                                        <div className="tx-info">
                                            <div className="tx-desc">{tx.description}</div>
                                            <div className="tx-date">{formatDate(tx.createdAt)}</div>
                                        </div>
                                        <div className={`tx-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                                            {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-list">Chưa có giao dịch nào</div>
                            )}
                        </div>

                        {/* Pagination */}
                        <div className="pagination-mini">
                            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>&lt;</button>
                            <span>{page + 1}/{totalPages || 1}</span>
                            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>&gt;</button>
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Card & Quick Actions --- */}
                <div className="wallet-sidebar">
                    {/* Virtual Card */}
                    <div className="virtual-card">
                        <div className="card-top" style={{ justifyContent: 'space-between' }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nfc-icon" style={{ width: 24, height: 24, opacity: 0.8 }}>
                                <path d="M14 14.66a5 5 0 0 1-4 0" strokeLinecap="round" />
                                <path d="M17.6 11a9 9 0 0 1-11.2 0" strokeLinecap="round" />
                                <path d="M21.2 7.4a13 13 0 0 1-18.4 0" strokeLinecap="round" />
                            </svg>
                            <span className="card-brand">FastWallet</span>
                        </div>
                        <div className="card-middle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
                            <span className="card-number" style={{ fontSize: '1.2rem', letterSpacing: '4px', opacity: 0.9 }}>
                                **** **** **** 8888
                            </span>
                            <div className="card-balance">
                                {formatCurrency(balance)}
                            </div>
                        </div>
                        <div className="card-bottom">
                            <div className="card-holder">
                                <span className="holder-label">Chủ sở hữu</span>
                                <span className="holder-name mt-1">{getOwnerName()}</span>
                            </div>
                            <div className="card-chip">
                                <div className="chip-line"></div>
                                <div className="chip-line"></div>
                                <div className="chip-line"></div>
                                <div className="chip-line"></div>
                            </div>
                        </div>
                    </div>

                    {/* Total Balance Big Display (Optional redundancy from image) */}
                    <div className="balance-metrics">
                        <div className="metric-item">
                            <span className="metric-label">Số dư khả dụng</span>
                            <span className="metric-value">{formatCurrency(balance)}</span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <h4>Thao tác nhanh</h4>
                        <div className="action-buttons">
                            <button className="action-btn withdraw" onClick={() => setShowWithdrawModal(true)} title="Rút tiền">
                                <div className="btn-icon-img">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 21H21" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M5 21V10" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M19 21V10" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2 10L12 3L22 10" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 14V17" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M10 16L12 18L14 16" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div className="btn-content">
                                    <span className="btn-label">Rút tiền</span>
                                    <span className="btn-subtext">Về ngân hàng</span>
                                </div>
                            </button>
                            <button className="action-btn deposit" title="Nạp tiền" onClick={() => setShowDepositModal(true)}>
                                <div className="btn-icon-img">
                                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M16 12H21" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M3 7L21 7" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M12 14V10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                                        <path d="M10 12H14" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="btn-content">
                                    <span className="btn-label">Nạp tiền</span>
                                    <span className="btn-subtext">Vào ví</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Rút tiền về ví linked</h3>
                            <button onClick={() => setShowWithdrawModal(false)} className="close-btn">&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Số tiền muốn rút</label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                                    className="modal-input"
                                    placeholder="Nhập số tiền (VD: 500000)"
                                />
                                <small className="text-gray-500">Số dư khả dụng: {formatCurrency(balance)}</small>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowWithdrawModal(false)}>Hủy</button>
                            <button className="btn-primary" onClick={handleWithdraw} disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Nạp tiền vào ví</h3>
                            <button onClick={() => setShowDepositModal(false)} className="close-btn">&times;</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Số tiền muốn nạp</label>
                                <input
                                    type="number"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                                    className="modal-input"
                                    placeholder="Nhập số tiền (VD: 500000)"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowDepositModal(false)}>Hủy</button>
                            <button className="btn-primary" onClick={handleDeposit} disabled={loading}>
                                {loading ? 'Đang xử lý...' : 'Xác nhận nạp tiền'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default WalletPage;
