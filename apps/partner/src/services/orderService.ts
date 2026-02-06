import api from '../utils/axiosConfig';

// ==================== RESPONSE TYPES ====================

export interface OrderItemOptionResponse {
    id: number;
    optionName: string;
    priceAdjustment: number;
}

export interface OrderItemResponse {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    options: OrderItemOptionResponse[];
}

export interface OrderResponse {
    id: number;
    userId: number;
    merchantId: number;
    merchantName: string;
    merchantLogo: string;
    merchantLatitude: number;
    merchantLongitude: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    deliveryAddress: string;
    deliveryLatitude: number;
    deliveryLongitude: number;
    distanceKm: number;
    subTotal: number;
    shippingFee: number;
    discountAmount: number;
    grandTotal: number;
    descriptionOrder: string;
    orderStatus: string;
    paymentMethod: string;
    createdAt: string;
    updatedAt: string;
    orderItems: OrderItemResponse[];
    review: any;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// ==================== ORDER STATUS ====================
export const ORDER_STATUS = {
    CREATED: 'CREATED',
    PAID: 'PAID',
    PREPARING: 'PREPARING',
    READY: 'READY',
    WAITING_FOR_PICKUP: 'WAITING_FOR_PICKUP',
    DELIVERING: 'DELIVERING',
    COMPLETED: 'COMPLETED',
    CANCELED: 'CANCELED'
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
    CREATED: 'Đơn mới',
    PAID: 'Đã thanh toán',
    PREPARING: 'Đang chuẩn bị',
    READY: 'Sẵn sàng giao',
    WAITING_FOR_PICKUP: 'Chờ lấy hàng',
    DELIVERING: 'Đang giao',
    COMPLETED: 'Hoàn thành',
    CANCELED: 'Đã hủy'
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
    CREATED: '#3b82f6',
    PAID: '#8b5cf6',
    PREPARING: '#f59e0b',
    READY: '#10b981',
    WAITING_FOR_PICKUP: '#06b6d4',
    DELIVERING: '#6366f1',
    COMPLETED: '#22c55e',
    CANCELED: '#ef4444'
};

// ==================== SERVICE ====================

const orderService = {
    // Lấy danh sách đơn hàng của quán
    getMerchantOrders: async (merchantId: number, status?: string, page = 0, size = 10): Promise<any> => {
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('size', String(size));
        if (status && status.trim() !== '') {
            params.append('status', status);
        }

        const response = await api.get(`/management/order/merchant/${merchantId}?${params.toString()}`);
        return response.data;
    },

    // Xác nhận đơn hàng (Bắt đầu nấu)
    confirmOrder: async (orderId: number): Promise<any> => {
        const response = await api.put(`/management/order/merchant/${orderId}/confirm`);
        return response.data;
    },

    // Báo món đã làm xong (Sẵn sàng giao)
    markOrderReady: async (orderId: number): Promise<any> => {
        const response = await api.put(`/management/order/merchant/${orderId}/ready`);
        return response.data;
    },

    // Hủy đơn hàng
    cancelOrder: async (orderId: number): Promise<any> => {
        const response = await api.put(`/management/order/merchant/${orderId}/cancel`);
        return response.data;
    },

    // Lấy thống kê nhà hàng
    getMerchantStats: async (merchantId: number): Promise<APIResponse<MerchantStatsResponse>> => {
        const response = await api.get(`/management/order/merchant/${merchantId}/stats`);
        return response.data;
    }
};

export interface MerchantStatsResponse {
    ordersToday: number;
    totalRevenue: number;
    averageRating: number;
    menuItems: number;
}

export interface APIResponse<T> {
    code: number;
    message: string;
    result: T;
}

export default orderService;
