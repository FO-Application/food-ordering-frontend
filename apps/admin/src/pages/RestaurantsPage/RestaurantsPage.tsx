import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import adminService from '../../services/adminService';
import '../../styles/table.css';
import { Check, Trash2, Lock, AlertTriangle } from 'lucide-react';

const RestaurantsPage = () => {
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'confirm' | 'alert';
        variant: 'danger' | 'warning' | 'success';
        onConfirm?: () => void;
    }>({ isOpen: false, title: '', message: '', type: 'alert', variant: 'success' });

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const res = await adminService.getRestaurants(0, 50);
            setRestaurants(res.result?.content || []);
            setTotal(res.result?.totalElements || 0);
        } catch (error) {
            console.error('Failed to fetch restaurants', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const showConfirm = (title: string, message: string, variant: 'danger' | 'warning', onConfirm: () => void) => {
        setModal({ isOpen: true, type: 'confirm', title, message, variant, onConfirm });
    };

    const showAlert = (title: string, message: string, variant: 'success' | 'danger') => {
        setModal({ isOpen: true, type: 'alert', title, message, variant });
    };

    const handleApprove = (id: number) => {
        showConfirm('Xác nhận phê duyệt', 'Bạn có chắc muốn phê duyệt nhà hàng này? Hệ thống sẽ gửi email thông báo đến đối tác.', 'warning', async () => {
            try {
                await adminService.approveRestaurant(id);
                setModal(prev => ({ ...prev, isOpen: false }));
                showAlert('Thành công', 'Đã phê duyệt và gửi email thành công!', 'success');
                fetchRestaurants();
            } catch (e) {
                showAlert('Lỗi', 'Có lỗi xảy ra khi phê duyệt!', 'danger');
            }
        });
    };

    const handleBlock = (id: number) => {
        showConfirm('Khóa nhà hàng', 'Khóa nhà hàng sẽ làm quán bị ẩn khỏi ứng dụng. Bạn có chắc?', 'warning', async () => {
            try {
                await adminService.blockRestaurant(id);
                setModal(prev => ({ ...prev, isOpen: false }));
                showAlert('Thành công', 'Đã khóa nhà hàng thành công!', 'success');
                fetchRestaurants();
            } catch (e) {
                showAlert('Lỗi', 'Có lỗi xảy ra khi khóa!', 'danger');
            }
        });
    };

    const handleDelete = (id: number) => {
        showConfirm('Xóa nhà hàng', 'Hành động này không thể hoàn tác. Nhà hàng sẽ bị xóa vĩnh viễn khỏi hệ thống.', 'danger', async () => {
            try {
                await adminService.deleteRestaurant(id);
                setModal(prev => ({ ...prev, isOpen: false }));
                showAlert('Thành công', 'Đã xóa nhà hàng khỏi hệ thống!', 'success');
                fetchRestaurants();
            } catch (e) {
                showAlert('Lỗi', 'Có lỗi xảy ra khi xóa nhà hàng!', 'danger');
            }
        });
    };

    if (loading && restaurants.length === 0) return <div className="page-loading">Đang tải dữ liệu...</div>;

    return (
        <div className="admin-page animate-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 className="page-title">Quản lý Đối tác Nhà Hàng</h2>
                    <p className="page-subtitle">Tổng cộng {total} nhà hàng trong hệ thống</p>
                </div>
                <div>
                    <button style={{
                        background: '#16a34a', color: '#fff', padding: '10px 20px', 
                        borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.2)'
                    }} onClick={() => showAlert('Thông báo', 'Vui lòng tạo mới qua cổng Đăng ký Web Đối tác riêng.', 'success')}>
                        + Thêm Nhà Hàng
                    </button>
                </div>
            </div>

            <div className="table-card" style={{ padding: 0 }}>
                <div className="table-card-header" style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                    <span className="table-card-title" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Danh sách nhà hàng chờ duyệt / đang hoạt động</span>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '24px' }}>ID</th>
                            <th>Tên nhà hàng</th>
                            <th>Chủ sở hữu (ID)</th>
                            <th>Trạng thái</th>
                            <th style={{ textAlign: 'right', paddingRight: '24px' }}>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {restaurants.length === 0 ? (
                            <tr><td colSpan={5}><div className="empty-state" style={{ padding: '40px 0' }}><p>Chưa có nhà hàng nào</p></div></td></tr>
                        ) : restaurants.map(r => (
                            <tr key={r.id}>
                                <td className="cell-id" style={{ paddingLeft: '24px', fontWeight: 600 }}>#{r.id}</td>
                                <td className="cell-primary" style={{ fontWeight: 600, color: '#0f172a' }}>{r.name}</td>
                                <td style={{ color: '#64748b' }}>{r.ownerId || '—'}</td>
                                <td>
                                    <span className={`badge ${r.isActive ? 'badge--success' : 'badge--warning'}`}>
                                        {r.isActive ? 'Đã duyệt (Active)' : 'Chờ duyệt (Pending)'}
                                    </span>
                                </td>
                                <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        {!r.isActive && (
                                            <button 
                                                title="Phê duyệt"
                                                onClick={() => handleApprove(r.id)}
                                                className="btn-action approve"
                                            >
                                                <Check size={16} strokeWidth={2} />
                                            </button>
                                        )}
                                        {r.isActive && (
                                            <button 
                                                title="Khóa hoạt động"
                                                onClick={() => handleBlock(r.id)}
                                                className="btn-action lock"
                                            >
                                                <Lock size={16} strokeWidth={2} />
                                            </button>
                                        )}
                                        <button 
                                            title="Xóa nhà hàng"
                                            onClick={() => handleDelete(r.id)}
                                            className="btn-action delete"
                                        >
                                            <Trash2 size={16} strokeWidth={2} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Custom Modal for Confirm / Alert */}
            {modal.isOpen && createPortal(
                <div className="modal-overlay-anim" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
                    zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}>
                    <div className="modal-content-anim" style={{
                        background: '#fff', borderRadius: '16px', width: '420px', maxWidth: '90%',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '24px 24px 16px', display: 'flex', gap: '16px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                                background: modal.variant === 'danger' ? '#fee2e2' : modal.variant === 'warning' ? '#fef3c7' : '#dcfce7',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {modal.variant === 'danger' && <AlertTriangle size={24} color="#ef4444" strokeWidth={2.5} />}
                                {modal.variant === 'warning' && <AlertTriangle size={24} color="#f59e0b" strokeWidth={2.5} />}
                                {modal.variant === 'success' && <Check size={24} color="#10b981" strokeWidth={2.5} />}
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#0f172a', fontWeight: 700 }}>
                                    {modal.title}
                                </h3>
                                <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                                    {modal.message}
                                </p>
                            </div>
                        </div>
                        <div style={{ padding: '16px 24px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            {modal.type === 'confirm' && (
                                <button 
                                    onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                                    style={{
                                        padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1',
                                        background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer'
                                    }}
                                >
                                    Hủy bỏ
                                </button>
                            )}
                            <button 
                                onClick={modal.type === 'confirm' ? modal.onConfirm : () => setModal(prev => ({ ...prev, isOpen: false }))}
                                style={{
                                    padding: '10px 16px', borderRadius: '8px', border: 'none',
                                    background: modal.variant === 'danger' ? '#ef4444' : modal.variant === 'warning' ? '#f59e0b' : '#10b981', 
                                    color: '#fff', fontWeight: 600, cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                {modal.type === 'confirm' ? 'Xác nhận' : 'Đóng'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default RestaurantsPage;
