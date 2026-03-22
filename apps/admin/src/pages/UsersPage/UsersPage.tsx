import { useEffect, useState } from 'react';
import adminService from '../../services/adminService';
import '../../styles/table.css';

const getRoleBadge = (role: string) => {
    const map: Record<string, string> = {
        SUPER_ADMIN: 'badge--purple',
        MERCHANT: 'badge--warning',
        CUSTOMER: 'badge--info',
        SHIPPER: 'badge--success',
    };
    return map[role] || 'badge--default';
};

const UsersPage = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await adminService.getUsers(0, 50);
                setUsers(res.result?.content || []);
                setTotal(res.result?.totalElements || 0);
            } catch (error) {
                console.error('Failed to fetch users', error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return <div className="page-loading">Đang tải dữ liệu...</div>;

    return (
        <div className="admin-page animate-in">
            <div className="page-header">
                <div>
                    <h2 className="page-title">Quản lý Người dùng</h2>
                    <p className="page-subtitle">Tổng cộng {total} tài khoản trong hệ thống</p>
                </div>
            </div>

            <div className="table-card">
                <div className="table-card-header">
                    <span className="table-card-title">Danh sách người dùng</span>
                    <span className="table-card-count">{total} bản ghi</span>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Họ và Tên</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr><td colSpan={5}><div className="empty-state"><p>Chưa có người dùng nào</p></div></td></tr>
                        ) : users.map(u => (
                            <tr key={u.id}>
                                <td className="cell-id">#{u.id}</td>
                                <td className="cell-primary">{u.email}</td>
                                <td>{u.lastName} {u.firstName}</td>
                                <td>{u.phone || '—'}</td>
                                <td><span className={`badge ${getRoleBadge(u.role)}`}>{u.role}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersPage;
