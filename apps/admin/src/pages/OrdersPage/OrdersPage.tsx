import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import '../../styles/table.css';

const getStatusInfo = (s: string) => {
    const map: Record<string, { label: string; cls: string }> = {
        PENDING: { label: 'Chờ xử lý', cls: 'badge--warning' },
        CONFIRMED: { label: 'Đã xác nhận', cls: 'badge--info' },
        PREPARING: { label: 'Đang chuẩn bị', cls: 'badge--info' },
        READY: { label: 'Sẵn sàng', cls: 'badge--purple' },
        DELIVERING: { label: 'Đang giao', cls: 'badge--warning' },
        COMPLETED: { label: 'Hoàn thành', cls: 'badge--success' },
        CANCELED: { label: 'Đã hủy', cls: 'badge--danger' },
    };
    return map[s] || { label: s, cls: 'badge--default' };
};

const OrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await adminService.getOrders(0, 50);
                setOrders(res.result?.content || []);
                setTotal(res.result?.totalElements || 0);
            } catch (error) {
                console.error('Failed to fetch orders', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    if (loading) return <div className="page-loading">Đang tải dữ liệu...</div>;

    return (
        <div className="admin-page animate-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Quản lý Đơn hàng</h2>
                    <p className="page-subtitle">Tổng cộng {total} đơn hàng trong hệ thống</p>
                </div>
            </div>

            <div className="table-card">
                <div className="table-card-header">
                    <span className="table-card-title">Danh sách đơn hàng</span>
                    <span className="table-card-count">{total} bản ghi</span>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Nhà hàng</th>
                            <th>Khách hàng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr><td colSpan={5}><div className="empty-state"><p>Chưa có đơn hàng nào</p></div></td></tr>
                        ) : orders.map(o => {
                            const st = getStatusInfo(o.orderStatus);
                            return (
                                <tr key={o.id}>
                                    <td className="cell-id">#{o.id}</td>
                                    <td className="cell-primary">{o.merchantName || '—'}</td>
                                    <td>{o.customerName || '—'}</td>
                                    <td className="cell-amount">{formatCurrency(o.grandTotal || 0)}</td>
                                    <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdersPage;
