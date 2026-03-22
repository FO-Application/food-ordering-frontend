import api from '../utils/axiosConfig';

export interface PageInfo {
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface Page<T> extends PageInfo {
    content: T[];
}

export interface APIResponse<T> {
    result: T;
    message: string;
}

const adminService = {
    getUsers: async (page = 0, size = 10) => {
        const response = await api.get<APIResponse<Page<any>>>(`/user?page=${page}&size=${size}`);
        return response.data;
    },
    
    getRestaurants: async (page = 0, size = 10) => {
        const response = await api.get<APIResponse<Page<any>>>(`/restaurant?page=${page}&size=${size}`);
        return response.data;
    },
    
    getOrders: async (page = 0, size = 10) => {
        const response = await api.get<APIResponse<Page<any>>>(`/management/order/admin?page=${page}&size=${size}`);
        return response.data;
    },
    
    getTransactions: async (page = 0, size = 10) => {
        const response = await api.get<APIResponse<Page<any>>>(`/management/wallet/admin/transactions?page=${page}&size=${size}`);
        return response.data;
    },
    
    getDashboardStats: async (days = 7) => {
        const response = await api.get<APIResponse<any>>(`/management/order/admin/statistics?days=${days}`);
        return response.data;
    },

    
    approveRestaurant: async (id: number) => {
        const response = await api.put(`/restaurant/admin/${id}/approve`);
        return response.data;
    },

    blockRestaurant: async (id: number) => {
        const response = await api.put(`/restaurant/admin/${id}/block`);
        return response.data;
    },

    deleteRestaurant: async (id: number) => {
        const response = await api.delete(`/restaurant/${id}`);
        return response.data;
    },

    getSystemRules: async () => {
        const response = await api.get<APIResponse<any>>(`/system/rules`);
        return response.data;
    },
    updateSystemRules: async (rules: any) => {
        const response = await api.put<APIResponse<any>>(`/system/rules`, rules);
        return response.data;
    },
    getPendingRestaurantsCount: async () => {
        const response = await api.get<APIResponse<number>>(`/restaurant/admin/pending-count`);
        return response.data;
    },
    getAdminNotifications: async () => {
        const response = await api.get<APIResponse<any[]>>(`/notification/topic/admin-notifications`);
        return response.data;
    },
    markNotificationAsRead: async (id: number) => {
        const response = await api.put(`/notification/${id}/read`);
        return response.data;
    }
};

export default adminService;
