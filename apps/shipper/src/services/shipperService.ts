import api from '../utils/axiosConfig';

const shipperService = {
    // Update location (and set online)
    updateLocation: async (lat: number, lon: number) => {
        // API: POST /delivery/shippers/location?lat=...&lon=...
        const response = await api.post<any>(`/delivery/shippers/location?lat=${lat}&lon=${lon}`);
        return response.data;
    },

    // Go Offline
    goOffline: async () => {
        const response = await api.post<any>('/delivery/shippers/offline');
        return response.data;
    },

    // Accept Order
    acceptOrder: async (orderId: number) => {
        const response = await api.post<any>(`/delivery/shippers/accept?orderId=${orderId}`);
        return response.data;
    },

    // Picked Up
    pickedUpOrder: async (orderId: number) => {
        const response = await api.post<any>(`/delivery/shippers/picked-up?orderId=${orderId}`);
        return response.data;
    },

    // Complete Order
    completeOrder: async (orderId: number) => {
        const response = await api.post<any>(`/delivery/shippers/complete?orderId=${orderId}`);
        return response.data;
    },
    getOrderDetails: async (orderId: number) => {
        // Note: The backend endpoint is /api/v1/shipping/order/{id}
        const response = await api.get<any>(`/shipping/order/${orderId}`);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get<any>('/user/me');
        return response.data;
    },

    // Get Shipper Profile (Vehicle, Online Status)
    getShipperProfile: async () => {
        const response = await api.get<any>('/delivery/shippers/profile');
        return response.data;
    },

    // Register Shipper Info
    registerShipper: async (data: { vehicleNumber: string; vehicleType: string }) => {
        const response = await api.post<any>('/delivery/shippers/register', data);
        return response.data;
    },

    // Poll Pending Orders
    getPendingOrders: async () => {
        const response = await api.get<any>('/delivery/shippers/pending-orders');
        return response.data;
    },

    // Deposit Money (Top-up Wallet)
    deposit: async (amount: number) => {
        const response = await api.post<any>(`/delivery/shippers/wallet/deposit?amount=${amount}`);
        return response.data;
    },

    // Get Wallet Stats
    getWalletStats: async () => {
        const response = await api.get<any>('/delivery/shippers/wallet');
        return response.data;
    }
};

export default shipperService;
