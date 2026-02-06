import { useEffect, useState } from 'react';
import userService from '../../../../services/userService';

const RoleGuard = ({ children }: { children: React.ReactNode }) => {
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            try {
                const response = await userService.getCurrentUser();
                if (response && response.result) {
                    const role = response.result.role;
                    console.log('[RoleGuard] Checking role:', role);

                    if (role === 'MERCHANT') {
                        window.location.href = 'http://localhost:3003';
                        return;
                    }
                    if (role === 'SHIPPER') {
                        window.location.href = 'http://localhost:3004';
                        return;
                    }
                }
            } catch (error) {
                // If 401/403 or network error, let them stay (guest mode) or handle elsewhere
                console.error('[RoleGuard] Check failed:', error);
            } finally {
                setChecking(false);
            }
        };

        checkRole();
    }, []);

    if (checking) return null; // Or a loading spinner
    return <>{children}</>;
};

export default RoleGuard;
