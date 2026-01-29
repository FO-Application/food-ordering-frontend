import api from '../utils/axiosConfig';

// ==================== RESPONSE TYPES ====================

export interface ReviewResponse {
    id: number;
    userId: number;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

// ==================== SERVICE ====================

const reviewService = {
    // Lấy danh sách đánh giá của quán
    getReviewsByMerchant: async (merchantId: number, page = 0, size = 10): Promise<any> => {
        const response = await api.get(`/review/merchant/${merchantId}?page=${page}&size=${size}`);
        return response.data;
    },

    // Lấy đánh giá của một đơn hàng
    getReviewByOrder: async (orderId: number): Promise<any> => {
        const response = await api.get(`/review/order/${orderId}`);
        return response.data;
    }
};

export default reviewService;
