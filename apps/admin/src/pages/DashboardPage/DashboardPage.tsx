import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import { ShoppingCart, Bike, TrendingUp, Store, Eye, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './DashboardPage.css';

interface Stats {
    users: number;
    restaurants: number;
    orders: number;
    transactions: number;
}

const DashboardPage = () => {
    const [stats, setStats] = useState<Stats>({ users: 0, restaurants: 0, orders: 0, transactions: 0 });
    const [chartData, setChartData] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [todayGMV, setTodayGMV] = useState<number>(0);
    const [todayCommission, setTodayCommission] = useState<number>(0);
    const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, restsRes, ordersRes, transRes, statsRes, rulesRes] = await Promise.all([
                    adminService.getUsers(0, 1),
                    adminService.getRestaurants(0, 1),
                    adminService.getOrders(0, 5),
                    adminService.getTransactions(0, 1),
                    adminService.getDashboardStats(7),
                    adminService.getSystemRules()
                ]);
                setStats({
                    users: usersRes.result?.totalElements || 0,
                    restaurants: restsRes.result?.totalElements || 0,
                    orders: ordersRes.result?.totalElements || 0,
                    transactions: transRes.result?.totalElements || 0
                });
                setRecentOrders(ordersRes.result?.content || []);
                
                const cData = statsRes.result?.chartData || [];
                setChartData(cData);
                
                let tGMV = 0;
                let tCommission = 0;
                if (cData.length > 0) {
                    tGMV = cData[cData.length - 1].revenue || 0;
                    const platPct = rulesRes.result?.platformFeePercentage || 0;
                    const drvPct = rulesRes.result?.driverFeePercentage || 0;
                    const ordersToday = cData[cData.length - 1].orders || 0;
                    
                    const approxShipping = ordersToday * 15000;
                    const approxSubtotal = Math.max(0, tGMV - approxShipping);
                    
                    tCommission = (approxSubtotal * (platPct / 100)) + (approxShipping * (drvPct / 100));
                }
                setTodayGMV(tGMV);
                setTodayCommission(tCommission);
            } catch (err) {
                console.error('Dashboard fetch failed', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const getStatusLabel = (s: string) => {
        const map: Record<string, { label: string; cls: string }> = {
            COMPLETED: { label: 'Đã giao', cls: 'badge--info' },
            PREPARING: { label: 'Đang chuẩn bị', cls: 'badge--info' },
            READY: { label: 'Chờ lấy hàng', cls: 'badge--info' },
            DELIVERING: { label: 'Đang giao', cls: 'badge--info' },
            CANCELED: { label: 'Đã hủy', cls: 'badge--danger' },
            PENDING: { label: 'Chờ xử lý', cls: 'badge--warning' },
        };
        return map[s] || { label: 'Không rõ', cls: 'badge--default' };
    };

    if (loading) return <div className="page-loading">Đang tải dữ liệu...</div>;

    return (
        <div className="dashboard animate-in">
            {/* Welcome Banner */}
            <div className="welcome-banner">
                <div className="welcome-content">
                    <h2>Chào mừng trở lại, Admin.</h2>
                    <p>Hệ thống quản lý nền tảng giao đồ ăn FastBoss</p>
                </div>
                <div className="welcome-icon">
                    <Store size={48} strokeWidth={1} />
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-row">
                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Tổng số Nhà hàng</span>
                    </div>
                    <div className="stat-body">
                        <span className="stat-value">{stats.restaurants.toLocaleString('vi-VN')}</span>
                        <div className="stat-trend positive">
                            <TrendingUp size={14} /> <span>+4.2%</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Đơn hàng đang xử lý</span>
                        <ShoppingCart size={20} color="#64748b" strokeWidth={1.5} />
                    </div>
                    <div className="stat-body">
                        <span className="stat-value">{stats.orders.toLocaleString('vi-VN')}</span>
                        <div className="stat-trend positive">
                            <TrendingUp size={14} /> <span>+3.8%</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Đã giao hôm nay</span>
                        <Bike size={20} color="#64748b" strokeWidth={1.5} />
                    </div>
                    <div className="stat-body">
                        <span className="stat-value">{(stats.orders > 0 ? Math.floor(stats.orders * 0.8) : 0).toLocaleString('vi-VN')}</span>
                        <div className="stat-trend positive">
                            <TrendingUp size={14} /> <span>+2.8%</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-header">
                        <span className="stat-label">Tổng thu (Toàn hệ thống)</span>
                    </div>
                    <div className="stat-body">
                        <span className="stat-value">{formatCurrency(todayGMV)}</span>
                        <div className="stat-trend positive">
                            <TrendingUp size={14} /> <span>GMV</span>
                        </div>
                    </div>
                </div>

                <div className="stat-card" style={{ border: '1px solid #cce8cd', background: '#f5fbf6' }}>
                    <div className="stat-header">
                        <span className="stat-label" style={{ color: '#16a34a' }}>Lợi nhuận Chiết khấu</span>
                    </div>
                    <div className="stat-body">
                        <span className="stat-value" style={{ color: '#16a34a' }}>{formatCurrency(todayCommission)}</span>
                        <div className="stat-trend positive">
                            <TrendingUp size={14} /> <span>Admin</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dashboard Charts */}
            <div className="charts-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div className="chart-card">
                    <div className="chart-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Biểu đồ Doanh thu (7 ngày qua)</h3>
                    </div>
                    <div className="chart-body" style={{ padding: '24px', height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00b14f" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#00b14f" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 12, fill: '#64748b' }}
                                    tickFormatter={(val) => `${val / 1000000}M`}
                                    dx={-10}
                                />
                                <Tooltip 
                                    formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#00b14f" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card" style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div className="chart-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Thống kê Đơn đặt</h3>
                    </div>
                    <div className="chart-body" style={{ padding: '24px', height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <Tooltip />
                                <Area type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="recent-orders-card">
                <div className="recent-orders-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Đơn hàng gần đây</h3>
                    <Link to="/orders" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Xem tất cả <ChevronRight size={16} />
                    </Link>
                </div>
                <div className="table-wrap">
                    <table className="clean-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Nhà hàng</th>
                                <th>Khách hàng</th>
                                <th>Trạng thái</th>
                                <th>Giá trị</th>
                                <th>Tài xế</th>
                                <th>Thời gian</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.length === 0 ? (
                                <tr><td colSpan={8} className="empty-row">Chưa có đơn hàng nào</td></tr>
                            ) : recentOrders.map((o) => {
                                const st = getStatusLabel(o.orderStatus);
                                return (
                                    <tr key={o.id}>
                                        <td className="cell-id">#{o.id}</td>
                                        <td>{o.merchantName || 'Spice Kitchen'}</td>
                                        <td>{o.customerName || '—'}</td>
                                        <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                                        <td className="cell-money">{formatCurrency(o.grandTotal || 0)}</td>
                                        <td>{o.driverName || '—'}</td>
                                        <td>{new Date(o.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => setSelectedOrder(o)} style={{ color: 'var(--text-muted)', background: 'transparent', padding: '4px', cursor: 'pointer' }} title="Xem chi tiết">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && createPortal(
                <div className="modal-overlay-anim" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', 
                    zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content-anim" style={{
                        background: '#fff', borderRadius: '16px', width: '520px', maxWidth: '90%',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ background: '#f8fafc', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <ShoppingCart size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#0f172a', fontWeight: 700 }}>Chi tiết Đơn hàng</h3>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '2px' }}>Mã đơn: #{selectedOrder.id}</div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} style={{ color: '#94a3b8', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer', outline: 'none' }}>&times;</button>
                        </div>
                        
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Khách hàng</div>
                                    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', lineHeight: '1.4' }}>{selectedOrder.customerName || 'Khách vãng lai'}</div>
                                </div>
                                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Nhà hàng</div>
                                    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem', lineHeight: '1.4' }}>{selectedOrder.merchantName || 'FastBoss Partner'}</div>
                                </div>
                            </div>
                            
                            <div style={{ padding: '16px 0', borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Trạng thái:</span>
                                    <span className={`badge ${getStatusLabel(selectedOrder.orderStatus).cls}`} style={{ margin: 0 }}>{getStatusLabel(selectedOrder.orderStatus).label}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Tài xế giao:</span>
                                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{selectedOrder.driverName || 'Chưa điều phối'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Thời gian tạo:</span>
                                    <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.9rem' }}>{new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                                <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.1rem' }}>Tổng thanh toán</span>
                                <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.4rem' }}>{formatCurrency(selectedOrder.grandTotal || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default DashboardPage;
