import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import '../../styles/table.css';

const getTypeBadge = (type: string) => {
    const map: Record<string, { label: string; cls: string }> = {
        ORDER_INCOME: { label: 'Thu từ đơn', cls: 'badge--success' },
        PAYMENT: { label: 'Thanh toán', cls: 'badge--info' },
        WITHDRAW: { label: 'Rút tiền', cls: 'badge--danger' },
        DEPOSIT: { label: 'Nạp tiền', cls: 'badge--purple' },
        COMMISSION: { label: 'Hoa hồng', cls: 'badge--warning' },
    };
    return map[type] || { label: type, cls: 'badge--default' };
};

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await adminService.getTransactions(0, 50);
                setTransactions(res.result?.content || []);
                setTotal(res.result?.totalElements || 0);
            } catch (error) {
                console.error('Failed to fetch transactions', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const formatDate = (d: string) =>
        new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (loading) return <div className="page-loading">Đang tải dữ liệu...</div>;

    return (
        <div className="admin-page animate-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Quản lý Giao dịch</h2>
                    <p className="page-subtitle">Tổng cộng {total} giao dịch trong hệ thống</p>
                </div>
            </div>

            <div className="table-card">
                <div className="table-card-header">
                    <span className="table-card-title">Lịch sử giao dịch</span>
                    <span className="table-card-count">{total} bản ghi</span>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Mã GD</th>
                            <th>Loại giao dịch</th>
                            <th>Số tiền</th>
                            <th>Mô tả</th>
                            <th>Thời gian</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr><td colSpan={5}><div className="empty-state"><p>Chưa có giao dịch nào</p></div></td></tr>
                        ) : transactions.map(t => {
                            const tb = getTypeBadge(t.transactionType);
                            const isPos = t.amount > 0;
                            return (
                                <tr key={t.id}>
                                    <td className="cell-id">#{t.id}</td>
                                    <td><span className={`badge ${tb.cls}`}>{tb.label}</span></td>
                                    <td className={`cell-amount ${isPos ? 'cell-positive' : 'cell-negative'}`}>
                                        {isPos ? '+' : ''}{formatCurrency(t.amount)}
                                    </td>
                                    <td>{t.description || '—'}</td>
                                    <td>{t.createdAt ? formatDate(t.createdAt) : '—'}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsPage;
