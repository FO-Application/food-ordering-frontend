import { createPortal } from 'react-dom';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Users, ShoppingCart, Receipt, LogOut, Bell, ChevronDown, ConciergeBell, Settings, TrendingUp, Bike } from 'lucide-react';
import './AdminLayout.css';
import { useEffect, useState, useRef } from 'react';
import adminService from '../../services/adminService';

const navItems = [
    { path: '/dashboard', label: 'Tổng Quan', icon: LayoutDashboard },
    { path: '/orders', label: 'Đơn hàng', icon: ShoppingCart },
    // { path: '/delivery', label: 'Giao hàng', icon: Bike }, // If needed in future
    { path: '/restaurants', label: 'Nhà hàng', icon: Store },
    { path: '/transactions', label: 'Giao dịch', icon: Receipt }, /* Analytics/Transactions */
    { path: '/users', label: 'Khách hàng', icon: Users },
    { path: '/settings', label: 'Cấu hình hệ thống', icon: Settings },
];

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [pendingCount, setPendingCount] = useState(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotif, setShowNotif] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/login');
        
        const fetchLayoutData = async () => {
            try {
                const countRes = await adminService.getPendingRestaurantsCount();
                setPendingCount(countRes.result || 0);
                
                const notifRes = await adminService.getAdminNotifications();
                setNotifications(notifRes.result || []);
            } catch(e) { console.error('Error fetching admin layout data', e); }
        };
        fetchLayoutData();
        const interval = setInterval(fetchLayoutData, 30000); // 30s polling
        return () => clearInterval(interval);
    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotif(false);
            }
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        try {
            await adminService.markNotificationAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch(err) { console.error(err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const getPageTitle = () => {
        const item = navItems.find(n => location.pathname.startsWith(n.path));
        return item ? item.label : 'Tổng Quan';
    };

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <span style={{ color: '#ffffff', fontSize: '1.5rem', letterSpacing: '-0.5px', fontWeight: 800 }}>
                            Fast<span style={{ color: '#e2f5ea' }}>Boss</span>
                        </span>
                    </div>
                </div>

                <nav className="sidebar-nav" style={{ paddingTop: '16px' }}>
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
                                }
                            >
                                <Icon size={20} strokeWidth={2} />
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {item.path === '/restaurants' && pendingCount > 0 && (
                                    <span style={{ 
                                        background: '#ef4444', color: 'white', fontSize: '0.75rem', 
                                        fontWeight: 600, padding: '2px 8px', borderRadius: '12px' 
                                    }}>
                                        {pendingCount}
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </aside>

            <div className="main-wrapper">
                <header className="topbar">
                    <div className="topbar-left">
                        <div className="topbar-title">
                            <span style={{ color: '#94a3b8', fontWeight: 500 }}>Hệ thống</span>
                            <span style={{ color: '#cbd5e1', margin: '0 8px' }}>/</span>
                            <span style={{ color: '#0f172a', fontWeight: 600 }}>{getPageTitle()}</span>
                        </div>
                    </div>
                    <div className="topbar-right">
                        <div className="notification-wrapper" ref={notifRef} style={{ position: 'relative' }}>
                            <button 
                                style={{ color: '#475569', padding: '8px', cursor: 'pointer', background: 'transparent', border: 'none', position: 'relative' }}
                                onClick={() => setShowNotif(!showNotif)}
                            >
                                <Bell size={20} strokeWidth={2} />
                                {notifications.filter(n => !n.isRead).length > 0 && (
                                    <span style={{
                                        position: 'absolute', top: '4px', right: '4px', background: '#ef4444',
                                        color: 'white', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {notifications.filter(n => !n.isRead).length}
                                    </span>
                                )}
                            </button>
                            
                            {showNotif && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '300px',
                                    background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 1000, overflow: 'hidden'
                                }}>
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#0f172a' }}>
                                        Thông báo ({notifications.filter(n => !n.isRead).length} chưa đọc)
                                    </div>
                                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>Chưa có thông báo nào</div>
                                        ) : notifications.map(n => (
                                            <div key={n.id} style={{
                                                padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
                                                background: n.isRead ? 'white' : '#f8fafc', cursor: 'pointer', opacity: n.isRead ? 0.7 : 1
                                            }} onClick={(e) => { if(!n.isRead) markAsRead(e, n.id); navigate(n.orderId ? `/orders` : `/restaurants`); setShowNotif(false); }}>
                                                <div style={{ fontSize: '0.85rem', fontWeight: n.isRead ? 500 : 600, color: '#0f172a', marginBottom: '4px' }}>{n.title}</div>
                                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{n.body}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '6px' }}>{new Date(n.createdAt).toLocaleString('vi-VN')}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="topbar-user" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowUserMenu(!showUserMenu)} ref={userMenuRef}>
                            <div className="topbar-user-avatar">
                                <Users size={16} color="#64748b" />
                            </div>
                            <div className="topbar-user-info">
                                <span className="topbar-user-name">Admin</span>
                                <span className="topbar-user-role">Super Admin</span>
                            </div>
                            <ChevronDown size={16} color="#64748b" style={{ marginLeft: '4px' }} />
                            
                            {showUserMenu && (
                                <div style={{
                                    position: 'absolute', top: 'calc(100% + 12px)', right: 0, width: '200px',
                                    background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', zIndex: 1000, overflow: 'hidden'
                                }}>
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>Admin</div>
                                        <div style={{ color: '#64748b' }}>Super Admin</div>
                                    </div>
                                    <div style={{ padding: '8px' }}>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setShowUserMenu(false); setShowProfileModal(true); }}
                                            className="user-menu-item" 
                                            style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem', color: '#334155', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            Xem Profile
                                        </button>
                                    </div>
                                    <div style={{ padding: '8px', borderTop: '1px solid #f1f5f9' }}>
                                        <button onClick={handleLogout} className="user-menu-item" style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: '8px', fontSize: '0.9rem', color: '#dc2626', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>
                                            <LogOut size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />
                                            Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <main className="main-content">
                    <Outlet />
                </main>
            </div>

            {/* Profile Modal */}
            {showProfileModal && createPortal(
                <div className="modal-overlay-anim" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)',
                    zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center'
                }} onClick={() => setShowProfileModal(false)}>
                    <div className="modal-content-anim" style={{
                        background: '#fff', borderRadius: '16px', width: '400px', maxWidth: '90%',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', overflow: 'hidden'
                    }} onClick={e => e.stopPropagation()}>
                        <div style={{ background: '#f8fafc', padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Users size={32} color="#64748b" />
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#0f172a' }}>Admin Boss</h3>
                                    <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>Super Admin</span>
                                </div>
                            </div>
                            <button onClick={() => setShowProfileModal(false)} style={{ color: '#94a3b8', fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
                        </div>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>Email</label>
                                <div style={{ color: '#0f172a', fontWeight: 500 }}>admin@fastboss.com</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px', fontWeight: 500 }}>Số điện thoại</label>
                                <div style={{ color: '#0f172a', fontWeight: 500 }}>+84 123 456 789</div>
                            </div>
                            <div style={{ marginTop: '16px' }}>
                                <button style={{ 
                                    width: '100%', padding: '12px', background: 'var(--accent)', color: 'white', 
                                    border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}>
                                    <Settings size={18} /> Thay đổi thông tin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default AdminLayout;
