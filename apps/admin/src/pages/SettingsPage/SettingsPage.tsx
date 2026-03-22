import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Percent, Truck, Ticket, Save, ShieldAlert, Check, AlertTriangle } from 'lucide-react';
import './SettingsPage.css';

import adminService from '../../services/adminService';

const SettingsPage = () => {
    // State for config rules
    const [commission, setCommission] = useState('0');
    const [driverCommission, setDriverCommission] = useState('0');
    const [baseFee, setBaseFee] = useState('0');
    const [perKmFee, setPerKmFee] = useState('0');
    const [autoApprove, setAutoApprove] = useState(false);

    const [modal, setModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: 'success' | 'danger';
    }>({ isOpen: false, title: '', message: '', variant: 'success' });

    const showAlert = (title: string, message: string, variant: 'success' | 'danger') => {
        setModal({ isOpen: true, title, message, variant });
    };

    React.useEffect(() => {
        const fetchRules = async () => {
            try {
                const res = await adminService.getSystemRules();
                if (res.result) {
                    setCommission(res.result.platformFeePercentage?.toString() || '0');
                    setDriverCommission(res.result.driverFeePercentage?.toString() || '0');
                    setBaseFee(res.result.baseDeliveryFee?.toString() || '0');
                    setPerKmFee(res.result.perKmFee?.toString() || '0');
                    setAutoApprove(!!res.result.autoApproveRestaurant);
                }
            } catch (e) { console.error('Failed to load rules', e); }
        };
        fetchRules();
    }, []);

    const handleSave = async (section: string) => {
        try {
            await adminService.updateSystemRules({
                platformFeePercentage: parseFloat(commission || '0'),
                driverFeePercentage: parseFloat(driverCommission || '0'),
                baseDeliveryFee: parseFloat(baseFee || '0'),
                perKmFee: parseFloat(perKmFee || '0'),
                autoApproveRestaurant: autoApprove
            });
            showAlert('Lưu cấu hình thành công', `Đã lưu cấu hình [${section}] thành công!`, 'success');
        } catch (e) {
            showAlert('Lỗi lưu cấu hình', 'Không thể lưu cấu hình: ' + (e as any).message, 'danger');
        }
    };

    return (
        <div className="admin-page animate-in settings-page">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Cấu hình Hệ thống (Rules)</h2>
                    <p className="page-subtitle">Quản lý phần trăm chiết khấu, giá vận chuyển và các quy tắc hệ thống.</p>
                </div>
            </div>

            <div className="settings-grid">
                {/* Commission Rules */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-icon"><Percent size={20} /></div>
                        <div>
                            <h3 className="card-title">Cấu hình Phí & Hoa hồng</h3>
                            <p className="card-subtitle">Chiết khấu hệ thống thu từ đối tác nhà hàng</p>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label>Phần trăm chiết khấu (Nhà Hàng)</label>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    value={commission}
                                    onChange={(e) => setCommission(e.target.value)}
                                    min="0" max="100"
                                />
                                <span className="suffix">%</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Phần trăm chiết khấu (Tài Xế)</label>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    value={driverCommission}
                                    onChange={(e) => setDriverCommission(e.target.value)}
                                    min="0" max="100"
                                />
                                <span className="suffix">%</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, marginTop: '8px' }}>
                            Mức phí thu từ đơn hàng của quán: {commission}%. Vận chuyển từ Shipper: {driverCommission}%.
                        </p>
                    </div>
                </div>

                {/* Delivery Fee Rules */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-icon"><Truck size={20} /></div>
                        <div>
                            <h3 className="card-title">Công thức Giá Vận Chuyển</h3>
                            <p className="card-subtitle">Quy tắc tính phí ship tự động theo khoảng cách (km)</p>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="form-group">
                            <label>Phí ship cơ bản (3km đầu tiên)</label>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    value={baseFee}
                                    onChange={(e) => setBaseFee(e.target.value)}
                                />
                                <span className="suffix">VNĐ</span>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Phụ phí mỗi km tiếp theo</label>
                            <div className="input-with-suffix">
                                <input
                                    type="number"
                                    value={perKmFee}
                                    onChange={(e) => setPerKmFee(e.target.value)}
                                />
                                <span className="suffix">VNĐ/km</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vouchers Placeholder */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-icon"><Ticket size={20} /></div>
                        <div>
                            <h3 className="card-title">Chiến dịch Khuyến Mãi</h3>
                            <p className="card-subtitle">Quản lý mã Freeship / Giảm giá của sàn</p>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="empty-state" style={{ padding: '20px 0', border: 'none' }}>
                            <Ticket size={32} color="#cbd5e1" style={{ marginBottom: '12px' }} />
                            <p>Tính năng tạo Voucher toàn sàn đang được phát triển.</p>
                        </div>
                    </div>
                </div>

                {/* Automation Rules */}
                <div className="settings-card">
                    <div className="card-header">
                        <div className="card-icon"><ShieldAlert size={20} /></div>
                        <div>
                            <h3 className="card-title">Quyền & Tự động hóa</h3>
                            <p className="card-subtitle">Cấu hình thao tác hệ thống tự động</p>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="toggle-switch" onClick={() => setAutoApprove(!autoApprove)}>
                            <div>
                                <div className="toggle-label">Tự động duyệt nhà hàng mới</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                                    Bỏ qua bước duyệt thủ công của Admin
                                </div>
                            </div>
                            <div className={`toggle-btn ${autoApprove ? 'active' : ''}`}>
                                <div className="toggle-circle"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="settings-footer" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px', marginBottom: '16px' }}>
                <button className="btn-save" onClick={() => handleSave('Tất cả cấu hình')} style={{ padding: '10px 24px', fontSize: '1rem', borderRadius: '8px' }}>
                    <Save size={20} /> Lưu Tất Cả Cấu Hình
                </button>
            </div>

            {/* Custom Modal for Alert */}
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
                                background: modal.variant === 'danger' ? '#fee2e2' : '#dcfce7',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {modal.variant === 'danger' && <AlertTriangle size={24} color="#ef4444" strokeWidth={2.5} />}
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
                        <div style={{ padding: '16px 24px', background: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => setModal(prev => ({ ...prev, isOpen: false }))}
                                style={{
                                    padding: '10px 16px', borderRadius: '8px', border: 'none',
                                    background: modal.variant === 'danger' ? '#ef4444' : '#10b981', 
                                    color: '#fff', fontWeight: 600, cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default SettingsPage;
